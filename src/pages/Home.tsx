import { useState, useEffect } from 'react';
import { Video, Plus, LogIn, Shuffle } from 'lucide-react';
import { generateRoomId } from '../utils/webrtc';
import { generateRandomName } from '../utils/nameGenerator';

interface HomeProps {
  onCreateMeeting: (roomId: string, userName: string) => void;
  onJoinMeeting: (roomId: string, userName: string) => void;
  autoJoinRoomId?: string;
}

export function Home({ onCreateMeeting, onJoinMeeting, autoJoinRoomId }: HomeProps) {
  const [userName, setUserName] = useState('');
  const [joinInput, setJoinInput] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [action, setAction] = useState<'create' | 'join' | null>(null);

  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Check for call ended notification and auto-join room on component mount
  useEffect(() => {
    console.log('🔍 Home: useEffect triggered, autoJoinRoomId:', autoJoinRoomId, 'showNamePrompt:', showNamePrompt);
    
    const callEndedMessage = localStorage.getItem('callEndedNotification');
    if (callEndedMessage) {
      setNotification({ message: callEndedMessage, type: 'info' });
      localStorage.removeItem('callEndedNotification');
    }

    // Auto-join room if URL contains room ID
    if (autoJoinRoomId && !showNamePrompt) {
      console.log('🔍 Home: Auto-joining room:', autoJoinRoomId);
      setJoinInput(`${window.location.origin}/room/${autoJoinRoomId}`);
      setAction('join');
      setShowNamePrompt(true);
    }
  }, [autoJoinRoomId, showNamePrompt]);

  const handleCreateClick = () => {
    setAction('create');
    setShowNamePrompt(true);
  };

  const handleJoinClick = () => {
    if (!joinInput.trim()) return;
    setAction('join');
    setShowNamePrompt(true);
  };

  const handleGenerateRandomName = () => {
    const randomName = generateRandomName();
    setUserName(randomName);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 animate-gradient-shift transition-colors duration-300">
      <div className="max-w-md w-full space-y-8">
        {/* Header with floating animation */}
        <div className="text-center animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 dark:from-blue-500 dark:to-cyan-400 rounded-2xl mb-4 shadow-lg animate-float hover:scale-110 transition-transform duration-300">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 bg-clip-text text-transparent">
            Meetra
          </h1>
          <p className="text-gray-600 dark:text-gray-300 animate-fade-in">Simple, secure 1-on-1 video calls</p>
        </div>

        {!showNamePrompt ? (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 space-y-6 animate-slide-up hover:shadow-2xl transition-shadow duration-300">
            <button
              onClick={handleCreateClick}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              Create Meeting
            </button>

            <div className="relative animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">or</span>
              </div>
            </div>

            <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <input
                type="text"
                placeholder="Enter room code or invite link"
                value={joinInput}
                onChange={(e) => setJoinInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinClick()}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-500 focus:scale-105"
              />
              <button
                onClick={handleJoinClick}
                disabled={!joinInput.trim()}
                className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 group"
              >
                <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                Join Meeting
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 space-y-6 animate-slide-up hover:shadow-2xl transition-shadow duration-300">
            <div className="animate-fade-in">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {autoJoinRoomId ? 'Join this meeting' : 'Enter your name'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {autoJoinRoomId 
                  ? `Enter your name to join room: ${autoJoinRoomId.slice(0, 8)}...`
                  : 'This will be shown to other participants'
                }
              </p>
            </div>

            <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitName()}
                  autoFocus
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-500 focus:scale-105"
                />
                <button
                  type="button"
                  onClick={handleGenerateRandomName}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 group"
                  title="Generate random name"
                >
                  <Shuffle className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Click <Shuffle className="w-3 h-3 inline" /> to generate a random name
              </p>
            </div>

            <div className="flex gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <button
                onClick={() => {
                  setShowNamePrompt(false);
                  setUserName('');
                  setAction(null);
                  setJoinInput('');
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Back
              </button>
              <button
                onClick={handleSubmitName}
                disabled={!userName.trim()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 hover:shadow-lg"
              >
                {autoJoinRoomId ? 'Join Meeting' : 'Continue'}
              </button>
            </div>
          </div>
        )}

        {notification && (
          <div className={`p-4 rounded-xl animate-slide-in-bottom ${
            notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
            notification.type === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
            'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
          }`}>
            {notification.message}
          </div>
        )}

        <div className="text-center text-sm text-gray-500 dark:text-gray-400 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p>WebRTC-powered peer-to-peer video calling</p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-bottom {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
          animation-fill-mode: both;
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }

        .animate-slide-in-bottom {
          animation: slide-in-bottom 0.4s ease-out;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }
      `}</style>
    </div>
  );
}
