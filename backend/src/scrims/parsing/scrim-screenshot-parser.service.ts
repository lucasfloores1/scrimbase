import { BadRequestException, Inject, Injectable, type LoggerService } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ConfigService } from "@nestjs/config";

import { LlmVisionService } from "../../common/llm/llm-vision.service";
import { ScrimOutcome } from "../enums/scrim-outcome.enum";
import { ScrimType } from "../enums/scrim-type.enum";
import { ParseScrimScreenshotResponseDto } from "./dto/parse-scrim.response.dto";
import { ScrimParseAttempt, ScrimParseAttemptStatus } from "./schemas/scrim-parse-attempt.schema";
import { LlmScrimExtractionDto } from "./dto/llm-scrim-extraction.dto";
import { TeamMemberService } from "src/teams/team-member.service";
import { canonicalizeAgentName } from "src/common/utils/valorant-agent.utils";
import { ValorantMap } from "src/common/enums/valorant-map.enum";
import { ValorantAgent } from "src/common/enums/valorant-agent.enum";

@Injectable()
export class ScrimScreenshotParserService {
  constructor(
    private readonly llmVision: LlmVisionService,
    private readonly config: ConfigService,
    private readonly teamMemberService: TeamMemberService,
    @InjectModel(ScrimParseAttempt.name) private readonly attemptModel: Model<ScrimParseAttempt>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  async parseScreenshot(args: {
    teamId: string;
    userId: string;
    file: Express.Multer.File;
    type: ScrimType;
    map: ValorantMap;
  }): Promise<ParseScrimScreenshotResponseDto> {
    const { type, map, teamId, userId, file } = args;

    this.logger.log(
      `Parsing scrim screenshot teamId=${teamId} userId=${userId} mime=${file.mimetype} size=${file.size}`,
      "ScrimScreenshotParserService",
    );

    const prompt = this.buildPrompt();

    // 1) Call Gemini
    let visionRes: { provider: string; model: string; rawText: string };
    try {
      visionRes = await this.llmVision.extractScrimFromScreenshot({
        image: file.buffer,
        mimeType: file.mimetype,
        prompt,
        teamId,
        userId,
      });
    } catch (err: any) {
      let rawOutputId: string | undefined;

      try {
        const attempt = await this.saveAttempt({
          teamId,
          userId,
          type,
          map,
          status: ScrimParseAttemptStatus.FAILED_PROVIDER,
          provider: "gemini",
          model: this.config.get<string>("gemini.model") || "unknown",
          rawText: `[PROVIDER_ERROR] ${err?.name ?? "Error"}: ${err?.message ?? "Unknown"}`,
          errorMeta: { name: err?.name, message: err?.message },
        });

        rawOutputId = attempt._id.toString();
      } catch (dbErr: any) {
        this.logger.error(`Failed saving parse attempt: ${dbErr?.message}`, dbErr?.stack);
      }

      throw new BadRequestException({
        message: err?.name === "AbortError" ? "LLM request timed out" : "Failed to parse screenshot (provider error)",
        rawOutputId,
      });
    }

    // 2) Save raw output always
    const attempt = await this.saveAttempt({
      teamId,
      userId,
      type,
      map,
      status: ScrimParseAttemptStatus.SUCCESS,
      provider: visionRes.provider,
      model: visionRes.model,
      rawText: visionRes.rawText,
    });

    // 3) Parse JSON
    const extractedJson = this.tryParseJson(visionRes.rawText);
    if (!extractedJson) {
      await this.attemptModel.updateOne(
        { _id: attempt._id },
        { status: ScrimParseAttemptStatus.FAILED_JSON, errorMeta: { message: "JSON parse failed" } },
      );

      throw new BadRequestException({
        message: "LLM did not return valid JSON",
        rawOutputId: attempt._id.toString(),
      });
    }

    // 4) Validate LLM JSON with DTO
    // IMPORTANT: LlmScrimExtractionDto must include enemyStats, teamStats, teamRounds, enemyRounds
    const instance = plainToInstance(LlmScrimExtractionDto, extractedJson);
    const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });

    if (errors.length > 0) {
      await this.attemptModel.updateOne(
        { _id: attempt._id },
        {
          status: ScrimParseAttemptStatus.FAILED_VALIDATION,
          errorMeta: {
            validationErrors: errors.map((e) => ({
              property: e.property,
              constraints: e.constraints,
              children: e.children?.length ? e.children : undefined,
            })),
          },
        },
      );

      throw new BadRequestException({
        message: "LLM JSON failed validation",
        rawOutputId: attempt._id.toString(),
      });
    }

    // 5) Match teamStats displayName -> team member riotId (and set userId)
    const teamMembers = await this.teamMemberService.getTeamMembersForMatching(teamId);
    const matchResult = this.matchTeamStatsToMembers(instance.teamStats, teamMembers);

    const matchedTeamStats = matchResult.teamStats.map((p) => ({
      userId: p.userId ?? undefined,
      displayName: p.displayName,
      agent: canonicalizeAgentName(p.agent),
      kills: p.kills,
      deaths: p.deaths,
      assists: p.assists,
      acs: p.acs,
    }));
    const warnings = [...matchResult.warnings];

    // 6) Build enemyComposition from enemyStats
    const enemyComposition = this.buildEnemyComposition(instance.enemyStats);

    // 7) Build draft as a plain object matching DraftScrimResponseDto
    const draft = {
      type,
      map,
      teamRounds: instance.teamRounds,
      enemyRounds: instance.enemyRounds,
      outcome: this.computeOutcome(instance.teamRounds, instance.enemyRounds),
      teamStats: matchedTeamStats,
      enemyComposition,
    };

    // warnings: unknown agents
    const unknownEnemy = enemyComposition.filter((a) => a === "UNKNOWN").length;
    if (unknownEnemy > 0) warnings.push(`Enemy agents include UNKNOWN (${unknownEnemy}/5). Please verify.`);
    const unknownTeam = matchedTeamStats.filter((p) => (p.agent ?? "").toUpperCase() === "UNKNOWN").length;
    if (unknownTeam > 0) warnings.push(`Team agents include UNKNOWN (${unknownTeam}/5). Please verify.`);

    // warnings: unknown player mapping
    const unknownPlayers = matchedTeamStats.filter((p) => p.displayName === "UNKNOWN" && !p.userId).length;
    if (unknownPlayers > 0) warnings.push(`Some team players could not be matched (${unknownPlayers}/5). Please assign.`);

    return {
      rawOutputId: attempt._id.toString(),
      warnings,
      draft,
    };
  }

  private buildPrompt() {
    return `
You are reading a Valorant scoreboard screenshot.

Color rules:
- LIGHT BLUE (cyan) rows = OUR team
- RED rows = ENEMY team
- Yellow highlight is irrelevant

Extract ONLY valid JSON with this schema:
{
  "teamRounds": number,
  "enemyRounds": number,
  "teamStats": [
    { "displayName": string, "agent": string, "kills": number, "deaths": number, "assists": number, "acs": number }
  ],
  "enemyStats": [
    { "displayName": string, "agent": string, "kills": number, "deaths": number, "assists": number, "acs": number }
  ]
}

Rules:
- Exactly 5 players per team.
- Agent MUST be taken ONLY from the portrait icon at the left of each row.
- Prefer these exact agent names: Astra, Breach, Brimstone, Chamber, Clove, Cypher, Deadlock, Fade, Gekko, Harbor, Iso, Jett, KAY/O, Killjoy, Miks, Neon, Omen, Phoenix, Raze, Reyna, Sage, Skye, Sova, Tejo, Veto, Viper, Vyse, Waylay, Yoru.
- NEVER guess agents. If unsure, write "UNKNOWN".
- Return ONLY valid JSON. No markdown. No extra text.
`;
  }

  private computeOutcome(teamRounds: number, enemyRounds: number): ScrimOutcome {
    if (teamRounds === enemyRounds) return ScrimOutcome.DRAW;
    return teamRounds > enemyRounds ? ScrimOutcome.WIN : ScrimOutcome.LOSS;
  }

  private tryParseJson(rawText: string): any | null {
    try {
      return JSON.parse(rawText);
    } catch {}

    const firstBrace = rawText.indexOf("{");
    const lastBrace = rawText.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      const maybeJson = rawText.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(maybeJson);
      } catch {}
    }
    return null;
  }

  private async saveAttempt(args: {
    teamId: string;
    userId: string;
    type: ScrimType;
    map: ValorantMap;
    status: ScrimParseAttemptStatus;
    provider: string;
    model: string;
    rawText: string;
    errorMeta?: Record<string, any>;
  }) {
    const ttlDays = this.config.get<number>("gemini.rawTtlDays") ?? 7;
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    return this.attemptModel.create({
      teamId: new Types.ObjectId(args.teamId),
      userId: new Types.ObjectId(args.userId),
      status: args.status,
      provider: args.provider,
      model: args.model,
      rawText: args.rawText,
      errorMeta: args.errorMeta,
      expiresAt,
    });
  }

  private buildEnemyComposition(enemyStats: { agent: string }[]): ValorantAgent[] {
    return enemyStats.map((p) => canonicalizeAgentName(p.agent));
  }

  /**
   * Premier Teams formatting:
   * - Scoreboard: "TEAM | Player" => we want "Player"
   * - RiotID: "Player#LAS" => we want "Player"
   */
  private matchTeamStatsToMembers(teamStats: any[], teamMembers: any[]): { teamStats: any[]; warnings: string[] } {
    const warnings: string[] = [];

    const candidates = teamMembers
      .map((m) => {
        const user = m.userId;

        const riotId: string | undefined = user?.riotId;
        const altAccountId: string | undefined = user?.altAccountId;

        const userId: string | undefined = user?._id?.toString?.() ?? user?._id;

        const primaryName = riotId ? this.extractRiotName(riotId) : "";
        const primaryNameNorm = this.normalizeSimple(primaryName);

        const altName = altAccountId ? this.extractRiotName(altAccountId) : "";
        const altNameNorm = this.normalizeSimple(altName);

        return { userId, riotId, primaryNameNorm, altNameNorm };
      })
      .filter((c) => c.userId && (c.primaryNameNorm || c.altNameNorm));

    const usedUserIds = new Set<string>();

    const out = teamStats.map((stat) => {
      const original = (stat.displayName ?? "").trim();
      const scoreboardName = this.normalizeSimple(this.extractScoreboardName(original));

      let best: { userId: string; riotId?: string; score: number } | null = null;

      for (const c of candidates) {
        if (!c.userId) continue;
        if (usedUserIds.has(c.userId)) continue;

        const primary = c.primaryNameNorm ?? "";
        const alt = c.altNameNorm ?? "";

        // 1) exact match (primary or alt)
        if (scoreboardName && (scoreboardName === primary || scoreboardName === alt)) {
          best = { userId: c.userId, riotId: c.riotId, score: 1 };
          break;
        }

        // 2) fuzzy fallback (best of primary/alt)
        const score = Math.max(this.similarity(scoreboardName, primary), this.similarity(scoreboardName, alt));
        if (!best || score > best.score) best = { userId: c.userId, riotId: c.riotId, score };
      }

      if (best && best.score >= 0.85) {
        usedUserIds.add(best.userId);

        return {
          ...stat,
          userId: best.userId,
          // ✅ always show MAIN riotId, even if match was by alt
          displayName: best.riotId ?? original,
        };
      }

      warnings.push(`No team member match for "${original}" -> UNKNOWN (expected riotName match after "|").`);

      return {
        ...stat,
        userId: undefined,
        displayName: "UNKNOWN",
      };
    });

    return { teamStats: out, warnings };
  }

  private extractScoreboardName(displayName: string): string {
    if (!displayName) return "";
    // "TEAM | Player" => "Player"
    const parts = displayName.split("|");
    const rightSide = parts.length > 1 ? parts[1] : parts[0];
    return rightSide.trim().toLowerCase();
  }

  private extractRiotName(riotId: string): string {
    if (!riotId) return "";
    // "Player#LAS" => "Player"
    return riotId.split("#")[0].trim().toLowerCase();
  }

  private normalizeSimple(input: string): string {
    return (input ?? "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "");
  }

  private similarity(a: string, b: string): number {
    if (!a || !b) return 0;
    if (a === b) return 1;
    const dist = this.levenshtein(a, b);
    const maxLen = Math.max(a.length, b.length);
    return maxLen === 0 ? 0 : 1 - dist / maxLen;
  }

  private levenshtein(a: string, b: string): number {
    const m = a.length;
    const n = b.length;

    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }

    return dp[m][n];
  }
}