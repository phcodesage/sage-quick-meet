'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home } from '../../../src/views/Home';
import { Room } from '../../../src/views/Room';

interface RoomPageProps {
  params: {
    roomId: string;
  };
}

export default function RoomPage({ params }: RoomPageProps) {
  const { roomId } = params;
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [isRoomCreator, setIsRoomCreator] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem('meetingUserName');
    const storedCreator = localStorage.getItem('meetingIsRoomCreator') === 'true';
    setUserName(storedName);
    setIsRoomCreator(storedCreator);
  }, [roomId]);

  const handleLeave = () => {
    localStorage.removeItem('meetingUserName');
    localStorage.removeItem('meetingIsRoomCreator');
    router.push('/');
  };

  const handleCreateMeeting = (newRoomId: string, name: string) => {
    localStorage.setItem('meetingUserName', name);
    localStorage.setItem('meetingIsRoomCreator', 'true');
    router.push(`/room/${newRoomId}`);
  };

  const handleJoinMeeting = (existingRoomId: string, name: string) => {
    localStorage.setItem('meetingUserName', name);
    localStorage.setItem('meetingIsRoomCreator', 'false');
    setUserName(name);
  };

  if (!userName) {
    return (
      <Home
        onCreateMeeting={handleCreateMeeting}
        onJoinMeeting={handleJoinMeeting}
        autoJoinRoomId={roomId}
      />
    );
  }

  return (
    <Room
      roomId={roomId}
      userName={userName}
      onLeave={handleLeave}
      isRoomCreator={isRoomCreator}
    />
  );
}
