import { Document, Schema } from 'mongoose';

const MatchSchema = new Schema(
  {
    ranking: { type: Schema.Types.Array },
  },
  { timestamps: true },
);

interface Ranking {
  id: string;
  name: string;
  score: number;
}

export interface Match extends Document {
  ranking: Ranking[];
  createdAt?: Date;
  updatedAt?: Date;
}

export default MatchSchema;
