import  { Message } from '../types';

// Cloudflare API URL (would be your actual Cloudflare Worker URL in production)
const CLOUDFLARE_API_URL = 'https://chat.g-is-good.workers.dev';

// In-memory room storage for demo
const roomData: Record<string, {
  messages: Message[];
  users: Set<string>;
}> = {
  'lobby': {
    messages: [
      { id: '1', text: 'Welcome to the public lobby!', sender: 'System', timestamp: Date.now() - 60000, isMine: false, roomId: 'lobby' }
    ],
    users: new Set()
  }
};

// Simulated Cloudflare Worker service for chat functionality
export const cloudflareService = {
  // Get all messages for a specific room
  getMessages: async (roomId: string = 'lobby'): Promise<Message[]> => {
    try {
      // In a real app, this would fetch from your Cloudflare Worker
      // return await fetch(`${CLOUDFLARE_API_URL}/rooms/${roomId}/messages`).then(res => res.json());
      
      // For demo purposes, we'll return mock data
      if (!roomData[roomId]) {
        // Create the room if it doesn't exist
        roomData[roomId] = {
          messages: [
            { 
              id: Date.now().toString(), 
              text: `Welcome to ${roomId === 'lobby' ? 'the public lobby' : `room ${roomId}`}!`, 
              sender: 'System', 
              timestamp: Date.now(), 
              isMine: false,
              roomId
            }
          ],
          users: new Set()
        };
      }
      
      return roomData[roomId].messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },
  
  // Send a new message to a specific room
  sendMessage: async (messageText: string, senderName: string, roomId: string = 'lobby'): Promise<Message | null> => {
    try {
      // In a real app, this would post to your Cloudflare Worker
      /*
      return await fetch(`${CLOUDFLARE_API_URL}/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: messageText, sender: senderName })
      }).then(res => res.json());
      */
      
      // For demo purposes, we'll store locally
      if (!roomData[roomId]) {
        roomData[roomId] = {
          messages: [],
          users: new Set()
        };
      }
      
      const newMessage = {
        id: Date.now().toString(),
        text: messageText,
        sender: senderName,
        timestamp: Date.now(),
        isMine: true,
        roomId
      };
      
      roomData[roomId].messages.push(newMessage);
      
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  },
  
  // Handle WebSocket connection for real-time updates for a specific room
  createWebSocketConnection: (
    roomId: string = 'lobby',
    onMessage: (message: Message) => void,
    onUserCount: (count: number) => void,
    onConnect: () => void,
    onDisconnect: () => void
  ) => {
    // In a real app, this would be a WebSocket connection to your Cloudflare Worker
    // const ws = new WebSocket(`wss://chat-app-worker.yourdomain.workers.dev/rooms/${roomId}`);
    
    // For demo purposes, we'll simulate WebSocket events
    console.log(`Connecting to room: ${roomId}...`);
    
    // Initialize room if needed
    if (!roomData[roomId]) {
      roomData[roomId] = {
        messages: [
          { 
            id: Date.now().toString(), 
            text: `Welcome to ${roomId === 'lobby' ? 'the public lobby' : `room ${roomId}`}!`, 
            sender: 'System', 
            timestamp: Date.now(), 
            isMine: false,
            roomId
          }
        ],
        users: new Set()
      };
    }
    
    // Add a random ID to represent this user
    const userId = `user-${Math.random().toString(36).substring(2, 9)}`;
    roomData[roomId].users.add(userId);
    
    // Simulate connection
    setTimeout(() => {
      console.log(`Connected to room: ${roomId}`);
      onConnect();
      onUserCount(roomData[roomId].users.size);
    }, 1000);
    
    // Return cleanup function
    return () => {
      console.log(`Disconnecting from room: ${roomId}`);
      // Remove user from room
      roomData[roomId].users.delete(userId);
      onDisconnect();
    };
  }
};

// In a real implementation, this would be deployed to Cloudflare Workers
export const cloudflareWorkerCode = `
// Cloudflare Worker code for chat app with room support

// Define KV namespace (you would bind this in your Cloudflare dashboard)
// const CHAT_MESSAGES = CHAT_MESSAGES_KV;

// Initialize Durable Object for WebSocket connections
// export class ChatRoom {
//   constructor(state, env) {
//     this.state = state;
//     this.env = env;
//     this.sessions = new Map();
//     this.messages = [];
//     this.roomId = '';
//   }

//   async fetch(request) {
//     let url = new URL(request.url);
//     
//     // Extract room ID from the path
//     const pathParts = url.pathname.split('/');
//     if (pathParts.length >= 3 && pathParts[1] === 'rooms') {
//       this.roomId = pathParts[2];
//     } else {
//       this.roomId = 'lobby'; // Default room
//     }
//     
//     // Load previous messages for this room
//     if (this.messages.length === 0) {
//       const storedMessages = await this.env.CHAT_MESSAGES.get(\`room:\${this.roomId}\`);
//       if (storedMessages) {
//         this.messages = JSON.parse(storedMessages);
//       }
//     }
//     
//     // Handle WebSocket connections
//     if (request.headers.get("Upgrade") === "websocket") {
//       let pair = new WebSocketPair();
//       let [client, server] = Object.values(pair);
//       
//       // Store the WebSocket connection
//       let sessionId = crypto.randomUUID();
//       this.sessions.set(sessionId, {
//         webSocket: server,
//         username: "Anonymous"
//       });
//       
//       // Send initial data to the client
//       server.accept();
//       server.send(JSON.stringify({
//         type: "welcome",
//         messages: this.messages.slice(-100),
//         userCount: this.sessions.size,
//         roomId: this.roomId
//       }));
//       
//       // Set up event handlers for the WebSocket
//       server.addEventListener("message", async (event) => {
//         try {
//           let data = JSON.parse(event.data);
//           
//           if (data.type === "message") {
//             // Create a new message
//             let message = {
//               id: crypto.randomUUID(),
//               text: data.text,
//               sender: data.sender || "Anonymous",
//               timestamp: Date.now(),
//               roomId: this.roomId
//             };
//             
//             // Store the message
//             this.messages.push(message);
//             if (this.messages.length > 1000) {
//               this.messages.shift();
//             }
//             
//             // Save messages to KV
//             await this.env.CHAT_MESSAGES.put(
//               \`room:\${this.roomId}\`, 
//               JSON.stringify(this.messages)
//             );
//             
//             // Broadcast the message to all connected clients in this room
//             this.broadcast({
//               type: "newMessage",
//               message
//             });
//           } else if (data.type === "setUsername") {
//             let session = this.sessions.get(sessionId);
//             if (session) {
//               let oldUsername = session.username;
//               session.username = data.username;
//               
//               // Notify clients about the name change
//               this.broadcast({
//                 type: "systemMessage",
//                 message: {
//                   id: crypto.randomUUID(),
//                   text: \`\${oldUsername} is now known as \${data.username}\`,
//                   sender: "System",
//                   timestamp: Date.now(),
//                   roomId: this.roomId
//                 }
//               });
//             }
//           }
//         } catch (error) {
//           console.error("Error processing WebSocket message:", error);
//         }
//       });
//       
//       // Handle WebSocket close
//       server.addEventListener("close", () => {
//         this.sessions.delete(sessionId);
//         // Notify remaining clients
//         this.broadcast({
//           type: "userCount",
//           count: this.sessions.size
//         });
//       });
//       
//       return new Response(null, { 
//         status: 101,
//         webSocket: client
//       });
//     }
//     
//     // Handle HTTP requests
//     if (url.pathname === \`/rooms/\${this.roomId}/messages\` && request.method === "GET") {
//       return new Response(JSON.stringify(this.messages.slice(-100)), {
//         headers: { "Content-Type": "application/json" }
//       });
//     } else if (url.pathname === \`/rooms/\${this.roomId}/messages\` && request.method === "POST") {
//       const data = await request.json();
//       
//       if (!data.text || !data.sender) {
//         return new Response(JSON.stringify({ error: "Message text and sender required" }), {
//           status: 400,
//           headers: { "Content-Type": "application/json" }
//         });
//       }
//       
//       const message = {
//         id: crypto.randomUUID(),
//         text: data.text,
//         sender: data.sender,
//         timestamp: Date.now(),
//         roomId: this.roomId
//       };
//       
//       this.messages.push(message);
//       if (this.messages.length > 1000) {
//         this.messages.shift();
//       }
//       
//       // Save messages to KV
//       await this.env.CHAT_MESSAGES.put(
//         \`room:\${this.roomId}\`, 
//         JSON.stringify(this.messages)
//       );
//       
//       // Broadcast the message to all connected clients
//       this.broadcast({
//         type: "newMessage",
//         message
//       });
//       
//       return new Response(JSON.stringify(message), {
//         headers: { "Content-Type": "application/json" }
//       });
//     }
//     
//     return new Response("Not found", { status: 404 });
//   }
//   
//   // Broadcast a message to all connected WebSocket clients in this room
//   broadcast(message) {
//     this.sessions.forEach(session => {
//       try {
//         session.webSocket.send(JSON.stringify(message));
//       } catch (error) {
//         console.error("Error broadcasting message:", error);
//       }
//     });
//   }
// }

// Main worker request handler
// export default {
//   async fetch(request, env) {
//     let url = new URL(request.url);
//     
//     // Extract room ID from the path and create appropriate Durable Object
//     const pathParts = url.pathname.split('/');
//     let roomId = 'lobby';
//     
//     if (pathParts.length >= 3 && pathParts[1] === 'rooms') {
//       roomId = pathParts[2];
//     }
//     
//     // Route request to the appropriate Durable Object
//     let id = env.CHAT_ROOM.idFromName(roomId);
//     let room = env.CHAT_ROOM.get(id);
//     return room.fetch(request);
//   }
// };
`;
 
