import { useEffect, useRef } from 'react';
import { User } from 'lucide-react';

interface VideoPlayerProps {
  stream: MediaStream | null;
  userName: string;
  muted?: boolean;
  isLocal?: boolean;
}

export function VideoPlayer({ stream, userName, muted = false, isLocal = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const hasVideo = stream?.getVideoTracks().some(track => track.enabled);

  return (
    <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video w-full">
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-700 rounded-full mb-3">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-white text-sm">Camera off</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 px-3 py-1.5 rounded-lg">
        <span className="text-white text-sm font-medium">
          {userName} {isLocal && '(You)'}
        </span>
      </div>
    </div>
  );
}
