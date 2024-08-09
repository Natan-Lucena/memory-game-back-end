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
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private match: Match | null = null;

  constructor(
    @InjectModel('Team') private readonly teamModel: Model<Team>,
    @InjectModel('Match') private readonly matchModel: Model<Match>,
  ) { }

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(
    @MessageBody() data: { teamName: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    if (!this.match) {
      this.match = new this.matchModel();
      await this.match.save();
      console.log(`New match created with ID ${this.match._id}`);
    }
    const team = new this.teamModel({
      name: data.teamName,
      score: 0,
      matchId: this.match._id,
    });
    await team.save();
    client.join(this.match._id.toString());
    this.server.to(this.match._id.toString()).emit('teamJoined', team);

    console.log(`Team ${team.name} joined match ${this.match._id}`);
  }

  @SubscribeMessage('endGame')
  async handleEndGame(@ConnectedSocket() client: Socket): Promise<void> {
    if (this.match) {
      this.server.to(this.match._id.toString()).emit('gameEnded');
      const teams = await this.teamModel.find({ matchId: this.match._id });
      client.emit('gameResult', teams);
      await this.matchModel.deleteOne({ _id: this.match._id });
      this.match = null;

      console.log('Game ended and match deleted.');
    }
  }

  @SubscribeMessage('seeRanking')
  async handleSeeRanking() {
    const allTeams = await this.teamModel.find(
      {
        score: { $gt: 0 }
      },
      null,
      {
        sort: {
          score: -1
        }
      }
    );

    const ranking = allTeams.map((team) => {
      return {
        teamName: team.name,
        score: team.score
      }
    });

    this.server.emit('showRanking', ranking);

    console.log(ranking)
  }
}
