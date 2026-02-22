import { Controller, Body, Post, Get, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { parseRiotId } from './utils/riot-id';

@Controller('users')
export class UsersController {

    constructor(private readonly usersService: UsersService) {}

    @Post()
    async createUser( @Body() dto : CreateUserDto ) {
        //Game Tag
        const parsed = parseRiotId(dto.riotId);
        if (!parsed) throw new BadRequestException("Invalid riotId format. Use: gameUsername#TAG")
        
        const passwordHash = await bcrypt.hash(dto.password, 10);

        return this.usersService.create({
            email: dto.email,
            username: dto.username,
            passwordHash,
            riotId: parsed.riotId,
            riotIdNormalized: parsed.riotIdNormalized
        });
    }

    @Get()
    async getAllUsers() {
        return this.usersService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@Req() req) {
        return req.user;
    }

}
