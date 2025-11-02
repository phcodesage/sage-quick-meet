// Fetch ICE servers dynamically from server
async function getIceServers(): Promise<RTCConfiguration> {
  try {
    const response = await fetch('http://localhost:3001/get-ice-servers');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const iceConfig = await response.json();
    console.log('Fetched ICE servers:', iceConfig);
    return iceConfig;
  } catch (error) {
    console.error('Failed to fetch ICE servers, using fallback:', error);
    // Fallback to multiple STUN servers
    return {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ],
    };
  }
}

export async function createPeerConnection(): Promise<RTCPeerConnection> {
  const iceConfig = await getIceServers();
  
  // Enhanced configuration for better connectivity
  const config: RTCConfiguration = {
    ...iceConfig,
    iceCandidatePoolSize: 10,
    iceTransportPolicy: 'all',
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require'
  };
  
  return new RTCPeerConnection(config);
}

export async function getMediaStream(audio = true, video = true): Promise<MediaStream> {
  try {
    const constraints: MediaStreamConstraints = {
      audio: audio ? {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      } : false,
      video: video ? {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      } : false
    };

    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    console.error('Error accessing media devices:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'NotReadableError') {
        console.log('Device in use error detected, trying with different constraints');
        
        // Try with more basic constraints
        try {
          const basicConstraints: MediaStreamConstraints = {
            audio: audio ? true : false,
            video: video ? { width: 640, height: 480 } : false
          };
          return await navigator.mediaDevices.getUserMedia(basicConstraints);
        } catch (basicError) {
          console.log('Basic constraints failed, falling back to audio-only');
        }
      }
    }
    
    // If video was requested but failed, try audio-only as fallback
    if (video && audio) {
      console.log('Camera access failed, falling back to audio-only mode');
      try {
        return await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }, 
          video: false 
        });
      } catch (audioError) {
        console.error('Audio-only fallback also failed:', audioError);
        throw audioError;
      }
    }
    
    throw error;
  }
}

export function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

export function generateClientId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 15);
}

// Device enumeration functions
export async function getAudioInputDevices(): Promise<MediaDeviceInfo[]> {
  await navigator.mediaDevices.getUserMedia({ audio: true });
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter(device => device.kind === 'audioinput');
}

export async function getAudioOutputDevices(): Promise<MediaDeviceInfo[]> {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter(device => device.kind === 'audiooutput');
}

export async function getVideoInputDevices(): Promise<MediaDeviceInfo[]> {
  await navigator.mediaDevices.getUserMedia({ video: true });
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter(device => device.kind === 'videoinput');
}

// Enhanced getMediaStream with device selection
export async function getMediaStreamWithDevice(
  audioDeviceId?: string,
  videoDeviceId?: string,
  audio = true,
  video = true
): Promise<MediaStream> {
  try {
    const constraints: MediaStreamConstraints = {
      audio: audio ? {
        deviceId: audioDeviceId ? { exact: audioDeviceId } : undefined,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      } : false,
      video: video ? {
        deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined,
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      } : false
    };

    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    console.error('Error accessing media devices:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'NotReadableError' || error.name === 'OverconstrainedError') {
        console.log('Device in use or not available, trying with different device');
        
        // Try with default device instead of specified one
        try {
          const basicConstraints: MediaStreamConstraints = {
            audio: audio ? true : false,
            video: video ? true : false
          };
          return await navigator.mediaDevices.getUserMedia(basicConstraints);
        } catch (basicError) {
          console.log('Basic constraints failed, falling back to audio-only');
        }
      }
    }
    
    // If video was requested but failed, try audio-only as fallback
    if (video && audio) {
      console.log('Camera access failed, falling back to audio-only mode');
      try {
        return await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }, 
          video: false 
        });
      } catch (audioError) {
        console.error('Audio-only fallback also failed:', audioError);
        throw audioError;
      }
    }
    
    throw error;
  }
}
