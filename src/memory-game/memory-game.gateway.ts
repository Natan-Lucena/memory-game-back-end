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
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Team } from 'src/teams/team.schema';
import { Match } from 'src/match/match.schema';

@WebSocketGateway()
export class MemoryGameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    @InjectModel('Team') private readonly teamModel: Model<Team>,
    @InjectModel('Match') private readonly matchModel: Model<Match>,
  ) {}

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected:`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(
    @MessageBody() data: { teamName: string; matchId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const team = new this.teamModel({
      name: data.teamName,
      score: 0,
      matchId: data.matchId,
    });
    await team.save();

    client.join(data.matchId);

    this.server.to(data.matchId).emit('teamJoined', team);

    console.log(`Team ${team.name} joined match ${data.matchId}`);
  }
}
