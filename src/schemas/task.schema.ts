import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type TaskDocument = HydratedDocument<Task>;

@Schema({ timestamps: true })
export class Task {
  @Prop({ type: String, unique: true, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({
    type: [
      {
        testCase: { type: String, required: true },
        output: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    required: true,
  })
  exampleTestCases: [{ testCase: string; output: string; description: string }];

  @Prop({
    type: [
      {
        testCase: { type: String, required: true },
        output: { type: String, required: true },
      },
    ],
    required: true,
  })
  testCases: [{ testCase: string; output: string }];
}

export const TaskSchema = SchemaFactory.createForClass(Task);
