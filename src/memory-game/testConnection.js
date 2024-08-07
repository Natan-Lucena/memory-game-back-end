const { log } = require('console');
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

socket.on('connect', () => {
  socket.emit('message', 'Hello from test client!');
});

socket.on('players', (players) => {
  console.log('Ranking: ', players);
});

socket.emit('updateScore', Math.floor(Math.random() * 100));

socket.on('updateScore', (players) => {
  console.log('Ranking: ', players);
});
