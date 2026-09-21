import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ScrimParseAttempt } from "src/scrims/parsing/schemas/scrim-parse-attempt.schema";
import { BillingStatus } from "./enums/billing-status.enum";
import { TeamPlan } from "./enums/team-plan.enum";
import { Team } from "./schemas/team.schema";
import {
  FREE_DAILY_PARSE_LIMIT,
  PARSE_QUOTA_EXCEEDED,
  getBillingOwnerUserId,
  isTeamPro,
  utcDayRange,
} from "./team-plan.utils";

export type ParseQuotaView = {
  period: "utc_day";
  limit: number | null;
  used: number;
  remaining: number | null;
  resetsAt: string;
};

export type TeamPlanView = {
  plan: TeamPlan;
  isPro: boolean;
  billingOwnerUserId?: string;
  planExpiresAt?: Date | null;
  billingStatus: BillingStatus;
  parseQuota: ParseQuotaView;
};

export type ProviderSubscriptionUpdate = {
  provider: string;
  customerId: string;
  subscriptionId: string;
  status: BillingStatus;
  plan: TeamPlan;
  planExpiresAt?: Date | null;
  billingOwnerUserId?: string;
};

@Injectable()
export class TeamPlanService {
  constructor(
    @InjectModel(Team.name) private readonly teamModel: Model<Team>,
    @InjectModel(ScrimParseAttempt.name) private readonly attemptModel: Model<ScrimParseAttempt>,
  ) {}

  async getTeamOrThrow(teamId: string): Promise<Team> {
    if (!Types.ObjectId.isValid(teamId)) {
      throw new NotFoundException("Team not found");
    }

    const team = await this.teamModel.findById(new Types.ObjectId(teamId)).lean().exec();
    if (!team) throw new NotFoundException("Team not found");
    return team as Team;
  }

  async getPlanView(teamId: string, now = new Date()): Promise<TeamPlanView> {
    const team = await this.getTeamOrThrow(teamId);
    return this.buildPlanView(team, now);
  }

  async enrichTeam(team: object, now = new Date()) {
    const record = team as { _id?: unknown; id?: unknown };
    const teamId = String(record._id ?? record.id);
    const view = await this.getPlanView(teamId, now);
    return {
      ...team,
      ...view,
    };
  }

  async buildPlanView(team: Team, now = new Date()): Promise<TeamPlanView> {
    const pro = isTeamPro(team, now);
    const { start, end } = utcDayRange(now);
    const used = await this.attemptModel
      .countDocuments({
        teamId: team._id,
        createdAt: { $gte: start, $lt: end },
      })
      .exec();

    return {
      plan: (team.plan as TeamPlan) ?? TeamPlan.FREE,
      isPro: pro,
      billingOwnerUserId: getBillingOwnerUserId(team),
      planExpiresAt: team.planExpiresAt ?? null,
      billingStatus: (team.billingStatus as BillingStatus) ?? BillingStatus.NONE,
      parseQuota: {
        period: "utc_day",
        limit: pro ? null : FREE_DAILY_PARSE_LIMIT,
        used,
        remaining: pro ? null : Math.max(0, FREE_DAILY_PARSE_LIMIT - used),
        resetsAt: end.toISOString(),
      },
    };
  }

  async assertCanParse(teamId: string, now = new Date()): Promise<void> {
    const view = await this.getPlanView(teamId, now);
    if (view.isPro) return;
    if ((view.parseQuota.remaining ?? 0) > 0) return;

    throw new ForbiddenException({
      message: "Free teams can parse 1 screenshot per UTC day. Upgrade to Pro for unlimited parses.",
      error: PARSE_QUOTA_EXCEEDED,
      code: PARSE_QUOTA_EXCEEDED,
      resetsAt: view.parseQuota.resetsAt,
      limit: FREE_DAILY_PARSE_LIMIT,
      used: view.parseQuota.used,
    });
  }

  async assertCanRemoveMember(teamId: string, userId: string): Promise<void> {
    const team = await this.getTeamOrThrow(teamId);
    const billingOwnerId = getBillingOwnerUserId(team);
    if (billingOwnerId && billingOwnerId === userId) {
      throw new BadRequestException(
        "Transfer admin to another member or cancel Pro before removing the billing owner",
      );
    }
  }

  async assertCanDemoteAdmin(teamId: string, userId: string): Promise<void> {
    const team = await this.getTeamOrThrow(teamId);
    const billingOwnerId = getBillingOwnerUserId(team);
    if (billingOwnerId && billingOwnerId === userId) {
      throw new BadRequestException("Cannot demote the billing owner. Transfer admin first.");
    }
  }

  async transferBillingOwner(teamId: string, newOwnerUserId: string): Promise<void> {
    if (!Types.ObjectId.isValid(teamId) || !Types.ObjectId.isValid(newOwnerUserId)) {
      throw new BadRequestException("Invalid team or user id");
    }

    await this.teamModel
      .updateOne(
        { _id: new Types.ObjectId(teamId) },
        { billingOwnerUserId: new Types.ObjectId(newOwnerUserId) },
      )
      .exec();
  }

  /**
   * Used later by the payment-provider webhook. Not exposed over HTTP yet.
   */
  async applyProviderSubscription(teamId: string, update: ProviderSubscriptionUpdate): Promise<void> {
    const team = await this.getTeamOrThrow(teamId);
    const billingOwnerUserId = update.billingOwnerUserId
      ? new Types.ObjectId(update.billingOwnerUserId)
      : team.billingOwnerUserId ?? team.createdBy;

    await this.teamModel
      .updateOne(
        { _id: team._id },
        {
          plan: update.plan,
          billingStatus: update.status,
          planExpiresAt: update.planExpiresAt ?? null,
          billingOwnerUserId,
          billingProvider: update.provider,
          billingProviderCustomerId: update.customerId,
          billingProviderSubscriptionId: update.subscriptionId,
        },
      )
      .exec();
  }
}
