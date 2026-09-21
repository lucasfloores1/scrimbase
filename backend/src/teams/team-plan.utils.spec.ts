import { Types } from "mongoose";
import { BillingStatus } from "./enums/billing-status.enum";
import { TeamPlan } from "./enums/team-plan.enum";
import { getBillingOwnerUserId, isTeamPro, utcDayRange } from "./team-plan.utils";

describe("team-plan.utils", () => {
  describe("utcDayRange", () => {
    it("returns the UTC day containing the given instant", () => {
      const now = new Date("2026-09-20T22:15:00.000Z");
      const { start, end } = utcDayRange(now);

      expect(start.toISOString()).toBe("2026-09-20T00:00:00.000Z");
      expect(end.toISOString()).toBe("2026-09-21T00:00:00.000Z");
    });
  });

  describe("getBillingOwnerUserId", () => {
    const owner = new Types.ObjectId("507f1f77bcf86cd799439011");
    const createdBy = new Types.ObjectId("507f1f77bcf86cd799439012");

    it("prefers billingOwnerUserId", () => {
      expect(getBillingOwnerUserId({ billingOwnerUserId: owner, createdBy })).toBe(String(owner));
    });

    it("falls back to createdBy for legacy teams", () => {
      expect(getBillingOwnerUserId({ createdBy })).toBe(String(createdBy));
    });
  });

  describe("isTeamPro", () => {
    const now = new Date("2026-09-20T12:00:00.000Z");

    it("is false for FREE teams", () => {
      expect(isTeamPro({ plan: TeamPlan.FREE }, now)).toBe(false);
    });

    it("is true for PRO without expiry", () => {
      expect(isTeamPro({ plan: TeamPlan.PRO, billingStatus: BillingStatus.ACTIVE }, now)).toBe(true);
    });

    it("is true for PRO whose expiry is in the future", () => {
      expect(
        isTeamPro({ plan: TeamPlan.PRO, planExpiresAt: new Date("2026-10-01T00:00:00.000Z") }, now),
      ).toBe(true);
    });

    it("is false for PRO whose expiry has passed", () => {
      expect(
        isTeamPro({ plan: TeamPlan.PRO, planExpiresAt: new Date("2026-09-19T00:00:00.000Z") }, now),
      ).toBe(false);
    });
  });
});
