import { Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { TeamMemberGuard } from "src/teams/guards/team-member.guard";
import { ScrimsService } from "./scrims.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { scrimMulterOptions } from "./upload/scrim-upload.config";
import { ComputeScrimResultPipe } from "./pipes/compute-scrim-result.pipe";
import { ParseScrimMultipartPipe } from "./pipes/parse-scrim-multipart.pipe";
import { ParseScrimScreenshotRequestDto } from "./parsing/dto/parse-scrim-screenshot-request.dto";

import { scrimParseMulterOptions } from "./upload/scrim-parse-upload.config";
import { ScrimScreenshotParserService } from "./parsing/scrim-screenshot-parser.service";

@Controller("teams/:teamId/scrims")
@UseGuards(JwtAuthGuard, TeamMemberGuard)
export class ScrimsController {
    constructor(
        private readonly scrimsService: ScrimsService,
        private readonly scrimScreenshotParser: ScrimScreenshotParserService,
    ) {}

    @Get()
    async list(@Param("teamId") teamId: string) {
        return this.scrimsService.findByTeam(teamId);
    }

    @Get(":scrimId")
    async getOne(@Param("teamId") teamId: string, @Param("scrimId") scrimId: string) {
        return this.scrimsService.findOne(teamId, scrimId);
    }

    @Post()
    @UseInterceptors(FileInterceptor("screenshot", scrimMulterOptions))
    async create(
        @Param("teamId") teamId: string,
        @Req() req: any,
        @UploadedFile(
        new ParseFilePipe({
            validators: [
            new MaxFileSizeValidator({ maxSize: 8 * 1024 * 1024 }),
            new FileTypeValidator({ fileType: /(image\/jpeg|image\/png|image\/webp)/ }),
            ],
            fileIsRequired: true,
        }),
        )
        file: Express.Multer.File,
        @Body(new ParseScrimMultipartPipe(), new ComputeScrimResultPipe()) dtoWithOutcome: any,
    ) {
        const screenshotUrl = `/uploads/scrims/${file.filename}`;
        return this.scrimsService.create(teamId, req.user.userId, dtoWithOutcome, screenshotUrl);
    }

    @Post("parse-screenshot")
    @UseInterceptors(FileInterceptor("screenshot", scrimParseMulterOptions))
    async parseScreenshot(
        @Param("teamId") teamId: string,
        @Req() req: any,
        @UploadedFile(
        new ParseFilePipe({
            validators: [
            new MaxFileSizeValidator({ maxSize: 8 * 1024 * 1024 }),
            new FileTypeValidator({ fileType: /(image\/jpeg|image\/png|image\/webp)/ }),
            ],
            fileIsRequired: true,
        }),
        )
        file: Express.Multer.File,
        @Body() body: ParseScrimScreenshotRequestDto,
    ) {
        return this.scrimScreenshotParser.parseScreenshot({
        teamId,
        userId: req.user.userId,
        file,
        type : body.type,
        map: body.map,
        });
    }
}
