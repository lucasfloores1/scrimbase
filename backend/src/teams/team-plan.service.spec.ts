import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Test } from "@nestjs/testing";
import { Types } from "mongoose";
import { ScrimParseAttempt } from "src/scrims/parsing/schemas/scrim-parse-attempt.schema";
import { BillingStatus } from "./enums/billing-status.enum";
import { TeamPlan } from "./enums/team-plan.enum";
import { Team } from "./schemas/team.schema";
import { PARSE_QUOTA_EXCEEDED } from "./team-plan.utils";
import { TeamPlanService } from "./team-plan.service";

const TEAM_ID = "507f1f77bcf86cd799439011";
const OWNER_ID = "507f1f77bcf86cd799439012";

describe("TeamPlanService", () => {
  let service: TeamPlanService;
  let findById: jest.Mock;
  let countDocuments: jest.Mock;
  let updateOne: jest.Mock;

  const teamDoc = {
    _id: new Types.ObjectId(TEAM_ID),
    createdBy: new Types.ObjectId(OWNER_ID),
    billingOwnerUserId: new Types.ObjectId(OWNER_ID),
    plan: TeamPlan.FREE,
    billingStatus: BillingStatus.NONE,
    planExpiresAt: null,
  };

  beforeEach(async () => {
    findById = jest.fn();
    countDocuments = jest.fn();
    updateOne = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }) });

    const module = await Test.createTestingModule({
      providers: [
        TeamPlanService,
        {
          provide: getModelToken(Team.name),
          useValue: {
            findById: (...args: unknown[]) => findById(...args),
            updateOne,
          },
        },
        {
          provide: getModelToken(ScrimParseAttempt.name),
          useValue: {
            countDocuments: (...args: unknown[]) => countDocuments(...args),
          },
        },
      ],
    }).compile();

    service = module.get(TeamPlanService);
  });

  function mockTeam(overrides: Partial<typeof teamDoc> = {}) {
    findById.mockReturnValue({
      lean: () => ({
        exec: jest.fn().mockResolvedValue({ ...teamDoc, ...overrides }),
      }),
    });
  }

  it("allows a free team with no parses today", async () => {
    mockTeam();
    countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(0) });

    await expect(service.assertCanParse(TEAM_ID, new Date("2026-09-20T15:00:00.000Z"))).resolves.toBeUndefined();
  });

  it("blocks a free team that already parsed today", async () => {
    mockTeam();
    countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });

    await expect(service.assertCanParse(TEAM_ID, new Date("2026-09-20T15:00:00.000Z"))).rejects.toBeInstanceOf(
      ForbiddenException,
    );

    try {
      await service.assertCanParse(TEAM_ID, new Date("2026-09-20T15:00:00.000Z"));
    } catch (err) {
      const body = (err as ForbiddenException).getResponse() as Record<string, unknown>;
      expect(body.error).toBe(PARSE_QUOTA_EXCEEDED);
      expect(body.code).toBe(PARSE_QUOTA_EXCEEDED);
      expect(body.resetsAt).toBe("2026-09-21T00:00:00.000Z");
    }
  });

  it("does not apply the daily cap to Pro teams", async () => {
    mockTeam({ plan: TeamPlan.PRO });
    countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(12) });

    await expect(service.assertCanParse(TEAM_ID)).resolves.toBeUndefined();
  });

  it("blocks removing the billing owner", async () => {
    mockTeam();
    await expect(service.assertCanRemoveMember(TEAM_ID, OWNER_ID)).rejects.toThrow(
      /billing owner/i,
    );
  });

  it("throws when the team does not exist", async () => {
    findById.mockReturnValue({
      lean: () => ({ exec: jest.fn().mockResolvedValue(null) }),
    });

    await expect(service.getPlanView(TEAM_ID)).rejects.toBeInstanceOf(NotFoundException);
  });
});
