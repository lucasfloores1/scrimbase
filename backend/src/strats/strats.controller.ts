import { Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { StratsService } from './strats.service';
import { TeamRoleGuard } from 'src/teams/guards/team-role.guard';
import { TeamRole } from 'src/common/enums/team-role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { stratMulterOptions } from './upload/strat-upload.config';
import { CreateStratDto } from './dto/create-strat.dto';

@Controller('teams/:teamId/strats')
export class StratsController {
    constructor (
        private readonly stratsService : StratsService,
    ) {}

    @Get()
    async list( @Param('teamId') teamId : string ) {
        return this.stratsService.findByTeam(teamId);
    }

    @Get(':stratId')
    async getOne( @Param('teamId') teamId : string, @Param('stratId') stratId : string ) {
        return this.stratsService.findOne(teamId, stratId);
    }

    @Post()
    @UseGuards(TeamRoleGuard([TeamRole.COACH, TeamRole.MANAGER]))
    @UseInterceptors(FileInterceptor('screenshot', stratMulterOptions))
    async create(
        @Param('teamId') teamId : string,
        @Req() req : any,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize : 8* 1024 * 1024 }),//8MB
                    new FileTypeValidator({ fileType : /(image\/jpeg|image\/png|image\/webp)/ })
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
            screenshotUrl
        );
    }




}
