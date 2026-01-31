import { Controller, Delete, Get, Param, Patch, Req, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TeamMemberGuard } from './guards/team-member.guard';
import { TeamMemberService } from './team-member.service';
import { TeamAdminGuard } from './guards/team-admin.guard';
import { UpdateMemberAdminDto } from './dto/update-member-admin.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

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
    deleteMember(@Req() req, @Param('userId') userId : string) {
        return this.teamMemberService.removeMember( userId, req.user.teamMember.teamId.toString() );
    }

    @Patch(':userId/admin')
    @UseGuards(TeamAdminGuard)
    setAdmin(@Req() req, @Param('userId') userId : string, @Body() dto: UpdateMemberAdminDto) {
        return this.teamMemberService.setAdminStatus({
            actorUserId : req.user.userId,
            targetUserId : userId,
            teamId : req.user.teamMember.teamId.toString(),
            isAdmin : dto.isAdmin
        });
    }

    @Patch(':userId/role')
    @UseGuards(TeamAdminGuard)
    setRole(@Req() req, @Param('userId') userId : string, @Body() dto: UpdateMemberRoleDto) {
        return this.teamMemberService.setRole({
            targetUserId : userId,
            teamId : req.user.teamMember.teamId.toString(),
            role : dto.role
        });
    }

    @Post(':userId/transfer-admin')
    @UseGuards(TeamAdminGuard)
    transferAdmin(@Req() req, @Param('userId') userId : string) {
        return this.teamMemberService.transferAdmin({
            actorUserId : req.user.userId,
            targetUserId : userId,
            teamId : req.user.teamMember.teamId.toString()
        });
    }
}