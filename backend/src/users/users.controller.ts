import { Controller, Body, Post, Get, Req, UseGuards, BadRequestException, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { parseRiotId } from './utils/riot-id';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user.response.dto';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { MeResponseDto } from './dto/me.response.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @Serialize(UserResponseDto)
    async createUser(@Body() dto: CreateUserDto) {
        const parsed = parseRiotId(dto.riotId);
        if (!parsed) {
            throw new BadRequestException('Invalid riotId format. Use: gameUsername#TAG');
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);

        return this.usersService.create({
            email: dto.email,
            username: dto.username,
            passwordHash,
            riotId: parsed.riotId,
            riotIdNormalized: parsed.riotIdNormalized,
        });
    }

    @Get()
    @Serialize(UserResponseDto)
    async getAllUsers() {
        return this.usersService.findAll();
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @Serialize(MeResponseDto)
    async getMe(@Req() req) {
        const user = await this.usersService.findById(req.user.userId);

        return {
            userId: req.user.userId,
            email: req.user.email,
            username: user?.username,
            riotId: user?.riotId,
            altAccountId: user?.altAccountId,
            teamMember: req.user.teamMember ?? null,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Put('me')
    @Serialize(UserResponseDto)
    async updateMe(@Req() req, @Body() dto: UpdateUserDto) {
        return this.usersService.update(req.user.userId, dto);
    }
}
