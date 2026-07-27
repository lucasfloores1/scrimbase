import { Body, Controller, Get, MaxFileSizeValidator, Param, ParseFilePipe, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { StratsService } from './strats.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { stratMulterOptions } from './upload/strat-upload.config';
import { CreateStratDto } from './dto/create-strat.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TeamMemberGuard } from 'src/teams/guards/team-member.guard';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { StratResponseDto } from './dto/strat.response.dto';

@Controller('teams/:teamId/strats')
@UseGuards(JwtAuthGuard, TeamMemberGuard)
export class StratsController {
    constructor (
        private readonly stratsService : StratsService,
    ) {}

    @Get()
    @Serialize(StratResponseDto)
    async list( @Param('teamId') teamId : string ) {
        return this.stratsService.findByTeam(teamId);
    }

    @Get(':stratId')
    @Serialize(StratResponseDto)
    async getOne( @Param('teamId') teamId : string, @Param('stratId') stratId : string ) {
        return this.stratsService.findOne(teamId, stratId);
    }

    @Post()
    //@UseGuards(TeamRoleGuard([TeamRole.COACH, TeamRole.MANAGER]))
    @Serialize(StratResponseDto)
    @UseInterceptors(FileInterceptor('screenshot', stratMulterOptions))
    async create(
        @Param('teamId') teamId : string,
        @Req() req : any,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize : 8* 1024 * 1024 }),//8MB
                ],
                fileIsRequired: true,
            })
        ) file : Express.Multer.File,
        @Body() dto : CreateStratDto,
    ) {
        const screenshotUrl = `/uploads/strats/${file.filename}`;
        return this.stratsService.create(
            teamId,
            req.user.userId,
            dto,
            screenshotUrl,
        );
    }
}
