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
  private match: Match | null = null;

  constructor(
    @InjectModel('Team') private readonly teamModel: Model<Team>,
    @InjectModel('Match') private readonly matchModel: Model<Match>,
  ) {}

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
    this.server.emit('availableMatch', !!this.match);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(
    @MessageBody() data: { teamName: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.match) {
      console.log('Match not found');
      throw new Error('There are no matches available');
    }

    const existTeam = await this.teamModel.findOne({ name: data.teamName });

    if (existTeam) {
      const error = new Error(
        `There is already a team with the name ${existTeam.name}`,
      );
      this.server.emit('error', { status: error.name, error: error.message });
      return;
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
    return JSON.stringify({ event: 'joinGame', status: 'received' });
  }

  @SubscribeMessage('endGame')
  async handleEndGame(@ConnectedSocket() client: Socket) {
    if (this.match) {
      this.server.to(this.match._id.toString()).emit('gameEnded');
      const teams = await this.teamModel.find({ matchId: this.match._id });
      client.emit('gameResult', teams);
      await this.matchModel.deleteOne({ _id: this.match._id });
      this.match = null;

      console.log('Game ended and match deleted.');
    }
    return JSON.stringify({ event: 'endGame', status: 'received' });
  }

  @SubscribeMessage('seeRanking')
  async handleSeeRanking() {
    const allTeams = await this.teamModel.find().sort({
      score: -1,
    });

    const ranking = allTeams.map((team) => {
      return {
        teamName: team.name,
        score: team.score,
      };
    });

    this.server.emit('showRanking', ranking);

    console.log(ranking);
    return JSON.stringify({ event: 'seeRanking', status: 'received' });
  }

  @SubscribeMessage('answerQuestion')
  async handleAnswerQuestion(
    @MessageBody() data: { teamName: string; difficulty: string },
  ) {
    if (!this.match) {
      const error = new Error('Match not found');
      console.log(error);
      this.server.emit('error', { status: error.name, error: error.message });
    }

    const { teamName, difficulty } = data;
    let addScore = 0;

    const team = await this.teamModel.findOne({
      name: teamName,
    });

    if (!team) {
      console.log('Team not found');
      throw new Error(`Team with name ${teamName} not found`);
    }

    switch (difficulty) {
      case 'easy':
        addScore = 125;
        break;
      case 'medium':
        addScore = 250;
        break;
      case 'hard':
        addScore = 500;
        break;
      default:
        addScore = 0;
        break;
    }

    await this.teamModel.findOneAndUpdate(
      {
        name: teamName,
      },
      {
        $inc: { score: addScore },
      },
      {
        new: true,
      },
    );

    await this.handleSeeRanking();

    return JSON.stringify({
      event: 'answerQuestion',
      status: 'received',
    });
  }

  @SubscribeMessage('startMatch')
  async handleStartMatch(@ConnectedSocket() client: Socket) {
    if (!this.match) {
      await this.matchModel.deleteMany();
      this.match = new this.matchModel();
      await this.match.save();
      console.log(`New match created with ID ${this.match._id}`);

      try {
        await this.teamModel.deleteMany({});
        this.server.emit('availableMatch', true);
        return JSON.stringify({ event: 'startMatch', status: 'received' });
      } catch (error) {
        console.log(error);
      }
    }
  }
}
