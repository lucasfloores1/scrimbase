import { BillingStatus } from "./enums/billing-status.enum";
import { TeamPlan } from "./enums/team-plan.enum";

export const FREE_DAILY_PARSE_LIMIT = 1;
export const PARSE_QUOTA_EXCEEDED = "PARSE_QUOTA_EXCEEDED";

export type TeamPlanFields = {
  plan?: TeamPlan | string;
  createdBy?: { toString(): string } | string;
  billingOwnerUserId?: { toString(): string } | string | null;
  planExpiresAt?: Date | string | null;
  billingStatus?: BillingStatus | string | null;
};

export function utcDayRange(now = new Date()): { start: Date; end: Date } {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

export function toIdString(value: { toString(): string } | string | null | undefined): string | undefined {
  if (value == null) return undefined;
  return typeof value === "string" ? value : String(value);
}

export function getBillingOwnerUserId(team: TeamPlanFields): string | undefined {
  return toIdString(team.billingOwnerUserId) ?? toIdString(team.createdBy);
}

export function isTeamPro(team: TeamPlanFields, now = new Date()): boolean {
  if (team.plan !== TeamPlan.PRO) return false;
  if (!team.planExpiresAt) return true;
  const expiresAt = team.planExpiresAt instanceof Date ? team.planExpiresAt : new Date(team.planExpiresAt);
  return expiresAt.getTime() > now.getTime();
}
