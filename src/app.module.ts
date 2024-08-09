import { Module } from '@nestjs/common';
import { MemoryGameGateway } from './memory-game/memory-game.gateway';
import * as c from 'config';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamsModule } from './teams/teams.module';
import { MatchModule } from './match/matchs.module';
import TeamSchema from './teams/team.schema';
import MatchSchema from './match/match.schema';

const dbUrl = c.get<string>('dbUrl');

@Module({
  imports: [
    MongooseModule.forRoot(dbUrl),
    MongooseModule.forFeature([
      { name: 'Team', schema: TeamSchema },
      { name: 'Match', schema: MatchSchema },
    ]),
    TeamsModule,
    MatchModule,
  ],
  controllers: [],
  providers: [MemoryGameGateway],
})
export class AppModule {}
