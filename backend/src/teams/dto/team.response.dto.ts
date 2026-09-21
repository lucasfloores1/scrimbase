import { Exclude, Expose, Transform, Type } from "class-transformer";
import { toIdString, toIsoDate, toRefId } from "src/common/utils/serialize.utils";
import { BillingStatus } from "../enums/billing-status.enum";
import { TeamPlan } from "../enums/team-plan.enum";
import { ParseQuotaResponseDto } from "./parse-quota.response.dto";

@Exclude()
export class TeamResponseDto {
  @Expose()
  @Transform(({ obj }) => toIdString(obj))
  id: string;

  @Expose()
  name: string;

  @Expose()
  tag: string;

  @Expose()
  @Transform(({ obj }) => toRefId(obj.createdBy))
  createdBy: string;

  @Expose()
  inviteCode: string;

  @Expose()
  plan: TeamPlan;

  @Expose()
  isPro: boolean;

  @Expose()
  @Transform(({ obj }) => toRefId(obj.billingOwnerUserId) ?? toRefId(obj.createdBy))
  billingOwnerUserId: string;

  @Expose()
  @Transform(({ obj }) => toIsoDate(obj.planExpiresAt))
  planExpiresAt?: string;

  @Expose()
  billingStatus: BillingStatus;

  @Expose()
  @Type(() => ParseQuotaResponseDto)
  parseQuota: ParseQuotaResponseDto;

  @Expose()
  @Transform(({ obj }) => toIsoDate(obj.createdAt))
  createdAt?: string;
}
