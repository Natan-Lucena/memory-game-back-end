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
import { Model, Types } from 'mongoose';
import { Team } from 'src/teams/team.schema';
import { Match } from 'src/match/match.schema';

interface Ranking {
  id: string;
  name: string;
  score: number;
}

@WebSocketGateway()
export class MemoryGameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    @InjectModel('Team') private readonly teamModel: Model<Team>,
    @InjectModel('Match') private readonly matchModel: Model<Match>,
  ) {}

  async afterInit(server: Server) {
    console.log('WebSocket server initialized');
    const match = new this.matchModel();
    await match.save();
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
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

    const match = await this.matchModel.findById(data.matchId);

    match.ranking.push({ id: team.id, name: team.name, score: 0 });
    await match.save();

    this.server.emit(
      'players',
      match.ranking.sort((a, b) => b.score - a.score),
    );
  }

  @SubscribeMessage('updateScore')
  async handleScoreUpdate(
    @MessageBody() data: { id: string; score: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { id, score } = data;
    const objectId = new Types.ObjectId(id);
    const team = await this.teamModel.findById(objectId);

    if (!team) {
      console.log('Time não encontrado');
      return;
    }

    team.score += score;
    await team.save();

    const match = await this.matchModel.findById(team.matchId);

    match.ranking = match.ranking.map((r) =>
      r.id === id ? { ...r, score: team.score } : r,
    );

    await match.save();

    this.server.emit(
      'updateScore',
      match.ranking.sort((a, b) => b.score - a.score),
    );
  }
}
