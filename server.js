const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

const rooms = {}; // store game states per room

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('joinRoom', (roomCode) => {
    socket.join(roomCode);

    if (!rooms[roomCode]) {
      rooms[roomCode] = { life1: 10, life2: 10, ap1: 10, ap2: 10, power1: 0, power2: 0 };
    }

    // Send current state to the new player
    io.to(socket.id).emit('updateState', rooms[roomCode]);
  });

  socket.on('updateState', ({ roomCode, newState }) => {
    rooms[roomCode] = newState;
    // Broadcast updated state to everyone in room except sender
    socket.to(roomCode).emit('updateState', newState);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
