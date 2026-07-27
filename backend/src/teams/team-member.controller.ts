import { Controller, Delete, Get, Param, Patch, Req, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TeamMemberGuard } from './guards/team-member.guard';
import { TeamMemberService } from './team-member.service';
import { TeamAdminGuard } from './guards/team-admin.guard';
import { UpdateMemberAdminDto } from './dto/update-member-admin.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { TeamMemberListItemResponseDto } from './dto/team-member.response.dto';

@Controller('teams/member')
@UseGuards(JwtAuthGuard, TeamMemberGuard)
export class TeamMemberController {
    constructor(private readonly teamMemberService: TeamMemberService) {}

    @Get()
    @Serialize(TeamMemberListItemResponseDto)
    getMembers(@Req() req) {
        return this.teamMemberService.getTeamMembers(getTeamIdFromReq(req));
    }

    @Delete(':userId')
    @UseGuards(TeamAdminGuard)
    deleteMember(@Req() req, @Param('userId') userId: string) {
        return this.teamMemberService.removeMember(userId, getTeamIdFromReq(req));
    }

    @Patch(':userId/admin')
    @UseGuards(TeamAdminGuard)
    setAdmin(@Req() req, @Param('userId') userId: string, @Body() dto: UpdateMemberAdminDto) {
        return this.teamMemberService.setAdminStatus({
            actorUserId: req.user.userId,
            targetUserId: userId,
            teamId: getTeamIdFromReq(req),
            isAdmin: dto.isAdmin,
        });
    }

    @Patch(':userId/role')
    @UseGuards(TeamAdminGuard)
    setRole(@Req() req, @Param('userId') userId: string, @Body() dto: UpdateMemberRoleDto) {
        return this.teamMemberService.setRole({
            targetUserId: userId,
            teamId: getTeamIdFromReq(req),
            role: dto.role,
        });
    }

    @Post(':userId/transfer-admin')
    @UseGuards(TeamAdminGuard)
    transferAdmin(@Req() req, @Param('userId') userId: string) {
        return this.teamMemberService.transferAdmin({
            actorUserId: req.user.userId,
            targetUserId: userId,
            teamId: getTeamIdFromReq(req),
        });
    }
}

function getTeamIdFromReq(req: any): string {
    const raw = req?.user?.teamMember?.teamId;
    if (!raw) return '';
    if (typeof raw === 'string') return raw;
    return raw?._id?.toString?.() ?? raw?.toString?.() ?? String(raw?._id ?? raw);
}
