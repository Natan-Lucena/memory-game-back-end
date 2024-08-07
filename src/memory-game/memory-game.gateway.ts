import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface Player {
  id: string;
  score: number;
}

@WebSocketGateway()
export class MemoryGameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private players: Player[] = [];
  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
    this.players.push({ id: client.id, score: 0 });
    this.server.emit(
      'players',
      this.players.sort((a, b) => b.score - a.score),
    );
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.players = this.players.filter((player) => player.id !== client.id);
    this.server.emit(
      'players',
      this.players.sort((a, b) => b.score - a.score),
    );
  }

  @SubscribeMessage('updateScore')
  handleScoreUpdate(
    @MessageBody() score: number,
    @ConnectedSocket() client: Socket,
  ) {
    const player = this.players.find((player) => player.id === client.id);
    if (player) {
      player.score = score;
      this.server.emit(
        'updateScore',
        this.players.sort((a, b) => b.score - a.score),
      );
    }
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): void {
    console.log(`Message from ${client.id}: ${data}`);
    this.server.emit('message', data);
  }
}
