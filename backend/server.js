// backend/server.js
const express = require('express');
const path = require('path');

const app = express();

// Make an HTTP server and attach Socket.IO to it
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http);

// Store messages here (resets when server stops)
const messages = [];

// Serve the frontend files (so you just open http://localhost:3000)
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// When someone connects
io.on('connection', (socket) => {
  console.log('Someone joined:', socket.id);

  // Send old messages first
  socket.emit('initial messages', messages);

  // When we receive a message from a user
  socket.on('chat message', (msg) => {
    // msg should look like: { user: "Name", text: "Hello" }
    const full = { ...msg, time: Date.now() };
    messages.push(full);
    if (messages.length > 100) messages.shift(); // keep last 100

    // Send the new message to EVERYONE
    io.emit('chat message', full);
  });

  socket.on('disconnect', () => {
    console.log('Someone left:', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Open http://localhost:${PORT}`);
});
