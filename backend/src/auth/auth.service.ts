import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';
import { access } from 'fs';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async login(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);

        if (!user) throw new UnauthorizedException('Invalid credentials');

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

        const payload = { sub: user._id.toString(), email: user.email};

        return {
            accessToken: this.signAccessToken(payload),
            refreshToken: this.signRefreshToken(payload),
        };
    }

    async refresh( token: string) {
        try {
            const payload = this.jwtService.verify(token, {
                secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
            });
            return {
                accessToken: this.signAccessToken({ sub: payload.sub, email: payload.email }),
            };
        } catch (err) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    private signAccessToken(payload: any) {
        return this.jwtService.sign(payload, {
            secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
            expiresIn: this.configService.getOrThrow<StringValue>('JWT_ACCESS_EXPIRES_IN'),
        });
    }

    private signRefreshToken(payload: any) {
        return this.jwtService.sign(payload, {
            secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.getOrThrow<StringValue>('JWT_REFRESH_EXPIRES_IN'),
        });
    }
}