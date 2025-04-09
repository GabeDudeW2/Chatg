import  { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Message } from '../types';
import Header from '../components/Header';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import ProfileModal from '../components/ProfileModal';
import RoomInfo from '../components/RoomInfo';
import ShareRoomModal from '../components/ShareRoomModal';
import UserList from '../components/UserList';
import { MessageSquare, Plus, LogOut, AlertTriangle, Share2, Users } from 'lucide-react';
import { socketService } from '../services/socketService';

interface ChatRoomProps {
  username: string;
  isLobby?: boolean;
}

export default function ChatRoom({ username, isLobby = false }: ChatRoomProps) {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const currentRoom = isLobby ? 'lobby' : roomId;

  // Handle socket connection and message listening
  useEffect(() => {
    setIsLoading(true);
    setIsConnected(false);
    
    // Connect to socket server
    const socket = socketService.connect();
    
    // Set up event listeners
    const connectHandler = socketService.onConnect(() => {
      setIsConnected(true);
      // Join the room after connection is established
      socketService.joinRoom(currentRoom || 'lobby', username);
    });
    
    const disconnectHandler = socketService.onDisconnect(() => {
      setIsConnected(false);
    });
    
    // Listen for messages
    const messageHandler = socketService.onMessage((message) => {
      setMessages(prev => [...prev, message]);
    });
    
    // Listen for room history
    const historyHandler = socketService.onRoomHistory((roomMessages) => {
      setMessages(roomMessages);
      setIsLoading(false);
      // Request user list
      socketService.getUsers();
    });
    
    // Listen for user count updates
    const countHandler = socketService.onUserCount((count) => {
      setOnlineCount(count);
    });
    
    // Listen for user list updates
    const userListHandler = socketService.onUserList((users) => {
      setActiveUsers(users);
    });
    
    // Clean up on component unmount
    return () => {
      connectHandler();
      disconnectHandler();
      messageHandler();
      historyHandler();
      countHandler();
      userListHandler();
      socketService.disconnect();
    };
  }, [currentRoom, username]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = (text: string) => {
    if (!text.trim() || !isConnected) return;
    socketService.sendMessage(text);
  };

  // Handle profile update
  const handleSaveProfile = (name: string) => {
    // Update username in parent component through navigation state
    navigate('/', { state: { newUsername: name } });
  };

  // Handle creating a new room
  const handleCreateNewRoom = () => {
    const randomId = Math.random().toString(36).substring(2, 10);
    navigate(`/room/${randomId}`);
  };

  // Handle leaving a room
  const handleLeaveRoom = () => {
    navigate('/lobby');
  };

  // Ensure each message has a truly unique key for rendering
  const uniqueMessages = messages.map((message, index) => ({
    ...message,
    // Use both the message ID and index to guarantee uniqueness
    renderKey: `${message.id}-${index}`
  }));

  return (
    <div className="container mx-auto max-w-4xl p-4 h-screen flex flex-col">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
        <Header 
          username={username} 
          onProfileClick={() => setIsProfileOpen(true)}
          onUsersClick={() => setIsUsersOpen(true)}
          onlineCount={onlineCount}
          roomName={isLobby ? 'Public Lobby' : `Room: ${currentRoom}`}
          isPrivate={!isLobby}
        />
        
        {!isConnected && !isLoading && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Connecting to chat server...
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="messages-container">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <div className="w-10 h-10 border-4 border-gray-300 border-t-indigo-500 rounded-full animate-spin mb-3"></div>
              <p>Loading chat history...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <MessageSquare size={48} className="text-gray-300 mb-2" />
              <p>No messages yet. Start the conversation!</p>
              <p className="text-sm text-gray-400 mt-2">
                {isLobby 
                  ? "You're in the public lobby. Everyone can see your messages." 
                  : `You're in a private room (${currentRoom}). Share this room ID to chat with others.`}
              </p>
              
              <div className="mt-6">
                <img 
                  src="https://images.unsplash.com/photo-1604881988758-f76ad2f7aac1?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwzfHxtb2Rlcm4lMjBjaGF0JTIwaW50ZXJmYWNlJTIwdWl8ZW58MHx8fHwxNzQ0MTY3OTExfDA&ixlib=rb-4.0.3&fit=fillmax&h=600&w=800"
                  alt="Waiting for messages"
                  className="w-64 h-48 object-cover rounded-lg opacity-50"
                />
              </div>
            </div>
          ) : (
            <>
              <RoomInfo 
                roomName={isLobby ? 'Public Lobby' : currentRoom || ''}
                isPrivate={!isLobby}
                onlineCount={onlineCount}
              />
              {uniqueMessages.map((message) => (
                <ChatMessage key={message.renderKey} message={message} />
              ))}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="flex border-t border-gray-200">
          {!isLobby && (
            <>
              <button
                onClick={() => setIsShareOpen(true)}
                className="p-3 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors flex items-center"
                title="Share room"
              >
                <Share2 size={20} />
              </button>
              <button
                onClick={handleLeaveRoom}
                className="p-3 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors flex items-center"
                title="Leave room"
              >
                <LogOut size={20} />
              </button>
            </>
          )}
          
          {isLobby && (
            <>
              <button
                onClick={() => setIsUsersOpen(true)}
                className="p-3 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors flex items-center"
                title="View active users"
              >
                <Users size={20} />
              </button>
              <button
                onClick={handleCreateNewRoom}
                className="p-3 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors flex items-center"
                title="Create new private room"
              >
                <Plus size={20} />
              </button>
            </>
          )}
          
          <div className="flex-1">
            <ChatInput onSendMessage={handleSendMessage} disabled={!isConnected || isLoading} />
          </div>
        </div>
      </div>
      
      <ProfileModal 
        username={username}
        onSave={handleSaveProfile}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
      
      {!isLobby && (
        <ShareRoomModal
          roomId={currentRoom || ''}
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
        />
      )}
      
      <UserList
        users={activeUsers.length > 0 ? activeUsers : [username]}
        count={onlineCount}
        isOpen={isUsersOpen}
        onClose={() => setIsUsersOpen(false)}
      />
    </div>
  );
}
 