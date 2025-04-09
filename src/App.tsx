import  { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import ChatRoom from './pages/ChatRoom';

function App() {
  const location = useLocation();
  const [username, setUsername] = useState(() => 
    localStorage.getItem('chatUsername') || '');
  
  // Check for username update from location state
  useEffect(() => {
    if (location.state && 'newUsername' in location.state) {
      const newName = location.state.newUsername;
      if (newName && typeof newName === 'string') {
        setUsername(newName);
      }
    }
  }, [location]);
  
  // Save username to localStorage when it changes
  useEffect(() => {
    if (username) {
      localStorage.setItem('chatUsername', username);
    }
  }, [username]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 z-0"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjaGF0JTIwaW50ZXJmYWNlJTIwdWl8ZW58MHx8fHwxNzQ0MTY3OTExfDA&ixlib=rb-4.0.3&fit=fillmax&h=600&w=800)' }}
      />
      
      <div className="relative z-10 w-full flex-grow">
        <Routes>
          <Route 
            path="/" 
            element={
              username ? (
                <Navigate to="/lobby" replace />
              ) : (
                <WelcomePage onSetUsername={setUsername} />
              )
            } 
          />
          <Route 
            path="/room/:roomId" 
            element={
              username ? (
                <ChatRoom username={username} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/lobby" 
            element={
              username ? (
                <ChatRoom username={username} isLobby={true} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
 
