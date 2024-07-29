import { Module } from '@nestjs/common';
import { MemoryGameGateway } from './memory-game/memory-game.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [MemoryGameGateway],
})
export class AppModule {}
