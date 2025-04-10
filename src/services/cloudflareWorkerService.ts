import  { Message } from '../types';

// URL to your deployed Cloudflare Worker
// Update this when you deploy your worker
const WORKER_URL = 'https://chat.g-is-good.workers.dev';

export const cloudflareWorkerService = {
  // Connect to WebSocket for real-time updates
  connectToRoom: (
    roomId: string,
    username: string,
    onMessage: (message: Message) => void,
    onUserCount: (count: number) => void,
    onUserList: (users: string[]) => void,
    onConnect: () => void,
    onDisconnect: () => void
  ) => {
    // Create WebSocket connection to the worker
    const wsUrl = `${WORKER_URL.replace('https://', 'wss://')}/api/chat/${roomId}`;
    const socket = new WebSocket(wsUrl);
    
    // Handle connection open
    socket.addEventListener('open', () => {
      console.log(`Connected to Cloudflare Worker for room: ${roomId}`);
      
      // Send join message with username
      socket.send(JSON.stringify({
        type: 'join',
        username,
        roomId
      }));
      
      onConnect();
    });
    
    // Handle messages from the server
    socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message') {
          // Mark messages as mine based on sender
          onMessage({
            ...data.message,
            isMine: data.message.sender === username
          });
        }
        else if (data.type === 'history') {
          // Process message history
          const messages = data.messages.map((msg: Message) => ({
            ...msg,
            isMine: msg.sender === username
          }));
          
          // Call message handler for each message
          messages.forEach((msg: Message) => onMessage(msg));
        }
        else if (data.type === 'userCount') {
          onUserCount(data.count);
        }
        else if (data.type === 'userList') {
          onUserList(data.users);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    // Handle disconnection
    socket.addEventListener('close', () => {
      console.log(`Disconnected from Cloudflare Worker for room: ${roomId}`);
      onDisconnect();
    });
    
    // Handle errors
    socket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
      onDisconnect();
    });
    
    // Return a function to disconnect and clean up
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  },
  
  // Send a message to the current room
  sendMessage: (text: string, roomId: string) => {
    // In the WebSocket implementation, messages are sent through the
    // WebSocket connection established in connectToRoom
    if (window.chatSocket && window.chatSocket.readyState === WebSocket.OPEN) {
      window.chatSocket.send(JSON.stringify({
        type: 'message',
        text,
        roomId
      }));
      return true;
    }
    return false;
  },
  
  // Request list of users in the room
  getUsers: (roomId: string) => {
    if (window.chatSocket && window.chatSocket.readyState === WebSocket.OPEN) {
      window.chatSocket.send(JSON.stringify({
        type: 'getUsers',
        roomId
      }));
      return true;
    }
    return false;
  }
};

// Declare global variable for WebSocket
declare global {
  interface Window {
    chatSocket: WebSocket;
  }
}
 
