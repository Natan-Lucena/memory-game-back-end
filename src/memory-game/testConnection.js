const io = require('socket.io-client');
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log(`Connected: ${socket.id}`);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

socket.emit('joinGame', {
  teamName: 'Time das mulheres',
  matchId: '66b658800ee39cad1afdd73d',
});

socket.on('teamJoined', (team) => {
  console.log('Team joined: ', team);
});

socket.on('players', (players) => {
  console.log('Ranking: ', players);
});

socket.emit('updateScore', { id: '66b658eb0ee39cad1afdd744', score: 10 });

socket.on('updateScore', (players) => {
  console.log('Ranking: ', players);
});
