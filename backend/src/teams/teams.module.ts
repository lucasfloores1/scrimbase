import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamSchema } from './schemas/team.schema';
import { TeamMemberSchema } from './schemas/team-member.schema';
import { TeamMemberService } from './team-member.service';
import { TeamMemberController } from './team-member.controller';
import { TeamMemberGuard } from './guards/team-member.guard';
import { TeamAdminGuard } from './guards/team-admin.guard';
import { TeamFullGuard } from './guards/team-full.guard';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Team', schema: TeamSchema },
      { name: 'TeamMember', schema: TeamMemberSchema },
    ]),
  ],
  providers: [TeamsService, TeamMemberService, TeamMemberGuard, TeamAdminGuard, TeamFullGuard ],
  controllers: [TeamsController, TeamMemberController],
  exports: [TeamsService, TeamMemberService, TeamMemberGuard, TeamAdminGuard],
})
export class TeamsModule {}
