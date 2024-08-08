import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import TeamSchema from './team.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Teams', schema: TeamSchema }])],
  providers: [],
})
export class TeamsModule {}
