'use client';

import { useRouter } from 'next/navigation';
import { Home } from '../src/views/Home';

export default function Page() {
  const router = useRouter();

  const handleCreateMeeting = (roomId: string, userName: string) => {
    localStorage.setItem('meetingUserName', userName);
    localStorage.setItem('meetingIsRoomCreator', 'true');
    router.push(`/room/${roomId}`);
  };

  const handleJoinMeeting = (roomId: string, userName: string) => {
    localStorage.setItem('meetingUserName', userName);
    localStorage.setItem('meetingIsRoomCreator', 'false');
    router.push(`/room/${roomId}`);
  };

  return (
    <Home
      onCreateMeeting={handleCreateMeeting}
      onJoinMeeting={handleJoinMeeting}
    />
  );
}
