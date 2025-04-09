import  { MessageSquare, Settings, Users, Server, Lock, Globe } from 'lucide-react';

interface HeaderProps {
  username: string;
  onProfileClick: () => void;
  onUsersClick?: () => void;
  onlineCount: number;
  roomName: string;
  isPrivate: boolean;
}

export default function Header({ 
  username, 
  onProfileClick, 
  onUsersClick, 
  onlineCount, 
  roomName, 
  isPrivate 
}: HeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 py-3 px-4 flex justify-between items-center">
      <div className="flex items-center">
        <MessageSquare className="text-indigo-600 mr-2" size={24} />
        <h1 className="text-xl font-bold text-gray-800">ChatConnect</h1>
        <div className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
          <Server size={12} className="mr-1" />
          Real-Time
        </div>
      </div>
      
      <div className="flex items-center">
        <div className="flex items-center mr-3 text-gray-700 text-sm">
          {isPrivate ? (
            <Lock size={14} className="text-indigo-600 mr-1" />
          ) : (
            <Globe size={14} className="text-green-600 mr-1" />
          )}
          <span className="max-w-[140px] truncate">{roomName}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onUsersClick}
            className="flex items-center text-sm text-gray-600 hover:text-indigo-600"
          >
            <Users size={16} className="mr-1" />
            <span>{onlineCount} online</span>
          </button>
          
          <button 
            onClick={onProfileClick}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
          >
            <span className="font-medium truncate max-w-[120px]">{username}</span>
            <Settings size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
 