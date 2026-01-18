import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Shield, Server, Globe, Lock, CheckCircle, Wifi } from 'lucide-react';
import { simulateHandshake } from '../services/networkService';
import { ConnectionStage } from '../types';

const ProxyLoading: React.FC = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { displayName, isHost } = location.state || { displayName: 'Anonymous', isHost: false };
  
  const [stage, setStage] = useState<ConnectionStage>(ConnectionStage.DETECTING_NETWORK);
  const [virtualIp, setVirtualIp] = useState<string | null>(null);

  useEffect(() => {
    simulateHandshake((currentStage) => {
      setStage(currentStage);
    }).then((ip) => {
      setVirtualIp(ip);
      setStage(ConnectionStage.CONNECTED);
      setTimeout(() => {
        navigate(`/meeting/${meetingId}`, { state: { virtualIp: ip, displayName, isHost } });
      }, 1500);
    });
  }, [navigate, meetingId, displayName, isHost]);

  const steps = [
    { id: ConnectionStage.DETECTING_NETWORK, label: 'Analyzing Local Network', icon: Wifi },
    { id: ConnectionStage.HANDSHAKE_PROXY, label: 'Handshake with Gateway', icon: Globe },
    { id: ConnectionStage.ALLOCATING_IP, label: 'Allocating Virtual IP', icon: Server },
    { id: ConnectionStage.ESTABLISHING_TUNNEL, label: 'Securing VPN Tunnel', icon: Lock },
  ];

  const getStepStatus = (stepId: ConnectionStage) => {
    const order = [
      ConnectionStage.DETECTING_NETWORK,
      ConnectionStage.HANDSHAKE_PROXY,
      ConnectionStage.ALLOCATING_IP,
      ConnectionStage.ESTABLISHING_TUNNEL,
      ConnectionStage.CONNECTED
    ];
    
    const currentIndex = order.indexOf(stage);
    const stepIndex = order.indexOf(stepId);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 shadow-lg shadow-blue-500/30">
            <Shield size={32} className="text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Establishing Secure Link</h2>
          <p className="text-slate-400">Forcing connection through UniConnect Proxy Gateway...</p>
        </div>

        <div className="space-y-6 relative">
           {/* Connecting Line */}
           <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-700 -z-10"></div>

          {steps.map((step) => {
            const status = getStepStatus(step.id);
            const Icon = step.icon;
            
            return (
              <div key={step.id} className="flex items-center space-x-4">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500
                  ${status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : ''}
                  ${status === 'current' ? 'bg-blue-600 border-blue-400 text-white animate-pulse' : ''}
                  ${status === 'pending' ? 'bg-slate-800 border-slate-600 text-slate-600' : ''}
                `}>
                  {status === 'completed' ? <CheckCircle size={20} /> : <Icon size={20} />}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${status === 'pending' ? 'text-slate-500' : 'text-slate-200'}`}>
                    {step.label}
                  </h4>
                  {status === 'current' && (
                    <p className="text-xs text-blue-400 mt-1">Processing...</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {virtualIp && (
          <div className="mt-8 bg-slate-900/50 rounded-lg p-4 border border-emerald-500/30 text-center animate-in fade-in slide-in-from-bottom-4">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Tunnel Established</p>
            <p className="text-emerald-400 font-mono text-lg font-bold">VIP: {virtualIp}</p>
          </div>
        )}
      </div>
      
      <p className="mt-8 text-slate-500 text-sm">
        Layer 2 Tunneling Protocol • 256-bit AES Encryption
      </p>
    </div>
  );
};

export default ProxyLoading;