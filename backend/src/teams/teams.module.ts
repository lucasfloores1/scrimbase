import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Team, TeamSchema } from './schemas/team.schema';
import { TeamMember, TeamMemberSchema } from './schemas/team-member.schema';
import { TeamMemberService } from './team-member.service';
import { TeamMemberController } from './team-member.controller';
import { TeamMemberGuard } from './guards/team-member.guard';
import { TeamAdminGuard } from './guards/team-admin.guard';
import { TeamFullGuard } from './guards/team-full.guard';
import { TeamParseQuotaGuard } from './guards/team-parse-quota.guard';
import { TeamPlanService } from './team-plan.service';
import { ScrimParseAttempt, ScrimParseAttemptSchema } from 'src/scrims/parsing/schemas/scrim-parse-attempt.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Team.name, schema: TeamSchema },
      { name: TeamMember.name, schema: TeamMemberSchema },
      { name: ScrimParseAttempt.name, schema: ScrimParseAttemptSchema },
    ]),
  ],
  providers: [
    TeamsService,
    TeamMemberService,
    TeamPlanService,
    TeamMemberGuard,
    TeamAdminGuard,
    TeamFullGuard,
    TeamParseQuotaGuard,
  ],
  controllers: [TeamsController, TeamMemberController],
  exports: [
    TeamsService,
    TeamMemberService,
    TeamPlanService,
    TeamMemberGuard,
    TeamAdminGuard,
    TeamFullGuard,
    TeamParseQuotaGuard,
  ],
})
export class TeamsModule {}
