//  Cloudflare Worker for real-time chat application

// In-memory storage for demo purposes (use KV in production)
const rooms = new Map();

// Utility to generate unique IDs
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Create response headers with CORS support
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

// Handle WebSocket connections
async function handleWebSocket(request, env) {
  // Extract URL params
  const url = new URL(request.url);
  const roomId = url.pathname.split('/').pop() || 'lobby';
  
  // Accept the WebSocket connection
  const pair = new WebSocketPair();
  const [client, server] = Object.values(pair);
  
  // Ensure room exists
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      messages: [{
        id: generateId(),
        text: `Welcome to ${roomId === 'lobby' ? 'the public lobby' : `room ${roomId}`}!`,
        sender: 'System',
        timestamp: Date.now(),
        roomId
      }],
      clients: new Map()
    });
  }
  
  const room = rooms.get(roomId);
  let username = 'Anonymous';
  
  // Accept and store the WebSocket
  server.accept();
  const clientId = generateId();
  
  // Send room history on connection
  server.send(JSON.stringify({
    type: 'history',
    messages: room.messages
  }));
  
  // Add client to room with initial username
  room.clients.set(clientId, {
    socket: server,
    username
  });
  
  // Send updated user count
  room.clients.forEach(client => {
    client.socket.send(JSON.stringify({
      type: 'userCount',
      count: room.clients.size
    }));
  });
  
  // Handle messages from the client
  server.addEventListener('message', async event => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'join') {
        username = data.username || username;
        
        // Update client info
        room.clients.set(clientId, {
          socket: server,
          username
        });
        
        // Announce user joined
        const joinMessage = {
          id: generateId(),
          text: `${username} has joined the chat.`,
          sender: 'System',
          timestamp: Date.now(),
          roomId
        };
        
        room.messages.push(joinMessage);
        if (room.messages.length > 100) room.messages.shift();
        
        // Broadcast to all clients in the room
        room.clients.forEach(client => {
          client.socket.send(JSON.stringify({
            type: 'message',
            message: joinMessage
          }));
          
          // Send updated user list and count
          const users = Array.from(room.clients.values()).map(c => c.username);
          client.socket.send(JSON.stringify({
            type: 'userList',
            users
          }));
          
          client.socket.send(JSON.stringify({
            type: 'userCount',
            count: room.clients.size
          }));
        });
      }
      else if (data.type === 'message') {
        const message = {
          id: generateId(),
          text: data.text,
          sender: username,
          timestamp: Date.now(),
          roomId
        };
        
        room.messages.push(message);
        if (room.messages.length > 100) room.messages.shift();
        
        // Broadcast to all clients
        room.clients.forEach(client => {
          client.socket.send(JSON.stringify({
            type: 'message',
            message: {
              ...message,
              isMine: client.username === username
            }
          }));
        });
      }
      else if (data.type === 'getUsers') {
        // Send user list
        const users = Array.from(room.clients.values()).map(c => c.username);
        server.send(JSON.stringify({
          type: 'userList',
          users
        }));
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  });
  
  // Handle disconnection
  server.addEventListener('close', () => {
    // Remove client from room
    room.clients.delete(clientId);
    
    // Announce user left
    const leaveMessage = {
      id: generateId(),
      text: `${username} has left the chat.`,
      sender: 'System',
      timestamp: Date.now(),
      roomId
    };
    
    room.messages.push(leaveMessage);
    if (room.messages.length > 100) room.messages.shift();
    
    // Broadcast to remaining clients
    room.clients.forEach(client => {
      client.socket.send(JSON.stringify({
        type: 'message',
        message: leaveMessage
      }));
      
      // Send updated user count
      client.socket.send(JSON.stringify({
        type: 'userCount',
        count: room.clients.size
      }));
      
      // Send updated user list
      const users = Array.from(room.clients.values()).map(c => c.username);
      client.socket.send(JSON.stringify({
        type: 'userList',
        users
      }));
    });
    
    // Clean up empty rooms (except lobby)
    if (roomId !== 'lobby' && room.clients.size === 0) {
      rooms.delete(roomId);
    }
  });
  
  return new Response(null, {
    status: 101,
    webSocket: client,
    headers: corsHeaders()
  });
}

// Handle HTTP requests
async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders()
    });
  }
  
  // WebSocket upgrade for chat
  if (path.startsWith('/api/chat/') && request.headers.get('Upgrade') === 'websocket') {
    return handleWebSocket(request, env);
  }
  
  // REST API endpoints
  if (path.startsWith('/api/rooms')) {
    const roomId = path.split('/')[3] || 'lobby';
    
    if (request.method === 'GET') {
      // Get room data (messages, user count)
      const room = rooms.get(roomId) || { 
        messages: [],
        clients: new Map()
      };
      
      return new Response(JSON.stringify({
        messages: room.messages,
        userCount: room.clients.size
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders()
        }
      });
    }
  }
  
  // Default response for unknown endpoints
  return new Response('Not found', { 
    status: 404,
    headers: corsHeaders()
  });
}

// Main entry point for the Cloudflare Worker
export default {
  async fetch(request, env, ctx) {
    try {
      return await handleRequest(request, env);
    } catch (e) {
      return new Response(`Server error: ${e.message}`, {
        status: 500,
        headers: corsHeaders()
      });
    }
  }
};

/* 
Durable Objects implementation for production use:
This is commented out as it requires proper Cloudflare setup.

export class ChatRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
    this.messages = [];
    this.storage = state.storage;
  }

  async fetch(request) {
    // Implementation for production with persistent storage
  }
}
*/
 
