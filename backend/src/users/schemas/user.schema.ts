import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true, unique: true })
    username: string;

    @Prop()
    passwordHash: string;

    @Prop({ default: false })
    isEmailVerified: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);