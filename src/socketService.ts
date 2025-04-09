import  { io, Socket } from 'socket.io-client';
import { Message } from '../types';

// Determine the Socket.io server URL based on the environment
const getSocketUrl = () => {
  // When running with Vite dev server
  if (import.meta.env.DEV) {
    return 'http://localhost:3000';
  }
  // In production, use the same host that serves the frontend
  return window.location.origin;
};

class SocketService {
  private socket: Socket | null = null;
  private roomId: string = '';
  private username: string = '';

  // Connect to the Socket.io server
  connect(): Socket {
    if (!this.socket) {
      this.socket = io(getSocketUrl());
      console.log('Socket connected');
    }
    return this.socket;
  }

  // Disconnect from the server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected');
    }
  }

  // Join a specific chat room
  joinRoom(roomId: string, username: string): void {
    if (!this.socket) {
      this.connect();
    }
    
    this.roomId = roomId;
    this.username = username;
    
    this.socket?.emit('joinRoom', { room: roomId, username });
    console.log(`Joining room: ${roomId} as ${username}`);
  }

  // Send a message to the current room
  sendMessage(text: string): void {
    if (!this.socket || !this.roomId) {
      console.error('Cannot send message: Socket not connected or room not joined');
      return;
    }
    
    this.socket.emit('sendMessage', { text });
  }

  // Request list of users in the current room
  getUsers(): void {
    if (!this.socket || !this.roomId) {
      console.error('Cannot get users: Socket not connected or room not joined');
      return;
    }
    
    this.socket.emit('getUsers', this.roomId);
  }

  // Listen for new messages
  onMessage(callback: (message: Message) => void): () => void {
    if (!this.socket) {
      this.connect();
    }
    
    const handler = (message: Message) => {
      // Mark messages as "mine" if sent by the current user
      const isMine = message.sender === this.username;
      callback({ ...message, isMine });
    };
    
    this.socket?.on('message', handler);
    return () => {
      this.socket?.off('message', handler);
    };
  }

  // Listen for room history
  onRoomHistory(callback: (messages: Message[]) => void): () => void {
    if (!this.socket) {
      this.connect();
    }
    
    const handler = (messages: Message[]) => {
      // Mark messages as "mine" if sent by the current user
      const processedMessages = messages.map(message => ({
        ...message,
        isMine: message.sender === this.username
      }));
      callback(processedMessages);
    };
    
    this.socket?.on('roomHistory', handler);
    return () => {
      this.socket?.off('roomHistory', handler);
    };
  }

  // Listen for user count updates
  onUserCount(callback: (count: number) => void): () => void {
    if (!this.socket) {
      this.connect();
    }
    
    this.socket?.on('userCount', callback);
    return () => {
      this.socket?.off('userCount', callback);
    };
  }

  // Listen for user list updates
  onUserList(callback: (users: string[]) => void): () => void {
    if (!this.socket) {
      this.connect();
    }
    
    this.socket?.on('userList', callback);
    return () => {
      this.socket?.off('userList', callback);
    };
  }

  // Listen for connection status
  onConnect(callback: () => void): () => void {
    if (!this.socket) {
      this.connect();
    }
    
    this.socket?.on('connect', callback);
    return () => {
      this.socket?.off('connect', callback);
    };
  }

  // Listen for disconnection
  onDisconnect(callback: () => void): () => void {
    if (!this.socket) {
      this.connect();
    }
    
    this.socket?.on('disconnect', callback);
    return () => {
      this.socket?.off('disconnect', callback);
    };
  }
}

// Create a singleton instance
export const socketService = new SocketService();
 