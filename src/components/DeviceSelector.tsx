import { useState, useEffect } from 'react';
import { Settings, Mic, Video, Volume2 } from 'lucide-react';
import { getAudioInputDevices, getAudioOutputDevices, getVideoInputDevices } from '../utils/webrtc';

interface DeviceSelectorProps {
  onAudioInputChange: (deviceId: string) => void;
  onAudioOutputChange: (deviceId: string) => void;
  onVideoInputChange: (deviceId: string) => void;
  currentAudioInputId?: string;
  currentAudioOutputId?: string;
  currentVideoInputId?: string;
}

export function DeviceSelector({
  onAudioInputChange,
  onAudioOutputChange,
  onVideoInputChange,
  currentAudioInputId,
  currentAudioOutputId,
  currentVideoInputId
}: DeviceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoInputDevices, setVideoInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch available devices
  const loadDevices = async () => {
    try {
      setLoading(true);
      const [audioInputs, audioOutputs, videoInputs] = await Promise.all([
        getAudioInputDevices(),
        getAudioOutputDevices(),
        getVideoInputDevices()
      ]);
      
      setAudioInputDevices(audioInputs);
      setAudioOutputDevices(audioOutputs);
      setVideoInputDevices(videoInputs);
    } catch (error) {
      console.error('Error loading devices:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load devices when the selector is opened
  useEffect(() => {
    if (isOpen) {
      loadDevices();
    }
  }, [isOpen]);

  // Listen for device changes
  useEffect(() => {
    const handleDeviceChange = () => {
      if (isOpen) {
        loadDevices();
      }
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
        title="Device settings"
      >
        <Settings size={20} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-lg p-4 w-72 z-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-900">Device Settings</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading devices...</div>
          ) : (
            <div className="space-y-4">
              {/* Microphone selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Mic size={16} /> Microphone
                </label>
                <select
                  value={currentAudioInputId || ''}
                  onChange={(e) => onAudioInputChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {audioInputDevices.length === 0 ? (
                    <option value="">No microphones found</option>
                  ) : (
                    <>
                      <option value="">Default</option>
                      {audioInputDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Speaker selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Volume2 size={16} /> Speaker
                </label>
                <select
                  value={currentAudioOutputId || ''}
                  onChange={(e) => onAudioOutputChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {audioOutputDevices.length === 0 ? (
                    <option value="">No speakers found</option>
                  ) : (
                    <>
                      <option value="">Default</option>
                      {audioOutputDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Speaker ${device.deviceId.slice(0, 5)}...`}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Camera selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Video size={16} /> Camera
                </label>
                <select
                  value={currentVideoInputId || ''}
                  onChange={(e) => onVideoInputChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {videoInputDevices.length === 0 ? (
                    <option value="">No cameras found</option>
                  ) : (
                    <>
                      <option value="">Default</option>
                      {videoInputDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera ${device.deviceId.slice(0, 5)}...`}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => loadDevices()}
                  className="px-3 py-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
                >
                  Refresh devices
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
