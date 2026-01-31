import { Controller, Body, Post, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {

    constructor(private readonly usersService: UsersService) {}

    @Post()
    async createUser(
        @Body() body: {  email: string; password: string , username: string }
    ) { 
        const passwordHash = await bcrypt.hash(body.password, 10);

        return this.usersService.create({
            email: body.email,
            username: body.username,
            passwordHash,
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
