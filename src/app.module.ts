import { Module } from '@nestjs/common';
import { MemoryGameGateway } from './memory-game/memory-game.gateway';
import * as c from 'config';
import { MongooseModule } from '@nestjs/mongoose';

const dbUrl = c.get<string>('dbUrl');

@Module({
  imports: [MongooseModule.forRoot(dbUrl)],
  controllers: [],
  providers: [MemoryGameGateway],
})
export class AppModule {}
