import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  Mic, MicOff, Video, VideoOff, Monitor, PhoneOff, 
  Users, MessageSquare, Settings, Shield, Signal, Share2, X, Loader
} from 'lucide-react';
import { generateMockNetworkStats } from '../services/networkService';
import { NetworkStats } from '../types';
import { supabase } from '../lib/supabaseClient';

const MeetingRoom: React.FC = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const virtualIp = location.state?.virtualIp || '10.8.0.x';
  const displayName = location.state?.displayName || 'Anonymous';
  const isHost = location.state?.isHost || false;

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  
  // Real participants state
  const [participants, setParticipants] = useState<any[]>([]);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    // 1. Join the Realtime channel
    const channel = supabase.channel(`room:${meetingId}`, {
      config: {
        presence: {
          key: displayName, // Using display name as key for simple deduping in this demo
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const users = [];
        // Transform Supabase presence state into our participant array
        for (const key in newState) {
           const presence = newState[key][0] as any;
           users.push({
             id: key,
             name: presence.name,
             ip: presence.ip,
             isHost: presence.isHost,
             isTalking: false // Audio level detection would go here in full implementation
           });
        }
        setParticipants(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track self
          await channel.track({
            name: displayName,
            ip: virtualIp,
            isHost: isHost,
            online_at: new Date().toISOString(),
          });
        }
      });

    // 2. Initialize Local Media
    const initMedia = async () => {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(localStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
      } catch (err) {
        console.error("Failed to access media devices", err);
        setIsVideoOff(true);
        setIsMuted(true);
      }
    };
    initMedia();

    // 3. Network Monitoring Simulation
    const interval = setInterval(() => {
      setNetworkStats(generateMockNetworkStats(true));
    }, 2000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [meetingId, displayName, virtualIp, isHost]);

  // Handle toggling local tracks
  useEffect(() => {
    if (stream) {
      stream.getAudioTracks().forEach(track => track.enabled = !isMuted);
      stream.getVideoTracks().forEach(track => track.enabled = !isVideoOff);
    }
  }, [isMuted, isVideoOff, stream]);

  const handleEndCall = () => {
    navigate('/app/dashboard');
  };

  return (
    <div className="h-screen bg-slate-900 flex flex-col overflow-hidden text-white">
      {/* Top Bar */}
      <div className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 sm:px-6 z-10">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 hidden sm:flex">
            <Shield size={16} className="text-emerald-400" />
            <span className="text-sm font-mono text-slate-300">VIP: {virtualIp}</span>
          </div>
          <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>
          <h1 className="font-semibold text-lg truncate max-w-[150px] sm:max-w-md">Meeting: {meetingId}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {networkStats && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 hidden sm:flex">
              <Signal size={14} className={networkStats.latency < 60 ? 'text-emerald-400' : 'text-yellow-400'} />
              <span>{Math.round(networkStats.latency)}ms</span>
              <span className="text-slate-600">|</span>
              <span>{networkStats.packetLoss}% Loss</span>
            </div>
          )}
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-2 rounded-lg transition-colors ${showSidebar ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
          >
            <Users size={20} />
            <span className="absolute top-3 right-3 flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Video Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          {participants.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
               <Loader className="animate-spin mb-4" />
               <p>Connecting to secure room...</p>
            </div>
          ) : (
            <div className={`
              grid gap-4 h-full
              ${participants.length <= 1 ? 'grid-cols-1' : ''}
              ${participants.length === 2 ? 'grid-cols-1 md:grid-cols-2' : ''}
              ${participants.length > 2 ? 'grid-cols-2 lg:grid-cols-3' : ''}
            `}>
              {participants.map((p) => {
                const isMe = p.name === displayName; // Simple check for demo
                
                return (
                  <div key={p.id} className={`
                    relative bg-slate-800 rounded-xl overflow-hidden border-2 transition-all group
                    ${p.isTalking ? 'border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.5)]' : 'border-transparent'}
                  `}>
                    {/* Video Feed */}
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
                      {isMe ? (
                        /* Local Video Stream */
                         <video 
                           ref={localVideoRef}
                           autoPlay 
                           muted 
                           playsInline
                           className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'} transform scale-x-[-1]`}
                         />
                      ) : (
                        /* Remote Placeholder (WebRTC logic would render remote stream here) */
                        <div className="flex flex-col items-center justify-center w-full h-full bg-slate-800">
                           <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold mb-4">
                             {p.name.charAt(0)}
                           </div>
                           <p className="text-slate-400 text-sm">Remote Stream via Proxy</p>
                        </div>
                      )}
                      
                      {/* Video Off Fallback */}
                      {((isMe && isVideoOff) || (!isMe)) && (
                         <div className={`absolute inset-0 flex items-center justify-center bg-slate-800 ${isMe && !isVideoOff ? 'hidden' : ''} ${!isMe ? '-z-10' : ''}`}>
                            <div className="flex flex-col items-center text-slate-500">
                               <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center mb-4">
                                  <span className="text-3xl font-bold text-slate-400">{p.name.charAt(0)}</span>
                               </div>
                            </div>
                         </div>
                      )}

                      
                      {/* Name Tag */}
                      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-2 z-10">
                        {(!isMe) ? <Mic size={12} className="text-emerald-400" /> : null}
                        {isMe && isMuted && <MicOff size={12} className="text-red-400" />}
                        <span className="text-sm font-medium">{p.name} {isMe ? '(You)' : ''}</span>
                        <span className="text-xs text-slate-400 font-mono hidden sm:inline">({p.ip})</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar (Right) */}
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
                <div key={p.id} className="flex items-center justify-between p-2 rounded hover:bg-slate-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {p.name} {p.name === displayName && '(You)'}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center">
                        <Shield size={10} className="mr-1 text-emerald-500" />
                        {p.ip}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                     {/* Visual only for this demo */}
                     <Mic size={16} className="text-emerald-400" />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-700 bg-slate-800/50">
               <div className="text-xs text-slate-400 mb-2 font-mono uppercase">Tunnel Status</div>
               <div className="w-full bg-slate-700 rounded-full h-1.5 mb-1">
                 <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '98%' }}></div>
               </div>
               <div className="flex justify-between text-xs text-slate-500">
                 <span>Stable</span>
                 <span>Throughput: 4.5 MB/s</span>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls Bar (Bottom) */}
      <div className="h-20 bg-slate-800 border-t border-slate-700 px-6 flex items-center justify-between shrink-0">
         {/* Left: Info */}
         <div className="hidden md:block w-48">
            <p className="text-sm text-slate-400">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-xs text-emerald-500 font-medium">Encrypted • Proxied</p>
         </div>

         {/* Center: Main Controls */}
         <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 sm:p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            
            <button 
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-3 sm:p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}`}
              title={isVideoOff ? "Turn Video On" : "Stop Video"}
            >
              {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
            </button>

            <button 
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className={`p-3 sm:p-4 rounded-full transition-all ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 hover:bg-slate-600'}`}
              title="Share Screen"
            >
              <Monitor size={24} />
            </button>

             <button 
              className="p-3 sm:p-4 rounded-full bg-slate-700 hover:bg-slate-600 transition-all"
              title="Chat"
            >
              <MessageSquare size={24} />
            </button>
             
             <button 
              onClick={handleEndCall}
              className="p-3 sm:p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all ml-2 sm:ml-4"
              title="Leave Meeting"
            >
              <PhoneOff size={24} />
            </button>
         </div>

         {/* Right: Settings */}
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