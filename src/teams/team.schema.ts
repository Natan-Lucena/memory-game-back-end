import { Document, ObjectId, Schema } from 'mongoose';

const TeamSchema = new Schema(
  {
    name: {
      type: Schema.Types.String,
      required: true,
    },
    score: {
      type: Schema.Types.Number,
      required: true,
    },
    matchId: {
      type: Schema.Types.ObjectId,
    },
  },
  { timestamps: true },
);
export interface Team extends Document {
  name: string;
  score: number;
  matchId?: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export default TeamSchema;
