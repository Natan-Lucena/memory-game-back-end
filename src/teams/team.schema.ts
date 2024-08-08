import { Schema } from 'mongoose';

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

export default TeamSchema;
