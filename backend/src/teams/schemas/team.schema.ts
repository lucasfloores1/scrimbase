import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema( { timestamps: true, versionKey : false } )
export class Team {
    _id: Types.ObjectId;

    @Prop( { required: true, unique: true } )
    name: string;

    @Prop( { required: true, uppercase: true } )
    tag: string;

    @Prop( { type: Types.ObjectId, ref: 'User' , required: true} )
    createdBy: Types.ObjectId;

    @Prop( { required : true, unique: true, index : true } )
    inviteCode: string;

}

export const TeamSchema = SchemaFactory.createForClass( Team );