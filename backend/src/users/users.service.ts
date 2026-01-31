import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {

    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
    ) { }

    toResponseDto(user: any): UserResponseDto {
        return {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
        };
    }

    async create(data: {
        email: string;
        username: string;
        passwordHash: string;
    }) {
        const newUser = new this.userModel(data);
        return newUser.save();
    }

    async findAll() {
        return this.userModel.find().select('-passwordHash').exec();
    }

    async findByEmail(email: string) {
        return this.userModel.findOne({ email }).exec();
    }
}
