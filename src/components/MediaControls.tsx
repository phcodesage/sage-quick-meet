import { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, Phone } from 'lucide-react';

interface MediaControlsProps {
  onToggleAudio: () => boolean;
  onToggleVideo: () => boolean;
  onLeave: () => void;
  isAudioOnly?: boolean;
  isRoomCreator?: boolean;
}

export function MediaControls({ onToggleAudio, onToggleVideo, onLeave, isAudioOnly = false, isRoomCreator = false }: MediaControlsProps) {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(!isAudioOnly);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const handleToggleAudio = () => {
    const enabled = onToggleAudio();
    setIsAudioEnabled(enabled);
  };

  const handleToggleVideo = () => {
    const enabled = onToggleVideo();
    setIsVideoEnabled(enabled);
  };

  const handleLeave = () => {
    setShowLeaveConfirm(true);
  };

  const confirmLeave = () => {
    onLeave();
  };

  return (
    <>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handleToggleAudio}
          className={`p-4 rounded-full transition-all ${
            isAudioEnabled
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>

        <button
          onClick={handleToggleVideo}
          disabled={isAudioOnly}
          className={`p-4 rounded-full transition-all ${
            isAudioOnly
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : isVideoEnabled
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={
            isAudioOnly
              ? 'Camera unavailable (audio-only mode)'
              : isVideoEnabled
              ? 'Turn off camera'
              : 'Turn on camera'
          }
        >
          {isVideoEnabled && !isAudioOnly ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>

        <button
          onClick={handleLeave}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all"
          title={isRoomCreator ? "End call" : "Leave call"}
        >
          <Phone className="w-6 h-6" />
        </button>
      </div>

      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isRoomCreator ? "End the call?" : "Leave the call?"}
            </h3>
            <p className="text-gray-600 mb-6">
              {isRoomCreator 
                ? "Are you sure you want to end this call? This will disconnect all participants." 
                : "Are you sure you want to leave this call?"
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLeave}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                {isRoomCreator ? "End Call" : "Leave"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
