import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { parseRiotId } from './utils/riot-id';

@Injectable()
export class UsersService {

    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
    ) { }

    async create(data: {
        email: string;
        username: string;
        passwordHash: string;
        riotId?: string;
        riotIdNormalized?: string;
    }) {
        const newUser = new this.userModel(data);
        return newUser.save();
    }

    async findAll() {
        return this.userModel.find().select('-passwordHash').lean().exec();
    }

    async findByEmail(email: string) {
        return this.userModel.findOne({ email }).lean().exec();
    }

    async findById(userId: string) {
        return this.userModel.findById(userId).select('-passwordHash').lean().exec();
    }

    async update(userId : string, dto : UpdateUserDto ) {
        if (dto.altAccountId) {
            const altAccountId = parseRiotId(dto.altAccountId)
            if (altAccountId !== null) {
                const parsedDto = {
                    ...dto,
                    altAccountId : altAccountId.riotId,
                    altAccountIdNormalized : altAccountId.riotIdNormalized,
                }
                const user = await this.userModel.findOne({ _id: userId });
                if (!user) throw new BadRequestException('User not found');
                const updatedUser = await this.userModel.findByIdAndUpdate(userId, parsedDto, { new: true }).lean().exec();
                return updatedUser;
            }
        }
        const user = await this.userModel.findOne({ _id: userId });
        if (!user) throw new BadRequestException('User not found');
        const updatedUser = await this.userModel.findByIdAndUpdate(userId, dto, { new: true }).lean().exec();
        return updatedUser;
    }
}
