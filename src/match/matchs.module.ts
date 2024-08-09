import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchSchema } from './match.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Matchs', schema: MatchSchema }]),
  ],
})
export class MatchModule {}
