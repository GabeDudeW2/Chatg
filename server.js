const  express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files from dist directory after build
app.use(express.static(path.join(__dirname, 'dist')));

// Store active rooms and their users
const rooms = {
  'lobby': {
    users: {},
    messages: []
  }
};

// Store last 100 messages per room
const MAX_MESSAGES = 100;

io.on('connection', (socket) => {
  let currentRoom = '';
  let currentUser = '';

  console.log('New client connected:', socket.id);

  // Join a room
  socket.on('joinRoom', ({ room, username }) => {
    // Leave previous room if any
    if (currentRoom) {
      socket.leave(currentRoom);
      if (rooms[currentRoom] && rooms[currentRoom].users[socket.id]) {
        const user = rooms[currentRoom].users[socket.id];
        delete rooms[currentRoom].users[socket.id];
        
        // Notify room that user has left
        io.to(currentRoom).emit('message', {
          id: `system-${Date.now()}`,
          sender: 'System',
          text: `${user.username} has left the chat.`,
          timestamp: Date.now(),
          roomId: currentRoom
        });
        
        // Update user count
        io.to(currentRoom).emit('userCount', Object.keys(rooms[currentRoom].users).length);
      }
    }

    // Create room if it doesn't exist
    if (!rooms[room]) {
      rooms[room] = {
        users: {},
        messages: [{
          id: `system-welcome-${Date.now()}`,
          sender: 'System',
          text: `Welcome to ${room === 'lobby' ? 'the public lobby' : `room ${room}`}!`,
          timestamp: Date.now(),
          roomId: room
        }]
      };
    }

    // Join new room
    currentRoom = room;
    currentUser = username;
    socket.join(room);
    
    // Add user to room
    rooms[room].users[socket.id] = {
      id: socket.id,
      username
    };
    
    // Send room history to new user
    socket.emit('roomHistory', rooms[room].messages);
    
    // Notify room that user has joined
    const joinMessage = {
      id: `system-join-${Date.now()}`,
      sender: 'System',
      text: `${username} has joined the chat.`,
      timestamp: Date.now(),
      roomId: room
    };
    
    rooms[room].messages.push(joinMessage);
    if (rooms[room].messages.length > MAX_MESSAGES) {
      rooms[room].messages.shift();
    }
    
    io.to(room).emit('message', joinMessage);
    
    // Send updated user count
    io.to(room).emit('userCount', Object.keys(rooms[room].users).length);
    
    console.log(`${username} joined room: ${room}`);
  });

  // Handle new messages
  socket.on('sendMessage', (messageData) => {
    if (!currentRoom || !rooms[currentRoom]) return;
    
    const newMessage = {
      id: `msg-${socket.id}-${Date.now()}`,
      sender: currentUser,
      text: messageData.text,
      timestamp: Date.now(),
      roomId: currentRoom
    };
    
    // Save message to room history
    rooms[currentRoom].messages.push(newMessage);
    if (rooms[currentRoom].messages.length > MAX_MESSAGES) {
      rooms[currentRoom].messages.shift();
    }
    
    // Send to all clients in the room
    io.to(currentRoom).emit('message', newMessage);
    
    console.log(`New message in ${currentRoom} from ${currentUser}: ${messageData.text}`);
  });

  // Get active users in a room
  socket.on('getUsers', (room) => {
    if (rooms[room]) {
      const userList = Object.values(rooms[room].users).map(u => u.username);
      socket.emit('userList', userList);
    }
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    if (currentRoom && rooms[currentRoom] && rooms[currentRoom].users[socket.id]) {
      const user = rooms[currentRoom].users[socket.id];
      delete rooms[currentRoom].users[socket.id];
      
      // Notify room that user has left
      const leaveMessage = {
        id: `system-leave-${Date.now()}`,
        sender: 'System',
        text: `${user.username} has left the chat.`,
        timestamp: Date.now(),
        roomId: currentRoom
      };
      
      rooms[currentRoom].messages.push(leaveMessage);
      if (rooms[currentRoom].messages.length > MAX_MESSAGES) {
        rooms[currentRoom].messages.shift();
      }
      
      io.to(currentRoom).emit('message', leaveMessage);
      
      // Update user count
      io.to(currentRoom).emit('userCount', Object.keys(rooms[currentRoom].users).length);
      
      console.log(`${user.username} has disconnected from ${currentRoom}`);
      
      // Clean up empty rooms (except lobby)
      if (currentRoom !== 'lobby' && Object.keys(rooms[currentRoom].users).length === 0) {
        console.log(`Removing empty room: ${currentRoom}`);
        delete rooms[currentRoom];
      }
    }
    
    console.log('Client disconnected:', socket.id);
  });
});

// Fallback route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
 