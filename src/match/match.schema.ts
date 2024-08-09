import { Schema, Document, model } from 'mongoose';

export interface Match extends Document {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const MatchSchema = new Schema({}, { timestamps: true });

export const MatchModel = model<Match>('Match', MatchSchema);
