import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema( { timestamps: true } )
export class Team {
    _id: Types.ObjectId;

    @Prop( { required: true, unique: true } )
    name: string;

    @Prop( { required: true, uppercase: true } )
    tag: string;

    @Prop( { type: Types.ObjectId, ref: 'User' , required: true} )
    createdBy: Types.ObjectId;
}

export const TeamSchema = SchemaFactory.createForClass( Team );