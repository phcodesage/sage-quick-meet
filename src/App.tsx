import { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { Room } from './pages/Room';

type View = 'home' | 'room';

function App() {
  const [view, setView] = useState<View>('home');
  const [roomId, setRoomId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [isRoomCreator, setIsRoomCreator] = useState<boolean>(false);

  useEffect(() => {
    const path = window.location.pathname;
    console.log('🔍 App: Checking URL path:', path);
    const roomMatch = path.match(/\/room\/([^\/]+)/);

    if (roomMatch) {
      console.log('🔍 App: Found room ID in URL:', roomMatch[1]);
      setRoomId(roomMatch[1]);
      // Don't automatically set view to 'room' if no userName
      // This will trigger the name prompt in the render logic
      if (userName) {
        console.log('🔍 App: User name exists, setting view to room');
        setView('room');
      } else {
        console.log('🔍 App: No user name, will show name prompt');
        setView('room'); // Set view to room to trigger the auto-join logic
      }
    } else {
      console.log('🔍 App: No room ID found in URL');
    }
  }, [userName]);

  const handleCreateMeeting = (newRoomId: string, name: string) => {
    setRoomId(newRoomId);
    setUserName(name);
    setIsRoomCreator(true);
    setView('room');
    window.history.pushState({}, '', `/room/${newRoomId}`);
  };

  const handleJoinMeeting = (existingRoomId: string, name: string) => {
    setRoomId(existingRoomId);
    setUserName(name);
    setIsRoomCreator(false);
    setView('room');
    window.history.pushState({}, '', `/room/${existingRoomId}`);
  };

  const handleLeave = () => {
    setView('home');
    setRoomId('');
    setUserName('');
    setIsRoomCreator(false);
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
      console.log('🔍 App: Rendering Home with autoJoinRoomId:', roomId);
      return (
        <Home
          onCreateMeeting={handleCreateMeeting}
          onJoinMeeting={handleJoinMeeting}
          autoJoinRoomId={roomId}
        />
      );
    }

    console.log('🔍 App: Rendering Room with roomId:', roomId, 'userName:', userName);
    return (
      <Room
        roomId={roomId}
        userName={userName}
        onLeave={handleLeave}
        isRoomCreator={isRoomCreator}
      />
    );
  }

  console.log('🔍 App: Rendering default Home, view:', view, 'roomId:', roomId);

  return (
    <Home
      onCreateMeeting={handleCreateMeeting}
      onJoinMeeting={handleJoinMeeting}
    />
  );
}

export default App;
