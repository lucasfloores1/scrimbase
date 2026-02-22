import { BadRequestException, Inject, Injectable, type LoggerService } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ConfigService } from "@nestjs/config";

import { LlmVisionService } from "../../common/llm/llm-vision.service";
import { CreateScrimDto } from "../dto/create-scrim.dto";
import { ScrimOutcome } from "../enums/scrim-outcome.enum";
import { ScrimType } from "../enums/scrim-type.enum";
import { ParseScrimScreenshotResponseDto } from "./dto/parse-scrim-screenshot-response.dto";
import { ScrimParseAttempt, ScrimParseAttemptStatus } from "./schemas/scrim-parse-attempt.schema";
import { LlmScrimExtractionDto } from "./dto/llm-scrim-extraction.dto";

@Injectable()
export class ScrimScreenshotParserService {
  constructor(
    private readonly llmVision: LlmVisionService,
    private readonly config: ConfigService,
    @InjectModel(ScrimParseAttempt.name) private readonly attemptModel: Model<ScrimParseAttempt>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  async parseScreenshot(args: {
    teamId: string;
    userId: string;
    file: Express.Multer.File;
    type: ScrimType;
    map: string;
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

    // 4) Validate LLM JSON with DTO (must allow enemyStats)
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

    // 5) Build draft (enemyComposition derived from enemyStats)
    const enemyComposition = this.buildEnemyComposition(instance.enemyStats);

    const draft: CreateScrimDto = {
      type,
      map,
      teamRounds: instance.teamRounds,
      enemyRounds: instance.enemyRounds,
      teamStats: instance.teamStats,
      enemyComposition,
    };

    // 6) Outcome simple (type validations happen on final POST /scrims)
    const draftWithOutcome = {
      ...draft,
      outcome: this.computeOutcome(draft.teamRounds, draft.enemyRounds),
    };

    // warnings (optional)
    const warnings: string[] = [];
    const unknownEnemy = enemyComposition.filter((a) => a === "UNKNOWN").length;
    if (unknownEnemy > 0) warnings.push(`Enemy agents include UNKNOWN (${unknownEnemy}/5). Please verify.`);
    const unknownTeam = instance.teamStats.filter((p) => (p.agent ?? "").toUpperCase() === "UNKNOWN").length;
    if (unknownTeam > 0) warnings.push(`Team agents include UNKNOWN (${unknownTeam}/5). Please verify.`);

    return {
      rawOutputId: attempt._id.toString(),
      warnings,
      draft: draftWithOutcome,
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
    type: string;
    map: string;
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

  private buildEnemyComposition(enemyStats: { agent: string }[]): string[] {
    return enemyStats.map((p) => this.canonicalizeAgentName(p.agent));
  }

  private canonicalizeAgentName(agent: string): string {
    const a = (agent ?? "").trim();
    const upper = a.toUpperCase();

    if (upper === "KAYO" || upper === "KAY-O") return "KAY/O";
    if (upper === "KILL JOY") return "Killjoy";
    if (upper === "UNKNOWN") return "UNKNOWN";

    return a.length ? a[0].toUpperCase() + a.slice(1) : "UNKNOWN";
  }
}