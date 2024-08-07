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
