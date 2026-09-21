import { BadRequestException } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Test } from "@nestjs/testing";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { TeamMemberService } from "src/teams/team-member.service";
import { ValorantAgent } from "src/common/enums/valorant-agent.enum";
import { ValorantMap } from "src/common/enums/valorant-map.enum";
import { ScrimOutcome } from "./enums/scrim-outcome.enum";
import { ScrimPlayerKind } from "./enums/scrim-player-kind.enum";
import { ScrimType } from "./enums/scrim-type.enum";
import { ScrimsService } from "./scrims.service";

jest.mock("./schemas/scrim.schema", () => ({
  Scrim: class Scrim {},
}));

import { Scrim } from "./schemas/scrim.schema";

const TEAM_ID = "507f1f77bcf86cd799439011";
const USER_ID = "507f1f77bcf86cd799439012";
const MEMBER_A = "507f1f77bcf86cd799439013";
const MEMBER_B = "507f1f77bcf86cd799439014";

const basePayload = {
  type: ScrimType.SCRIM,
  map: ValorantMap.ASCENT,
  opponentName: "FNATIC",
  teamRounds: 13,
  enemyRounds: 7,
  outcome: ScrimOutcome.WIN,
  enemyComposition: [
    ValorantAgent.JETT,
    ValorantAgent.SOVA,
    ValorantAgent.OMEN,
    ValorantAgent.KILLJOY,
    ValorantAgent.SAGE,
  ],
};

function stat(overrides: Record<string, unknown> = {}) {
  return {
    agent: ValorantAgent.JETT,
    kills: 10,
    deaths: 8,
    assists: 4,
    acs: 220,
    ...overrides,
  };
}

describe("ScrimsService", () => {
  let service: ScrimsService;
  let create: jest.Mock;
  let areUsersMembersOfTeam: jest.Mock;

  beforeEach(async () => {
    create = jest.fn().mockResolvedValue({ id: "scrim" });
    areUsersMembersOfTeam = jest.fn().mockResolvedValue(true);

    const module = await Test.createTestingModule({
      providers: [
        ScrimsService,
        { provide: getModelToken(Scrim.name), useValue: { create } },
        { provide: TeamMemberService, useValue: { areUsersMembersOfTeam } },
        { provide: WINSTON_MODULE_NEST_PROVIDER, useValue: { log: jest.fn() } },
      ],
    }).compile();

    service = module.get(ScrimsService);
  });

  it("saves unmatched players as SUB without a userId", async () => {
    await service.create(
      TEAM_ID,
      USER_ID,
      {
        ...basePayload,
        teamStats: [
          stat({ userId: MEMBER_A, kind: ScrimPlayerKind.MEMBER }),
          stat({ userId: MEMBER_B }),
          stat({ userId: "507f1f77bcf86cd799439015" }),
          stat({ userId: "507f1f77bcf86cd799439016" }),
          stat({ displayName: "Sub#LAS", kind: ScrimPlayerKind.SUB }),
        ],
      },
      "/uploads/scrims/test.png",
    );

    const saved = create.mock.calls[0][0];
    expect(saved.teamStats[4]).toMatchObject({
      kind: ScrimPlayerKind.SUB,
      displayName: "Sub#LAS",
      userId: undefined,
    });
  });

  it("allows excluding a substitute by sending 4 roster rows", async () => {
    await service.create(
      TEAM_ID,
      USER_ID,
      {
        ...basePayload,
        teamStats: [
          stat({ userId: MEMBER_A }),
          stat({ userId: MEMBER_B }),
          stat({ userId: "507f1f77bcf86cd799439015" }),
          stat({ userId: "507f1f77bcf86cd799439016" }),
        ],
      },
      "/uploads/scrims/test.png",
    );

    expect(create).toHaveBeenCalled();
  });

  it("allows up to 3 SUB rows", async () => {
    await service.create(
      TEAM_ID,
      USER_ID,
      {
        ...basePayload,
        teamStats: [
          stat({ userId: MEMBER_A }),
          stat({ userId: MEMBER_B }),
          stat({ displayName: "Sub1", kind: ScrimPlayerKind.SUB }),
          stat({ displayName: "Sub2", kind: ScrimPlayerKind.SUB }),
          stat({ displayName: "Sub3", kind: ScrimPlayerKind.SUB }),
        ],
      },
      "/uploads/scrims/test.png",
    );

    expect(create).toHaveBeenCalled();
  });

  it("rejects more than 3 SUB rows", async () => {
    await expect(
      service.create(
        TEAM_ID,
        USER_ID,
        {
          ...basePayload,
          teamStats: [
            stat({ userId: MEMBER_A }),
            stat({ displayName: "Sub1", kind: ScrimPlayerKind.SUB }),
            stat({ displayName: "Sub2", kind: ScrimPlayerKind.SUB }),
            stat({ displayName: "Sub3", kind: ScrimPlayerKind.SUB }),
            stat({ displayName: "Sub4", kind: ScrimPlayerKind.SUB }),
          ],
        },
        "/uploads/scrims/test.png",
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("allows excluding multiple substitutes down to 2 roster rows", async () => {
    await service.create(
      TEAM_ID,
      USER_ID,
      {
        ...basePayload,
        teamStats: [stat({ userId: MEMBER_A }), stat({ userId: MEMBER_B })],
      },
      "/uploads/scrims/test.png",
    );

    expect(create).toHaveBeenCalled();
  });

  it("rejects SUB rows that still have a userId", async () => {
    await expect(
      service.create(
        TEAM_ID,
        USER_ID,
        {
          ...basePayload,
          teamStats: [
            stat({ userId: MEMBER_A }),
            stat({ userId: MEMBER_B }),
            stat({ userId: "507f1f77bcf86cd799439015" }),
            stat({ userId: "507f1f77bcf86cd799439016" }),
            stat({ userId: MEMBER_A, displayName: "Sub", kind: ScrimPlayerKind.SUB }),
          ],
        },
        "/uploads/scrims/test.png",
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
