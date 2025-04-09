import  { Lock, Globe, Users } from 'lucide-react';

interface RoomInfoProps {
  roomName: string;
  isPrivate: boolean;
  onlineCount?: number;
}

export default function RoomInfo({ roomName, isPrivate, onlineCount }: RoomInfoProps) {
  return (
    <div className="bg-gray-50 p-3 rounded-lg mb-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {isPrivate ? (
            <Lock size={16} className="text-indigo-600 mr-2" />
          ) : (
            <Globe size={16} className="text-green-600 mr-2" />
          )}
          
          <div>
            <h3 className="font-medium text-gray-800">
              {isPrivate ? 'Private Room' : 'Public Lobby'}
            </h3>
            {isPrivate && (
              <p className="text-xs text-gray-500">
                Room ID: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">{roomName}</span>
              </p>
            )}
          </div>
        </div>
        
        {onlineCount !== undefined && (
          <div className="flex items-center text-sm text-gray-600">
            <Users size={14} className="mr-1" />
            <span>{onlineCount} online</span>
          </div>
        )}
      </div>
      
      <p className="text-xs text-gray-500 mt-1">
        {isPrivate 
          ? 'Only people with this room ID can join this conversation.' 
          : 'Everyone can see messages in this public lobby.'}
      </p>
      
      {isPrivate && (
        <div className="mt-2 bg-blue-50 py-1 px-2 rounded text-xs text-blue-700">
          Messages in this room are delivered to all participants in real-time
        </div>
      )}
    </div>
  );
}
 
