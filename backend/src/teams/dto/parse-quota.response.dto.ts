import { Exclude, Expose } from "class-transformer";

@Exclude()
export class ParseQuotaResponseDto {
  @Expose()
  period: "utc_day";

  /** Null means unlimited (Pro). */
  @Expose()
  limit: number | null;

  @Expose()
  used: number;

  /** Null means unlimited (Pro). */
  @Expose()
  remaining: number | null;

  @Expose()
  resetsAt: string;
}
