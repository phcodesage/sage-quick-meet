import { useEffect, useRef, useState, useCallback } from 'react';
import { createPeerConnection, getMediaStream, generateClientId } from '../utils/webrtc';

const WS_URL = 'ws://localhost:3001';

interface UseWebRTCProps {
  roomId: string;
  userName: string;
}

export function useWebRTC({ roomId, userName }: UseWebRTCProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [peerName, setPeerName] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<string>('Initializing...');
  const [isAudioOnly, setIsAudioOnly] = useState(false);

  const ws = useRef<WebSocket | null>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const clientId = useRef<string>(generateClientId());
  const iceCandidateQueue = useRef<RTCIceCandidateInit[]>([]);
  const hasRemoteDescription = useRef<boolean>(false);
  const peerId = useRef<string | null>(null);

  const initializeMedia = useCallback(async () => {
    try {
      const stream = await getMediaStream(true, true);
      setLocalStream(stream);
      
      // Check if we have video tracks to determine if we're in audio-only mode
      const hasVideo = stream.getVideoTracks().length > 0;
      setIsAudioOnly(!hasVideo);
      
      if (hasVideo) {
        setConnectionStatus('Connected to camera and microphone');
      } else {
        setConnectionStatus('Connected to microphone (audio-only mode)');
      }
      
      return stream;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to access camera/microphone';
      setError(message);
      setConnectionStatus('Media access denied');
      throw err;
    }
  }, []);

  const processQueuedCandidates = useCallback(async () => {
    if (!pc.current || !hasRemoteDescription.current) return;

    console.log(`🧊 Processing ${iceCandidateQueue.current.length} queued ICE candidates`);
    
    while (iceCandidateQueue.current.length > 0) {
      const candidate = iceCandidateQueue.current.shift();
      if (candidate) {
        try {
          await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('🧊 Successfully added queued ICE candidate');
        } catch (err) {
          console.error('🧊 Error adding queued ICE candidate:', err);
        }
      }
    }
  }, []);

  const createOffer = useCallback(async (peerId: string) => {
    if (!pc.current || !ws.current) return;

    try {
      console.log('📤 Creating offer for peer:', peerId);
      
      // Log current senders before creating offer
      const senders = pc.current.getSenders();
      console.log('📤 Current senders before offer:', senders.map(s => ({
        kind: s.track?.kind,
        trackId: s.track?.id,
        enabled: s.track?.enabled
      })));
      
      const offer = await pc.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await pc.current.setLocalDescription(offer);
      console.log('📤 Local description set, sending offer');

      ws.current.send(JSON.stringify({
        type: 'offer',
        offer,
        target: peerId
      }));
    } catch (err) {
      console.error('Error creating offer:', err);
      setError('Failed to create connection offer');
    }
  }, []);

  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit, from: string) => {
    if (!pc.current || !ws.current) return;

    try {
      console.log('📥 Setting remote description from offer');
      await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
      hasRemoteDescription.current = true;
      
      console.log('📤 Creating and setting local answer');
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);

      ws.current.send(JSON.stringify({
        type: 'answer',
        answer,
        target: from
      }));

      // Process any queued ICE candidates
      await processQueuedCandidates();
    } catch (err) {
      console.error('Error handling offer:', err);
      setError('Failed to handle connection offer');
    }
  }, [processQueuedCandidates]);

  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    if (!pc.current) return;

    try {
      console.log('📥 Setting remote description from answer');
      await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
      hasRemoteDescription.current = true;
      
      // Log current receivers after setting remote description
      const receivers = pc.current.getReceivers();
      console.log('📥 Current receivers after answer:', receivers.map(r => ({
        kind: r.track?.kind,
        trackId: r.track?.id,
        enabled: r.track?.enabled
      })));
      
      // Process any queued ICE candidates
      await processQueuedCandidates();
    } catch (err) {
      console.error('Error handling answer:', err);
      setError('Failed to handle connection answer');
    }
  }, [processQueuedCandidates]);

  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    if (!pc.current) return;

    console.log('🧊 Received remote ICE candidate:', {
      candidate: candidate.candidate,
      sdpMLineIndex: candidate.sdpMLineIndex,
      sdpMid: candidate.sdpMid
    });

    if (!hasRemoteDescription.current) {
      console.log('🧊 Queuing ICE candidate (no remote description yet)');
      iceCandidateQueue.current.push(candidate);
      return;
    }

    try {
      await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('🧊 Successfully added remote ICE candidate');
    } catch (err) {
      console.error('🧊 Error adding ICE candidate:', err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const setupConnection = async () => {
      try {
        const stream = await initializeMedia();

        if (!mounted) return;

        pc.current = await createPeerConnection();

        // Add tracks to peer connection with proper stream association
        stream.getTracks().forEach(track => {
          if (pc.current) {
            console.log('🎵 Adding local track to peer connection:', {
              kind: track.kind,
              id: track.id,
              enabled: track.enabled,
              readyState: track.readyState,
              streamId: stream.id
            });
            
            // Ensure the track is properly associated with the stream
            const sender = pc.current.addTrack(track, stream);
            console.log('🎵 Track sender created:', sender.track?.kind);
          }
        });

        if (pc.current) {
          pc.current.onicecandidate = (event) => {
            if (event.candidate) {
              console.log('🧊 ICE Candidate generated:', {
                type: event.candidate.type,
                protocol: event.candidate.protocol,
                address: event.candidate.address,
                port: event.candidate.port,
                priority: event.candidate.priority,
                foundation: event.candidate.foundation
              });
              
              if (ws.current && peerId.current) {
                ws.current.send(JSON.stringify({
                  type: 'ice-candidate',
                  candidate: event.candidate,
                  target: peerId.current
                }));
              }
            } else {
              console.log('🧊 ICE gathering completed (null candidate)');
            }
          };

          pc.current.onicegatheringstatechange = () => {
            const state = pc.current?.iceGatheringState;
            console.log('🧊 ICE Gathering State changed:', state);
            
            switch (state) {
              case 'new':
                console.log('🧊 ICE gathering has not started');
                break;
              case 'gathering':
                console.log('🧊 ICE gathering is in progress');
                break;
              case 'complete':
                console.log('🧊 ICE gathering has completed');
                break;
            }
          };

          pc.current.oniceconnectionstatechange = () => {
            const state = pc.current?.iceConnectionState;
            console.log('🧊 ICE Connection State changed:', state);
            
            switch (state) {
              case 'new':
                console.log('🧊 ICE connection is new');
                break;
              case 'checking':
                console.log('🧊 ICE connection is checking connectivity');
                setConnectionStatus('Checking connectivity...');
                break;
              case 'connected':
                console.log('🧊 ICE connection is connected');
                setConnectionStatus('ICE connected - establishing media...');
                break;
              case 'completed':
                console.log('🧊 ICE connection is completed');
                break;
              case 'failed':
                console.log('🧊 ICE connection failed - attempting ICE restart');
                setConnectionStatus('Connection failed - retrying...');
                setError('ICE connection failed. Attempting to reconnect...');
                // Attempt ICE restart
                if (pc.current && peerId.current) {
                  const attemptRestart = async () => {
                    try {
                      const offer = await pc.current!.createOffer({ iceRestart: true });
                      await pc.current!.setLocalDescription(offer);
                      if (ws.current) {
                        ws.current.send(JSON.stringify({
                          type: 'offer',
                          offer,
                          target: peerId.current
                        }));
                      }
                    } catch (restartErr) {
                      console.error('ICE restart failed:', restartErr);
                    }
                  };
                  attemptRestart();
                }
                break;
              case 'disconnected':
                console.log('🧊 ICE connection is disconnected');
                setConnectionStatus('Connection lost - attempting to reconnect...');
                break;
              case 'closed':
                console.log('🧊 ICE connection is closed');
                break;
            }
          };

          pc.current.ontrack = (event) => {
            console.log('🎥 Received remote track:', {
              kind: event.track.kind,
              id: event.track.id,
              readyState: event.track.readyState,
              enabled: event.track.enabled,
              streams: event.streams?.length || 0
            });
            
            if (event.streams && event.streams[0]) {
              console.log('🎥 Setting remote stream with tracks:', 
                event.streams[0].getTracks().map(t => ({ kind: t.kind, id: t.id, enabled: t.enabled }))
              );
              remoteStreamRef.current = event.streams[0];
              setRemoteStream(event.streams[0]);
              setConnectionStatus('Call connected - you can now hear and see each other');
            } else {
              console.warn('🎥 No streams in track event, creating/updating stream');
              
              // If we don't have a remote stream yet, create one
              if (!remoteStreamRef.current) {
                const newStream = new MediaStream([event.track]);
                remoteStreamRef.current = newStream;
                setRemoteStream(newStream);
                console.log('🎥 Created new remote stream with track:', event.track.kind);
              } else {
                // Add track to existing stream
                remoteStreamRef.current.addTrack(event.track);
                setRemoteStream(new MediaStream(remoteStreamRef.current.getTracks()));
                console.log('🎥 Added track to existing remote stream:', event.track.kind);
              }
              setConnectionStatus('Call connected - you can now hear and see each other');
            }
          };

          pc.current.onconnectionstatechange = () => {
            const state = pc.current?.connectionState;
            console.log('🔗 Peer Connection State changed:', state);
            
            if (state === 'connected') {
              console.log('🔗 Peer connection fully established');
              setIsConnected(true);
              // Don't override the more specific message from ontrack
              if (!remoteStream) {
                setConnectionStatus('WebRTC connection established - waiting for media...');
              }
            } else if (state === 'disconnected' || state === 'failed') {
              console.log('🔗 Peer connection failed/disconnected');
              setConnectionStatus('Call disconnected');
              setIsConnected(false);
            } else if (state === 'connecting') {
              console.log('🔗 Peer connection is connecting');
              setConnectionStatus('Establishing connection...');
            } else if (state === 'new') {
              console.log('🔗 Peer connection is new');
            }
          };
        }

        ws.current = new WebSocket(WS_URL);

        ws.current.onopen = () => {
          if (!mounted || !ws.current) return;

          ws.current.send(JSON.stringify({
            type: 'join',
            roomId,
            userName,
            clientId: clientId.current
          }));
          setConnectionStatus('Waiting for other participant...');
        };

        ws.current.onmessage = async (event) => {
          if (!mounted) return;

          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'joined':
              console.log('Joined room:', data.roomId);
              break;
            case 'ready':
              setPeerName(data.peerName);
              peerId.current = data.peerId;
              setConnectionStatus('Creating connection...');
              await createOffer(data.peerId);
              break;
            case 'peer-joined':
              setPeerName(data.peerName);
              peerId.current = data.peerId;
              setConnectionStatus('Peer joined, waiting for connection...');
              break;
            case 'offer':
              await handleOffer(data.offer, data.from);
              break;
            case 'answer':
              await handleAnswer(data.answer);
              break;
            case 'ice-candidate':
              await handleIceCandidate(data.candidate);
              break;
            case 'peer-left':
              setRemoteStream(null);
              remoteStreamRef.current = null;
              setIsConnected(false);
              setPeerName('');
              peerId.current = null;
              setConnectionStatus('Participant left');
              break;
            case 'error':
              setError(data.message);
              setConnectionStatus('Error');
              break;
          }
        };

        ws.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setError('Connection error occurred');
          setConnectionStatus('Connection error');
        };

        ws.current.onclose = () => {
          setConnectionStatus('Connection closed');
        };

      } catch (err) {
        if (mounted) {
          console.error('Setup error:', err);
        }
      }
    };

    setupConnection();

    return () => {
      mounted = false;

      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }

      if (pc.current) {
        pc.current.close();
      }

      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: 'leave' }));
        ws.current.close();
      }
    };
  }, [roomId, userName, initializeMedia, createOffer, handleOffer, handleAnswer, handleIceCandidate]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    // If no video track available (audio-only mode), return false
    return false;
  }, [localStream]);

  const leaveCall = useCallback(() => {
    // Stop all local media tracks to release camera/microphone
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped ${track.kind} track`);
      });
      setLocalStream(null);
    }

    // Close peer connection
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }

    // Close WebSocket connection
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'leave' }));
      ws.current.close();
      ws.current = null;
    }

    // Reset states
    setRemoteStream(null);
    remoteStreamRef.current = null;
    setIsConnected(false);
    setError(null);
    setPeerName('');
    setConnectionStatus('Disconnected');
    setIsAudioOnly(false);
  }, [localStream]);

  return {
    localStream,
    remoteStream,
    isConnected,
    error,
    peerName,
    connectionStatus,
    isAudioOnly,
    toggleAudio,
    toggleVideo,
    leaveCall,
  };
}
