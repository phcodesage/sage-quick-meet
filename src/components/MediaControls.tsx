import { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, Phone, MonitorUp, Monitor } from 'lucide-react';
import { DeviceSelector } from './DeviceSelector';

interface MediaControlsProps {
  onToggleAudio: () => boolean;
  onToggleVideo: () => boolean;
  onToggleScreenShare?: () => Promise<boolean>;
  onLeave: () => void;
  isAudioOnly?: boolean;
  isScreenSharing?: boolean;
  isRoomCreator?: boolean;
  onAudioInputChange?: (deviceId: string) => void;
  onAudioOutputChange?: (deviceId: string) => void;
  onVideoInputChange?: (deviceId: string) => void;
  audioInputDeviceId?: string;
  audioOutputDeviceId?: string;
  videoInputDeviceId?: string;
}

export function MediaControls({ 
  onToggleAudio, 
  onToggleVideo, 
  onToggleScreenShare,
  onLeave, 
  isAudioOnly = false, 
  isScreenSharing = false,
  isRoomCreator = false,
  onAudioInputChange,
  onAudioOutputChange,
  onVideoInputChange,
  audioInputDeviceId,
  audioOutputDeviceId,
  videoInputDeviceId
}: MediaControlsProps) {
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
        {/* Device selector */}
        {onAudioInputChange && onAudioOutputChange && onVideoInputChange && (
          <DeviceSelector
            onAudioInputChange={onAudioInputChange}
            onAudioOutputChange={onAudioOutputChange}
            onVideoInputChange={onVideoInputChange}
            currentAudioInputId={audioInputDeviceId}
            currentAudioOutputId={audioOutputDeviceId}
            currentVideoInputId={videoInputDeviceId}
          />
        )}
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

        {/* Screen sharing button */}
        {onToggleScreenShare && !isAudioOnly && (
          <button
            onClick={() => {
              if (onToggleScreenShare) onToggleScreenShare();
            }}
            className={`p-4 rounded-full transition-all ${
              isScreenSharing
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title={isScreenSharing ? 'Stop sharing screen' : 'Share your screen'}
          >
            {isScreenSharing ? <Monitor className="w-6 h-6" /> : <MonitorUp className="w-6 h-6" />}
          </button>
        )}

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
