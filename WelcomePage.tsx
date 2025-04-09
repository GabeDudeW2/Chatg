import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, Server } from 'lucide-react';

interface WelcomePageProps {
  onSetUsername: (name: string) => void;
}

export default function WelcomePage({ onSetUsername }: WelcomePageProps) {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim()) {
      onSetUsername(name.trim());
      
      if (isJoining && roomId.trim()) {
        navigate(`/room/${roomId.trim()}`);
      } else {
        navigate('/lobby');
      }
    }
  };

  const generateRandomRoomId = () => {
    const randomId = Math.random().toString(36).substring(2, 10);
    setRoomId(randomId);
    setIsJoining(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-2">
            <MessageSquare className="text-indigo-600 mr-2" size={32} />
            <h1 className="text-2xl font-bold text-gray-800">ChatConnect</h1>
          </div>
          <div className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            <Server size={12} className="mr-1" />
            Real-Time Chat
          </div>
          <p className="text-gray-600 mt-2">Connect with others in real-time</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="What should we call you?"
              required
              autoFocus
            />
          </div>
          
          <div className="flex items-center">
            <div className="flex-grow h-px bg-gray-300"></div>
            <div className="px-3 text-gray-500 text-sm">JOIN OR CREATE</div>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>
          
          <div>
            <div className="flex items-center mb-4">
              <input
                id="join-lobby"
                name="room-choice"
                type="radio"
                checked={!isJoining}
                onChange={() => setIsJoining(false)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="join-lobby" className="ml-2 text-gray-700">
                Join public lobby
              </label>
            </div>
            
            <div className="flex items-center mb-2">
              <input
                id="join-room"
                name="room-choice"
                type="radio"
                checked={isJoining}
                onChange={() => setIsJoining(true)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="join-room" className="ml-2 text-gray-700">
                Join or create a private room
              </label>
            </div>
            
            {isJoining && (
              <div className="mt-3 flex">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Room ID (e.g., my-team-chat)"
                  required={isJoining}
                />
                <button
                  type="button"
                  onClick={generateRandomRoomId}
                  className="bg-gray-200 text-gray-700 px-3 py-2 rounded-r-lg hover:bg-gray-300"
                >
                  Random
                </button>
              </div>
            )}
          </div>
          
          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center"
              disabled={!name.trim() || (isJoining && !roomId.trim())}
            >
              <Users size={18} className="mr-2" />
              {isJoining ? 'Join Room' : 'Join Public Lobby'}
            </button>
          </div>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Chat directly from your browser - no login required
            </p>
            <div className="mt-4 flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1604881989793-466aca8dd319?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjBjaGF0JTIwaW50ZXJmYWNlJTIwdWl8ZW58MHx8fHwxNzQ0MTY3OTExfDA&ixlib=rb-4.0.3&fit=fillmax&h=600&w=800"
                alt="Chat interface preview"
                className="h-24 rounded-lg shadow-sm object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 