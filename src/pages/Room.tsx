import { useState, useEffect } from 'react';
import { Copy, AlertCircle, MessageSquare } from 'lucide-react';
import { useWebRTC } from '../hooks/useWebRTC';
import { VideoPlayer } from '../components/VideoPlayer';
import { MediaControls } from '../components/MediaControls';
import { Notification } from '../components/Notification';
import { Chat } from '../components/Chat';

interface RoomProps {
  roomId: string;
  userName: string;
  onLeave: () => void;
  isRoomCreator: boolean;
}

export function Room({ roomId, userName, onLeave, isRoomCreator }: RoomProps) {
  const {
    localStream,
    remoteStream,
    error,
    peerName,
    connectionStatus,
    isAudioOnly,
    isScreenSharing,
    remoteScreenSharing,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    leaveCall,
    switchAudioDevice,
    switchVideoDevice,
    setAudioOutput,
    audioInputDeviceId,
    videoInputDeviceId,
    audioOutputDeviceId,
    messages,
    remoteTyping,
    sendMessage,
    sendTypingIndicator,
    clearChat
  } = useWebRTC({ roomId, userName });

  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadMessageCount, setLastReadMessageCount] = useState(0);

  // Check for call ended notification on component mount
  useEffect(() => {
    const callEndedMessage = localStorage.getItem('callEndedNotification');
    if (callEndedMessage) {
      setNotification({ message: callEndedMessage, type: 'info' });
      localStorage.removeItem('callEndedNotification');
    }
  }, []);

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
    leaveCall(true, isRoomCreator);
    onLeave();
  };

  useEffect(() => {
    if (error) {
      setNotification({ message: error, type: 'error' });
    }
  }, [error]);

  // Track unread messages - only count new messages since last read
  useEffect(() => {
    if (isChatOpen) {
      // When chat is open, mark all messages as read
      setUnreadCount(0);
      setLastReadMessageCount(messages.length);
    } else {
      // When chat is closed, count unread messages
      const unreadMessages = messages.slice(lastReadMessageCount).filter(msg => !msg.isLocal);
      setUnreadCount(unreadMessages.length);
    }
  }, [messages, isChatOpen, lastReadMessageCount]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Room: {roomId}</h1>
            <p className="text-sm text-gray-400 mt-1">{connectionStatus}</p>
          </div>
          {!remoteStream ? (
            <button
              onClick={copyInviteLink}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy invite link
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-green-600 text-white font-medium py-2 px-4 rounded-lg">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <span>Call in progress with {peerName}</span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Video area */}
        <div className="flex-1 p-6 flex items-center justify-center overflow-auto">
          <div className="max-w-7xl w-full">
          {localStream && !remoteStream && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-blue-900 bg-opacity-50 text-blue-200 px-4 py-2 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span>Waiting for other participant to join...</span>
              </div>
            </div>
          )}

          {/* Picture-in-Picture layout when someone is screen sharing */}
          {(remoteScreenSharing || isScreenSharing) && remoteStream ? (
            <div className="flex flex-col lg:grid lg:grid-cols-[1fr_280px] gap-4 w-full">
              {/* Main screen share view - takes most space */}
              <div className="w-full lg:h-[calc(100vh-280px)]">
                <div className="relative bg-gray-900 rounded-xl overflow-hidden w-full h-full lg:aspect-auto aspect-video">
                  <video
                    ref={(video) => {
                      if (video && remoteStream) {
                        video.srcObject = remoteStream;
                      }
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 px-3 py-1.5 rounded-lg">
                    <span className="text-white text-sm font-medium">
                      {peerName || 'Guest'} {remoteScreenSharing ? '(Screen)' : ''}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Local video - Right column on large screens, below on mobile */}
              {localStream && (
                <div className="w-full lg:flex lg:items-end lg:justify-end">
                  <div className="w-full lg:w-64">
                    <VideoPlayer stream={localStream} userName={`${userName} (You)`} muted isLocal />
                  </div>
                </div>
              )}
            </div>
          ) : remoteStream ? (
            /* Normal call layout - remote video larger, local video bottom right */
            <div className="flex flex-col lg:grid lg:grid-cols-[1fr_280px] gap-4 w-full">
              {/* Main remote video - takes most space */}
              <div className="w-full lg:h-[calc(100vh-280px)]">
                <div className="relative bg-gray-900 rounded-xl overflow-hidden w-full h-full lg:aspect-auto aspect-video">
                  <video
                    ref={(video) => {
                      if (video && remoteStream) {
                        video.srcObject = remoteStream;
                      }
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 px-3 py-1.5 rounded-lg">
                    <span className="text-white text-sm font-medium">
                      {peerName || 'Guest'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Local video - Right column on large screens, below on mobile */}
              {localStream && (
                <div className="w-full lg:flex lg:items-end lg:justify-end">
                  <div className="w-full lg:w-64">
                    <VideoPlayer stream={localStream} userName={`${userName} (You)`} muted isLocal />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Waiting for peer - show local video centered */
            <div className="grid grid-cols-1 place-items-center">
              {localStream && (
                <div className="max-w-2xl w-full">
                  <VideoPlayer stream={localStream} userName={userName} muted isLocal />
                </div>
              )}
            </div>
          )}

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
        </div>

        {/* Chat sidebar */}
        {remoteStream && isChatOpen && (
          <div className="w-96 flex-shrink-0">
            <Chat
              onSendMessage={sendMessage}
              messages={messages}
              onTyping={sendTypingIndicator}
              remoteTyping={remoteTyping}
              remoteName={peerName || 'Guest'}
              onClearChat={clearChat}
              isOpen={isChatOpen}
            />
          </div>
        )}
      </main>

      {localStream && (
        <footer className="bg-gray-800 border-t border-gray-700 px-6 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-center relative">
            <MediaControls
              onToggleAudio={toggleAudio}
              onToggleVideo={toggleVideo}
              onToggleScreenShare={toggleScreenShare}
              onLeave={handleLeave}
              isAudioOnly={isAudioOnly}
              isScreenSharing={isScreenSharing}
              isRoomCreator={isRoomCreator}
              onAudioInputChange={switchAudioDevice}
              onAudioOutputChange={setAudioOutput}
              onVideoInputChange={switchVideoDevice}
              audioInputDeviceId={audioInputDeviceId}
              audioOutputDeviceId={audioOutputDeviceId}
              videoInputDeviceId={videoInputDeviceId}
            />
            
            {/* Chat toggle button - positioned absolutely on the right */}
            {remoteStream && (
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="absolute right-0 bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-full transition-all"
                title="Toggle chat"
              >
                <MessageSquare className="w-6 h-6" />
                {unreadCount > 0 && !isChatOpen && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}
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
