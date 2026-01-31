import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export enum TeamRole {
    PLAYER = 'PLAYER',
    COACH = 'COACH',
    MANAGER = 'MANAGER',
}

export type TeamMemberDocument = TeamMember & Document;

@Schema ( { timestamps: true } )
export class TeamMember {
    _id: string;

    @Prop( { type: Types.ObjectId, ref: 'User', required: true, unique: true } )
    userId: Types.ObjectId;

    @Prop( { type: Types.ObjectId, ref: 'Team', required: true } )
    teamId:  Types.ObjectId;

    @Prop( { required: true, enum: TeamRole, default: TeamRole.PLAYER } )
    role: TeamRole;

    @Prop( { default: false } )
    isAdmin: boolean;

    @Prop()
    joinedAt: Date;
}

export const TeamMemberSchema = SchemaFactory.createForClass( TeamMember );