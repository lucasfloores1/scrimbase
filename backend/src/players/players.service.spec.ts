import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { NotFoundException } from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { PlayersService } from "./players.service";
import { TeamMemberService } from "src/teams/team-member.service";
import { TeamRole } from "src/common/enums/team-role.enum";

jest.mock("src/scrims/schemas/scrim.schema", () => ({
  Scrim: class Scrim {},
}));

import { Scrim } from "src/scrims/schemas/scrim.schema";

const TEAM_ID = "507f1f77bcf86cd799439011";
const USER_ID = "507f1f77bcf86cd799439012";

const member = {
  id: "507f1f77bcf86cd799439013",
  teamId: TEAM_ID,
  role: TeamRole.PLAYER,
  isAdmin: false,
  joinedAt: "2026-01-01T00:00:00.000Z",
  user: {
    id: USER_ID,
    username: "alice",
    riotId: "Alice#NA1",
  },
};

describe("PlayersService", () => {
  let service: PlayersService;
  let aggregateExec: jest.Mock;
  let getMemberOnTeam: jest.Mock;

  beforeEach(async () => {
    aggregateExec = jest.fn();
    getMemberOnTeam = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayersService,
        {
          provide: getModelToken(Scrim.name),
          useValue: {
            aggregate: jest.fn().mockReturnValue({ exec: aggregateExec }),
          },
        },
        {
          provide: TeamMemberService,
          useValue: { getMemberOnTeam },
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: { log: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(PlayersService);
  });

  it("throws when the user is not on the team", async () => {
    getMemberOnTeam.mockResolvedValue(null);
    await expect(service.getPlayerStats(TEAM_ID, USER_ID)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("returns zeroed stats when the player has no matched scrims", async () => {
    getMemberOnTeam.mockResolvedValue(member);
    aggregateExec.mockResolvedValue([]);

    const result = await service.getPlayerStats(TEAM_ID, USER_ID);

    expect(result.player.user?.username).toBe("alice");
    expect(result.overview.matches).toBe(0);
    expect(result.overview.avgAcs).toBe(0);
    expect(result.last10.kd).toBe(0);
    expect(result.agents).toEqual([]);
    expect(result.maps).toEqual([]);
    expect(result.recentScrims).toEqual([]);
  });
});
