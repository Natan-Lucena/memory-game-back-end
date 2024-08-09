import { Schema } from 'mongoose';

const MatchSchema = new Schema({}, { timestamps: true });

export interface Match {
  createdAt?: Date;
  updatedAt?: Date;
}

export default MatchSchema;
