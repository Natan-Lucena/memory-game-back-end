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
  teamName: 'Time dos homens',
  matchId: '66b4d40331a52ebda94ac923',
});

socket.on('teamJoined', (team) => {
  console.log('Team joined: ', team);
});
