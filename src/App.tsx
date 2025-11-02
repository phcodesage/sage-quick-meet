import { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { Room } from './pages/Room';

type View = 'home' | 'room';

function App() {
  const [view, setView] = useState<View>('home');
  const [roomId, setRoomId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const path = window.location.pathname;
    const roomMatch = path.match(/\/room\/([^\/]+)/);

    if (roomMatch) {
      setRoomId(roomMatch[1]);
      // Don't automatically set view to 'room' if no userName
      // This will trigger the name prompt in the render logic
      if (userName) {
        setView('room');
      }
    }
  }, [userName]);

  const handleCreateMeeting = (newRoomId: string, name: string) => {
    setRoomId(newRoomId);
    setUserName(name);
    setView('room');
    window.history.pushState({}, '', `/room/${newRoomId}`);
  };

  const handleJoinMeeting = (existingRoomId: string, name: string) => {
    setRoomId(existingRoomId);
    setUserName(name);
    setView('room');
    window.history.pushState({}, '', `/room/${existingRoomId}`);
  };

  const handleLeave = () => {
    setView('home');
    setRoomId('');
    setUserName('');
    window.history.pushState({}, '', '/');
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const roomMatch = path.match(/\/room\/([^\/]+)/);

      if (roomMatch) {
        setRoomId(roomMatch[1]);
        setView('room');
      } else {
        setView('home');
        setRoomId('');
        setUserName('');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (view === 'room' && roomId) {
    if (!userName) {
      return (
        <Home
          onCreateMeeting={handleCreateMeeting}
          onJoinMeeting={handleJoinMeeting}
        />
      );
    }

    return (
      <Room
        roomId={roomId}
        userName={userName}
        onLeave={handleLeave}
      />
    );
  }

  return (
    <Home
      onCreateMeeting={handleCreateMeeting}
      onJoinMeeting={handleJoinMeeting}
    />
  );
}

export default App;
