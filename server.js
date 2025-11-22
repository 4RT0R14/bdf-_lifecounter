const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

const rooms = {}; // store game states per room

io.on('connection', (socket) => {
  console.log('A user connected');

  // Join a room
  socket.on('joinRoom', (roomCode) => {
    socket.join(roomCode);

    if (!rooms[roomCode]) {
      rooms[roomCode] = { life1: 10, life2: 10, ap1: 10, ap2: 10, power1: 0, power2: 0 };
    }

    // Send current state to the new player only
    io.to(socket.id).emit('updateState', rooms[roomCode]);
  });

  // State update (life/AP/power)
  socket.on('updateState', ({ roomCode, newState }) => {
    rooms[roomCode] = newState;
    // Broadcast updated state to everyone in room except sender
    socket.to(roomCode).emit('updateState', newState);
  });

  // Random start player
  socket.on('randomStart', ({ roomCode, firstPlayer }) => {
    // Broadcast to all clients in the same room
    io.to(roomCode).emit('randomStart', { firstPlayer });
  });

  // Start rolling animation (THIS MUST BE INSIDE connection)
  socket.on('startRolling', (roomCode) => {
    io.to(roomCode).emit('startRolling');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
