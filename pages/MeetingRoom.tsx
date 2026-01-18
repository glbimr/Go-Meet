import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  Mic, MicOff, Video, VideoOff, Monitor, PhoneOff, 
  Users, Settings, Shield, Signal, X, Loader, Share2
} from 'lucide-react';
import { generateMockNetworkStats } from '../services/networkService';
import { NetworkStats } from '../types';
import { supabase } from '../lib/supabaseClient';

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' }
  ]
};

interface PeerData {
  peerId: string;
  name: string;
  ip: string;
  isHost: boolean;
}

// Stable Video Component to prevent flickering on re-renders
const VideoFeed: React.FC<{ 
  stream: MediaStream | null; 
  isMirrored?: boolean; 
  isMuted?: boolean;
  className?: string;
  id?: string;
}> = ({ stream, isMirrored = false, isMuted = false, className = '', id }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      id={id}
      ref={videoRef}
      autoPlay
      playsInline
      muted={isMuted}
      className={`w-full h-full object-cover ${isMirrored ? 'transform scale-x-[-1]' : ''} ${className}`}
    />
  );
};

const MeetingRoom: React.FC = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Local User State
  const virtualIp = location.state?.virtualIp || '10.8.0.x';
  const displayName = location.state?.displayName || 'Anonymous';
  const isHost = location.state?.isHost || false;
  const myPeerId = useRef(Math.random().toString(36).substr(2, 9)).current;

  // Media & UI State
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  
  // WebRTC State
  const [participants, setParticipants] = useState<PeerData[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  
  // We track the active local stream in state to pass it to the VideoFeed component
  const [localDisplayStream, setLocalDisplayStream] = useState<MediaStream | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const channelRef = useRef<any>(null);

  // Initialize Media and Signal
  useEffect(() => {
    const init = async () => {
      // 1. Get Local Media
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        localStreamRef.current = stream;
        setLocalDisplayStream(stream);
      } catch (err) {
        console.error("Failed to access media:", err);
      }

      // 2. Join Supabase Channel
      const channel = supabase.channel(`room:${meetingId}`, {
        config: { presence: { key: myPeerId } },
      });
      channelRef.current = channel;

      channel
        .on('presence', { event: 'sync' }, () => {
          const newState = channel.presenceState();
          const users: PeerData[] = [];
          for (const key in newState) {
            const data = newState[key][0] as any;
            users.push({
              peerId: key,
              name: data.name,
              ip: data.ip,
              isHost: data.isHost
            });
          }
          setParticipants(users);
        })
        .on('broadcast', { event: 'signal' }, async ({ payload }) => {
          if (payload.target !== myPeerId && payload.type !== 'new-peer') return;
          await handleSignal(payload);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              name: displayName,
              ip: virtualIp,
              isHost: isHost,
              peerId: myPeerId,
              online_at: new Date().toISOString(),
            });

            // Announce presence
            channel.send({
              type: 'broadcast',
              event: 'signal',
              payload: { type: 'new-peer', sender: myPeerId }
            });
          }
        });
    };

    init();

    const statsInterval = setInterval(() => {
      setNetworkStats(generateMockNetworkStats(true));
    }, 2000);

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      
      // Stop all tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
      peerConnectionsRef.current.forEach(pc => pc.close());
      clearInterval(statsInterval);
    };
  }, [meetingId, myPeerId, displayName, virtualIp, isHost]);

  // Handle Camera/Mic Toggles
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => track.enabled = !isMuted);
      localStreamRef.current.getVideoTracks().forEach(track => track.enabled = !isVideoOff);
    }
  }, [isMuted, isVideoOff]);

  // Screen Sharing Logic
  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = stream.getVideoTracks()[0];
      
      screenStreamRef.current = stream;
      
      // Update local preview state
      setLocalDisplayStream(stream);

      // Replace tracks for existing peers
      peerConnectionsRef.current.forEach((pc) => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenTrack);
        }
      });

      // Handle browser "Stop sharing" UI
      screenTrack.onended = () => {
        stopScreenShare();
      };

      setIsScreenSharing(true);
    } catch (err) {
      console.error("Screen share cancelled or failed:", err);
    }
  };

  const stopScreenShare = async () => {
    // Stop the screen share stream
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }

    // Revert to camera
    if (localStreamRef.current) {
      setLocalDisplayStream(localStreamRef.current);
      
      const cameraTrack = localStreamRef.current.getVideoTracks()[0];
      if (cameraTrack) {
        // Ensure camera track respects current mute state
        cameraTrack.enabled = !isVideoOff;
        
        peerConnectionsRef.current.forEach((pc) => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(cameraTrack);
          }
        });
      }
    }
    
    setIsScreenSharing(false);
  };

  const handleScreenShareToggle = () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };

  const handleShare = () => {
    const text = `Join my UniConnect secure meeting: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // WebRTC Signaling Logic
  const createPeerConnection = (peerId: string) => {
    if (peerConnectionsRef.current.has(peerId)) return peerConnectionsRef.current.get(peerId)!;

    const pc = new RTCPeerConnection(RTC_CONFIG);
    
    // Add Tracks
    // 1. Audio (Always from mic)
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // 2. Video (Screen if sharing, otherwise Camera)
    const videoTrack = screenStreamRef.current?.getVideoTracks()[0] || localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack && localStreamRef.current) {
      // We attach the track to the localStream container so they arrive grouped
      pc.addTrack(videoTrack, localStreamRef.current);
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'signal',
          payload: { 
            type: 'ice-candidate', 
            candidate: event.candidate, 
            target: peerId, 
            sender: myPeerId 
          }
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStreams(prev => ({
        ...prev,
        [peerId]: event.streams[0]
      }));
    };

    peerConnectionsRef.current.set(peerId, pc);
    return pc;
  };

  const handleSignal = async (payload: any) => {
    const { type, sender, sdp, candidate } = payload;
    if (sender === myPeerId) return;

    try {
      if (type === 'new-peer') {
        const pc = createPeerConnection(sender);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        channelRef.current.send({
          type: 'broadcast',
          event: 'signal',
          payload: { type: 'offer', sdp: offer, target: sender, sender: myPeerId }
        });
      }
      else if (type === 'offer') {
        const pc = createPeerConnection(sender);
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        channelRef.current.send({
          type: 'broadcast',
          event: 'signal',
          payload: { type: 'answer', sdp: answer, target: sender, sender: myPeerId }
        });
      }
      else if (type === 'answer') {
        const pc = peerConnectionsRef.current.get(sender);
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        }
      }
      else if (type === 'ice-candidate') {
        const pc = peerConnectionsRef.current.get(sender);
        if (pc) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      }
    } catch (err) {
      console.error('Signaling error:', err);
    }
  };

  const handleEndCall = () => {
    navigate('/app/dashboard');
  };

  const remoteParticipants = participants.filter(p => p.peerId !== myPeerId);

  return (
    <div className="h-screen bg-slate-900 flex flex-col overflow-hidden text-white">
      
      {/* Top Bar */}
      <div className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 sm:px-6 z-10">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 hidden sm:flex">
            <Shield size={16} className="text-emerald-400" />
            <span className="text-sm font-mono text-slate-300">Secure</span>
          </div>
          <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>
          <h1 className="font-semibold text-lg truncate max-w-[150px] sm:max-w-md">Room: {meetingId}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {networkStats && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 hidden sm:flex">
              <Signal size={14} className={networkStats.latency < 60 ? 'text-emerald-400' : 'text-yellow-400'} />
              <span>{Math.round(networkStats.latency)}ms</span>
            </div>
          )}

          <button 
            onClick={handleShare}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 hover:text-green-400"
            title="Share via WhatsApp"
          >
            <Share2 size={20} />
          </button>

          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-2 rounded-lg transition-colors ${showSidebar ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
          >
            <Users size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 p-4 overflow-y-auto">
            <div className={`
              grid gap-4 h-full content-center
              grid-cols-1 
              ${participants.length > 1 ? 'md:grid-cols-2' : ''}
              ${participants.length > 4 ? 'lg:grid-cols-3' : ''}
            `}>
              
              {/* Local Video */}
              <div className="relative bg-slate-800 rounded-xl overflow-hidden border-2 border-slate-700 aspect-video group">
                <VideoFeed 
                  stream={localDisplayStream}
                  isMirrored={!isScreenSharing}
                  isMuted={true} // Local user always muted to self
                  className={isVideoOff && !isScreenSharing ? 'hidden' : 'block'}
                />
                
                {/* Placeholder when camera is off and not sharing screen */}
                {isVideoOff && !isScreenSharing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                    <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center">
                      <span className="text-2xl font-bold text-slate-400">{displayName.charAt(0)}</span>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-2 z-10">
                  {isMuted && <MicOff size={12} className="text-red-400" />}
                  <span className="text-sm font-medium">{displayName} (You)</span>
                </div>
              </div>

              {/* Remote Videos */}
              {remoteParticipants.map((p) => (
                <div key={p.peerId} className="relative bg-slate-800 rounded-xl overflow-hidden border-2 border-transparent aspect-video">
                  {remoteStreams[p.peerId] ? (
                    <VideoFeed 
                      stream={remoteStreams[p.peerId]}
                      isMirrored={false}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full bg-slate-800">
                      <Loader className="animate-spin text-blue-500 mb-2" />
                      <span className="text-xs text-slate-400">Connecting...</span>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-2 z-10">
                    <span className="text-sm font-medium">{p.name}</span>
                    {/* Removed IP display */}
                  </div>
                </div>
              ))}
            </div>
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col absolute inset-y-0 right-0 z-20 shadow-2xl sm:relative sm:shadow-none">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="font-semibold">Participants ({participants.length})</h3>
              <button onClick={() => setShowSidebar(false)} className="sm:hidden p-1 hover:bg-slate-700 rounded">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {participants.map(p => (
                <div key={p.peerId} className="flex items-center justify-between p-2 rounded hover:bg-slate-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {p.name} {p.peerId === myPeerId && '(You)'}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center">
                        <Shield size={10} className="mr-1 text-emerald-500" />
                        Secure Connection
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="h-20 bg-slate-800 border-t border-slate-700 px-6 flex items-center justify-between shrink-0">
         <div className="hidden md:block w-48">
            <p className="text-sm text-slate-400">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-xs text-emerald-500 font-medium">Encrypted • Protected</p>
         </div>

         <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 sm:p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            
            <button 
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-3 sm:p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
              {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
            </button>

            <button 
              onClick={handleScreenShareToggle}
              className={`p-3 sm:p-4 rounded-full transition-all ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
              <Monitor size={24} />
            </button>
             
             <button 
              onClick={handleEndCall}
              className="p-3 sm:p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all ml-2 sm:ml-4"
            >
              <PhoneOff size={24} />
            </button>
         </div>

         <div className="hidden md:flex justify-end w-48">
            <button className="text-slate-400 hover:text-white flex items-center space-x-2">
              <Settings size={20} />
              <span className="text-sm">Settings</span>
            </button>
         </div>
      </div>
    </div>
  );
};

export default MeetingRoom;