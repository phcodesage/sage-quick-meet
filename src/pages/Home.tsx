import { useState, useEffect } from 'react';
import { Video, Plus, LogIn } from 'lucide-react';
import { generateRoomId } from '../utils/webrtc';

interface HomeProps {
  onCreateMeeting: (roomId: string, userName: string) => void;
  onJoinMeeting: (roomId: string, userName: string) => void;
}

export function Home({ onCreateMeeting, onJoinMeeting }: HomeProps) {
  const [joinInput, setJoinInput] = useState('');
  const [userName, setUserName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [action, setAction] = useState<'create' | 'join' | null>(null);

  // Check if there's a room ID in the URL on component mount
  useEffect(() => {
    const path = window.location.pathname;
    const roomMatch = path.match(/\/room\/([^\/]+)/);
    
    if (roomMatch) {
      setJoinInput(roomMatch[1]);
      setAction('join');
      setShowNamePrompt(true);
    }
  }, []);

  const handleCreateClick = () => {
    setAction('create');
    setShowNamePrompt(true);
  };

  const handleJoinClick = () => {
    if (!joinInput.trim()) return;
    setAction('join');
    setShowNamePrompt(true);
  };

  const handleSubmitName = () => {
    if (!userName.trim()) return;

    if (action === 'create') {
      const roomId = generateRoomId();
      onCreateMeeting(roomId, userName);
    } else if (action === 'join') {
      const roomId = extractRoomId(joinInput);
      onJoinMeeting(roomId, userName);
    }
  };

  const extractRoomId = (input: string): string => {
    if (input.includes('/room/')) {
      const parts = input.split('/room/');
      return parts[1].split(/[?#]/)[0];
    }
    return input.trim();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">QuickMeet</h1>
          <p className="text-gray-600">Simple, secure 1-on-1 video calls</p>
        </div>

        {!showNamePrompt ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <button
              onClick={handleCreateClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Meeting
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter room code or invite link"
                value={joinInput}
                onChange={(e) => setJoinInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinClick()}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                onClick={handleJoinClick}
                disabled={!joinInput.trim()}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogIn className="w-5 h-5" />
                Join Meeting
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Enter your name</h2>
              <p className="text-sm text-gray-600">This will be shown to other participants</p>
            </div>

            <input
              type="text"
              placeholder="Your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitName()}
              autoFocus
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNamePrompt(false);
                  setUserName('');
                  setAction(null);
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmitName}
                disabled={!userName.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        <div className="text-center text-sm text-gray-500">
          <p>WebRTC-powered peer-to-peer video calling</p>
        </div>
      </div>
    </div>
  );
}
