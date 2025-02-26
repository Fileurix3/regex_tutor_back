import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: [Types.ObjectId], ref: "Task", default: [] })
  solvedTasks: Types.ObjectId[];

  @Prop({ required: true, default: "User" })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
