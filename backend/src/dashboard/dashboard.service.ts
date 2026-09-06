import { Inject, Injectable, type LoggerService } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { Scrim } from "src/scrims/schemas/scrim.schema";
import { Team } from "src/teams/schemas/team.schema";
import { ScrimOutcome } from "src/scrims/enums/scrim-outcome.enum";
import { ScrimType } from "src/scrims/enums/scrim-type.enum";
import { ValorantMap } from "src/common/enums/valorant-map.enum";
import {
  DashboardBestMapDto,
  DashboardResponseDto,
} from "./dto/dashboard-response.dto";

type DashboardAggregationResult = {
  overview: Array<{
    total: number;
    wins: number;
    losses: number;
    draws: number;
    roundDiff: number;
    avgTeamRounds: number;
    avgEnemyRounds: number;
  }>;
  last10: Array<{
    total: number;
    wins: number;
    losses: number;
    draws: number;
  }>;
  bestMap: Array<{
    name: string;
    matches: number;
    wins: number;
    losses: number;
    draws: number;
    roundDiff: number;
    winrate: number;
  }>;
  recentScrims: Array<{
    id: string;
    type: ScrimType;
    map: ValorantMap;
    outcome: ScrimOutcome;
    teamRounds: number;
    enemyRounds: number;
    createdAt: Date;
  }>;
};

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function safeWinrate(wins: number, total: number): number {
  if (!total) return 0;
  return round1((wins / total) * 100);
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Scrim.name) private readonly scrimModel: Model<Scrim>,
    @InjectModel(Team.name) private readonly teamModel: Model<Team>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  async getTeamDashboard(teamId: string): Promise<DashboardResponseDto> {
    const teamObjectId = new Types.ObjectId(teamId);
    const recentLimit = 5;

    this.logger.log(`Computing dashboard for teamId=${teamId}`, "DashboardService");

    const teamDoc = await this.teamModel.findById(teamObjectId).lean().exec();

    const [agg] = await this.scrimModel
      .aggregate<DashboardAggregationResult>([
        { $match: { teamId: teamObjectId } },
        {
          $facet: {
            overview: [
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  wins: {
                    $sum: {
                      $cond: [{ $eq: ["$outcome", ScrimOutcome.WIN] }, 1, 0],
                    },
                  },
                  losses: {
                    $sum: {
                      $cond: [{ $eq: ["$outcome", ScrimOutcome.LOSS] }, 1, 0],
                    },
                  },
                  draws: {
                    $sum: {
                      $cond: [{ $eq: ["$outcome", ScrimOutcome.DRAW] }, 1, 0],
                    },
                  },
                  roundDiff: {
                    $sum: { $subtract: ["$teamRounds", "$enemyRounds"] },
                  },
                  avgTeamRounds: { $avg: "$teamRounds" },
                  avgEnemyRounds: { $avg: "$enemyRounds" },
                },
              },
              {
                $project: {
                  _id: 0,
                  total: 1,
                  wins: 1,
                  losses: 1,
                  draws: 1,
                  roundDiff: 1,
                  avgTeamRounds: 1,
                  avgEnemyRounds: 1,
                },
              },
            ],

            last10: [
              { $sort: { createdAt: -1 } },
              { $limit: 10 },
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  wins: {
                    $sum: {
                      $cond: [{ $eq: ["$outcome", ScrimOutcome.WIN] }, 1, 0],
                    },
                  },
                  losses: {
                    $sum: {
                      $cond: [{ $eq: ["$outcome", ScrimOutcome.LOSS] }, 1, 0],
                    },
                  },
                  draws: {
                    $sum: {
                      $cond: [{ $eq: ["$outcome", ScrimOutcome.DRAW] }, 1, 0],
                    },
                  },
                },
              },
              { $project: { _id: 0, total: 1, wins: 1, losses: 1, draws: 1 } },
            ],

            bestMap: [
              {
                $group: {
                  _id: "$map",
                  matches: { $sum: 1 },
                  wins: {
                    $sum: {
                      $cond: [{ $eq: ["$outcome", ScrimOutcome.WIN] }, 1, 0],
                    },
                  },
                  losses: {
                    $sum: {
                      $cond: [{ $eq: ["$outcome", ScrimOutcome.LOSS] }, 1, 0],
                    },
                  },
                  draws: {
                    $sum: {
                      $cond: [{ $eq: ["$outcome", ScrimOutcome.DRAW] }, 1, 0],
                    },
                  },
                  roundDiff: {
                    $sum: { $subtract: ["$teamRounds", "$enemyRounds"] },
                  },
                },
              },
              {
                $addFields: {
                  winrate: {
                    $cond: [
                      { $eq: ["$matches", 0] },
                      0,
                      { $multiply: [{ $divide: ["$wins", "$matches"] }, 100] },
                    ],
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  name: "$_id",
                  matches: 1,
                  wins: 1,
                  losses: 1,
                  draws: 1,
                  roundDiff: 1,
                  winrate: 1,
                },
              },
              { $sort: { winrate: -1, matches: -1, roundDiff: -1 } },
              { $limit: 1 },
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
                  teamRounds: 1,
                  enemyRounds: 1,
                  createdAt: 1,
                },
              },
            ],
          },
        },
      ])
      .exec();

    const overviewAgg = agg?.overview?.[0];
    const last10Agg = agg?.last10?.[0];
    const bestMapAgg = agg?.bestMap?.[0];

    const overviewTotal = overviewAgg?.total ?? 0;
    const overviewWins = overviewAgg?.wins ?? 0;
    const overviewLosses = overviewAgg?.losses ?? 0;
    const overviewDraws = overviewAgg?.draws ?? 0;

    const bestMap: DashboardBestMapDto | null = bestMapAgg
      ? {
          name: bestMapAgg.name,
          matches: bestMapAgg.matches,
          wins: bestMapAgg.wins,
          losses: bestMapAgg.losses,
          draws: bestMapAgg.draws,
          roundDiff: bestMapAgg.roundDiff,
          winrate: round1(bestMapAgg.winrate),
        }
      : null;

    return {
      team: teamDoc
        ? {
            id: String(teamDoc._id),
            name: teamDoc.name,
            tag: teamDoc.tag,
          }
        : null,
      overview: {
        total: overviewTotal,
        wins: overviewWins,
        losses: overviewLosses,
        draws: overviewDraws,
        winrate: safeWinrate(overviewWins, overviewTotal),
        roundDiff: overviewAgg?.roundDiff ?? 0,
        avgTeamRounds: round1(overviewAgg?.avgTeamRounds ?? 0),
        avgEnemyRounds: round1(overviewAgg?.avgEnemyRounds ?? 0),
      },
      last10: {
        total: last10Agg?.total ?? 0,
        wins: last10Agg?.wins ?? 0,
        losses: last10Agg?.losses ?? 0,
        draws: last10Agg?.draws ?? 0,
        winrate: safeWinrate(last10Agg?.wins ?? 0, last10Agg?.total ?? 0),
      },
      bestMap,
      recentScrims:
        agg?.recentScrims?.map((s) => ({
          id: s.id,
          type: s.type,
          map: s.map,
          outcome: s.outcome,
          teamRounds: s.teamRounds,
          enemyRounds: s.enemyRounds,
          createdAt: new Date(s.createdAt).toISOString(),
        })) ?? [],
    };
  }
}
