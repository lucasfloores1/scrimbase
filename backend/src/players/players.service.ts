import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  type LoggerService,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { Scrim } from "src/scrims/schemas/scrim.schema";
import { ScrimOutcome } from "src/scrims/enums/scrim-outcome.enum";
import { ScrimType } from "src/scrims/enums/scrim-type.enum";
import { ValorantMap } from "src/common/enums/valorant-map.enum";
import { ValorantAgent } from "src/common/enums/valorant-agent.enum";
import { TeamMemberService } from "src/teams/team-member.service";
import {
  PlayerCombatOverviewDto,
  PlayerStatsResponseDto,
} from "./dto/player-stats.response.dto";

type CombatAgg = {
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  kills: number;
  deaths: number;
  assists: number;
  acs: number;
};

type AgentAgg = CombatAgg & { name: string };
type MapAgg = CombatAgg & { name: string };

type PlayerAggregationResult = {
  overview: CombatAgg[];
  last10: CombatAgg[];
  agents: AgentAgg[];
  maps: MapAgg[];
  recentScrims: Array<{
    id: string;
    type: ScrimType;
    map: ValorantMap;
    outcome: ScrimOutcome;
    opponentName: string;
    teamRounds: number;
    enemyRounds: number;
    agent: ValorantAgent;
    kills: number;
    deaths: number;
    assists: number;
    acs: number;
    createdAt: Date;
  }>;
};

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function safeWinrate(wins: number, total: number): number {
  if (!total) return 0;
  return round1((wins / total) * 100);
}

function kd(kills: number, deaths: number): number {
  if (!deaths) return round2(kills);
  return round2(kills / deaths);
}

function emptyCombat(): CombatAgg {
  return {
    matches: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    kills: 0,
    deaths: 0,
    assists: 0,
    acs: 0,
  };
}

function toOverview(row?: CombatAgg): PlayerCombatOverviewDto {
  const src = row ?? emptyCombat();
  const matches = src.matches ?? 0;
  const kills = src.kills ?? 0;
  const deaths = src.deaths ?? 0;
  const assists = src.assists ?? 0;
  const acs = src.acs ?? 0;
  const wins = src.wins ?? 0;

  return {
    matches,
    wins,
    losses: src.losses ?? 0,
    draws: src.draws ?? 0,
    winrate: safeWinrate(wins, matches),
    kills,
    deaths,
    assists,
    avgKills: matches ? round1(kills / matches) : 0,
    avgDeaths: matches ? round1(deaths / matches) : 0,
    avgAssists: matches ? round1(assists / matches) : 0,
    avgAcs: matches ? round1(acs / matches) : 0,
    kd: kd(kills, deaths),
  };
}

const outcomeCount = (outcome: ScrimOutcome) => ({
  $sum: { $cond: [{ $eq: ["$outcome", outcome] }, 1, 0] },
});

const combatGroup = {
  matches: { $sum: 1 },
  wins: outcomeCount(ScrimOutcome.WIN),
  losses: outcomeCount(ScrimOutcome.LOSS),
  draws: outcomeCount(ScrimOutcome.DRAW),
  kills: { $sum: "$teamStats.kills" },
  deaths: { $sum: "$teamStats.deaths" },
  assists: { $sum: "$teamStats.assists" },
  acs: { $sum: "$teamStats.acs" },
};

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel(Scrim.name) private readonly scrimModel: Model<Scrim>,
    private readonly teamMemberService: TeamMemberService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  async getPlayerStats(teamId: string, userId: string): Promise<PlayerStatsResponseDto> {
    if (!Types.ObjectId.isValid(teamId) || !Types.ObjectId.isValid(userId)) {
      throw new BadRequestException("Invalid team or player id");
    }

    const member = await this.teamMemberService.getMemberOnTeam(teamId, userId);
    if (!member?.user) {
      throw new NotFoundException("Player is not a member of this team");
    }

    const player = { ...member, user: member.user };

    this.logger.log(
      `Computing player stats teamId=${teamId} userId=${userId}`,
      "PlayersService",
    );

    const teamObjectId = new Types.ObjectId(teamId);
    const playerObjectId = new Types.ObjectId(userId);
    const recentLimit = 8;

    const [agg] = await this.scrimModel
      .aggregate<PlayerAggregationResult>([
        { $match: { teamId: teamObjectId, "teamStats.userId": playerObjectId } },
        { $unwind: "$teamStats" },
        { $match: { "teamStats.userId": playerObjectId } },
        {
          $facet: {
            overview: [{ $group: { _id: null, ...combatGroup } }, { $project: { _id: 0 } }],
            last10: [
              { $sort: { createdAt: -1 } },
              { $limit: 10 },
              { $group: { _id: null, ...combatGroup } },
              { $project: { _id: 0 } },
            ],
            agents: [
              { $group: { _id: "$teamStats.agent", ...combatGroup } },
              {
                $project: {
                  _id: 0,
                  name: "$_id",
                  matches: 1,
                  wins: 1,
                  losses: 1,
                  draws: 1,
                  kills: 1,
                  deaths: 1,
                  assists: 1,
                  acs: 1,
                },
              },
              { $sort: { matches: -1, acs: -1 } },
            ],
            maps: [
              { $group: { _id: "$map", ...combatGroup } },
              {
                $project: {
                  _id: 0,
                  name: "$_id",
                  matches: 1,
                  wins: 1,
                  losses: 1,
                  draws: 1,
                  kills: 1,
                  deaths: 1,
                  assists: 1,
                  acs: 1,
                },
              },
              { $sort: { matches: -1, wins: -1 } },
            ],
            recentScrims: [
              { $sort: { createdAt: -1 } },
              { $limit: recentLimit },
              {
                $project: {
                  _id: 0,
                  id: { $toString: "$_id" },
                  type: 1,
                  map: 1,
                  outcome: 1,
                  opponentName: 1,
                  teamRounds: 1,
                  enemyRounds: 1,
                  agent: "$teamStats.agent",
                  kills: "$teamStats.kills",
                  deaths: "$teamStats.deaths",
                  assists: "$teamStats.assists",
                  acs: "$teamStats.acs",
                  createdAt: 1,
                },
              },
            ],
          },
        },
      ])
      .exec();

    return {
      player,
      overview: toOverview(agg?.overview?.[0]),
      last10: toOverview(agg?.last10?.[0]),
      agents:
        agg?.agents?.map((row) => {
          const overview = toOverview(row);
          return {
            name: row.name,
            matches: overview.matches,
            wins: overview.wins,
            winrate: overview.winrate,
            avgAcs: overview.avgAcs,
            kd: overview.kd,
          };
        }) ?? [],
      maps:
        agg?.maps?.map((row) => {
          const overview = toOverview(row);
          return {
            name: row.name,
            matches: overview.matches,
            wins: overview.wins,
            losses: overview.losses,
            draws: overview.draws,
            winrate: overview.winrate,
            avgAcs: overview.avgAcs,
            kd: overview.kd,
          };
        }) ?? [],
      recentScrims:
        agg?.recentScrims?.map((s) => ({
          id: s.id,
          type: s.type,
          map: s.map,
          outcome: s.outcome,
          opponentName: s.opponentName,
          teamRounds: s.teamRounds,
          enemyRounds: s.enemyRounds,
          agent: s.agent,
          kills: s.kills,
          deaths: s.deaths,
          assists: s.assists,
          acs: s.acs,
          createdAt: new Date(s.createdAt).toISOString(),
        })) ?? [],
    };
  }
}
