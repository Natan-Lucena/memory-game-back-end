import { Module } from '@nestjs/common';
import { MemoryGameGateway } from './memory-game/memory-game.gateway';
import * as c from 'config';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamsModule } from './teams/teams.module';
import { MatchModule } from './match/matchs.module';

const dbUrl = c.get<string>('dbUrl');

@Module({
  imports: [MongooseModule.forRoot(dbUrl), TeamsModule, MatchModule],
  controllers: [],
  providers: [MemoryGameGateway],
})
export class AppModule {}
