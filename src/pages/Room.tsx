import { useState, useEffect } from 'react';
import { Copy, AlertCircle } from 'lucide-react';
import { useWebRTC } from '../hooks/useWebRTC';
import { VideoPlayer } from '../components/VideoPlayer';
import { MediaControls } from '../components/MediaControls';
import { Notification } from '../components/Notification';

interface RoomProps {
  roomId: string;
  userName: string;
  onLeave: () => void;
}

export function Room({ roomId, userName, onLeave }: RoomProps) {
  const {
    localStream,
    remoteStream,
    error,
    peerName,
    connectionStatus,
    isAudioOnly,
    toggleAudio,
    toggleVideo,
    leaveCall,
  } = useWebRTC({ roomId, userName });

  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const inviteLink = `${window.location.origin}/room/${roomId}`;

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setNotification({ message: 'Invite link copied to clipboard!', type: 'success' });
    } catch (err) {
      setNotification({ message: 'Failed to copy link', type: 'error' });
    }
  };

  const handleLeave = () => {
    leaveCall();
    onLeave();
  };

  useEffect(() => {
    if (error) {
      setNotification({ message: error, type: 'error' });
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Room: {roomId}</h1>
            <p className="text-sm text-gray-400 mt-1">{connectionStatus}</p>
          </div>
          <button
            onClick={copyInviteLink}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy invite link
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="max-w-7xl w-full">
          {localStream && !remoteStream && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-blue-900 bg-opacity-50 text-blue-200 px-4 py-2 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span>Waiting for other participant to join...</span>
              </div>
            </div>
          )}

          <div
            className={`grid gap-4 ${
              remoteStream ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 place-items-center'
            }`}
          >
            {localStream && (
              <div className={remoteStream ? 'w-full' : 'max-w-2xl w-full'}>
                <VideoPlayer stream={localStream} userName={userName} muted isLocal />
              </div>
            )}

            {remoteStream && (
              <div className="w-full">
                <VideoPlayer stream={remoteStream} userName={peerName || 'Guest'} />
              </div>
            )}
          </div>

          {!localStream && !error && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-gray-800 text-gray-300 px-6 py-4 rounded-xl">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Requesting camera and microphone access...</span>
              </div>
            </div>
          )}

          {error && !localStream && (
            <div className="max-w-md mx-auto bg-red-900 bg-opacity-20 border border-red-800 rounded-xl p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-white mb-2">Media Access Required</h3>
              <p className="text-gray-300 mb-4">{error}</p>
              <p className="text-sm text-gray-400 mb-4">
                Please allow camera and microphone access to join the call. You may need to refresh
                the page and try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </main>

      {localStream && (
        <footer className="bg-gray-800 border-t border-gray-700 px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <MediaControls
              onToggleAudio={toggleAudio}
              onToggleVideo={toggleVideo}
              onLeave={handleLeave}
              isAudioOnly={isAudioOnly}
            />
          </div>
        </footer>
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
