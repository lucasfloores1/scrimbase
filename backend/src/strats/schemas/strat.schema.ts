import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ timestamps: true })
export class Strat {

    @Prop({ type : Types.ObjectId, ref : 'Team' , required : true})
    teamId : Types.ObjectId;

    @Prop({ type : Types.ObjectId, ref : 'User', required : true})
    createdBy : Types.ObjectId;

    @Prop({ required : true})
    map : string;

    @Prop({ required : false, maxlength : 5000 })
    notes? : string;

    @Prop({ required : true})
    screenshotUrl : string;

}

export const StratSchema = SchemaFactory.createForClass(Strat);