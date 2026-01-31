import { Controller, Delete, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TeamMemberGuard } from './guards/team-member.guard';
import { TeamMemberService } from './team-member.service';
import { TeamAdminGuard } from './guards/team-admin.guard';

@Controller('teams/member')
@UseGuards(JwtAuthGuard, TeamMemberGuard)
export class TeamMemberController {
    constructor (
        private readonly teamMemberService: TeamMemberService
    ) {}

    @Get()
    getMembers(@Req() req) {
        return this.teamMemberService.getTeamMembers( req.user.teamMember.teamId.toString() );
    }

    @Delete(':userId')
    @UseGuards(TeamAdminGuard)
    deleteMember(@Req() req, @Param('userId') userId) {
        return this.teamMemberService.removeMember( userId, req.user.teamMember.teamId.toString() );
    }
}
