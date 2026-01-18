import React, { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';
import { simulateHandshake } from '../services/networkService';

const ProxyLoading: React.FC = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { displayName, isHost } = location.state || { displayName: 'Anonymous', isHost: false };
  
  useEffect(() => {
    // Logic runs in background (simulating backend checks) without UI updates
    simulateHandshake(() => {
      // Stage updates are ignored visually as per requirements
    }).then((ip) => {
      // Add a small buffer before transition for smoothness
      setTimeout(() => {
        navigate(`/meeting/${meetingId}`, { state: { virtualIp: ip, displayName, isHost } });
      }, 500);
    });
  }, [navigate, meetingId, displayName, isHost]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-700">
        
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
          <div className="bg-slate-800 p-6 rounded-full border border-slate-700 shadow-2xl relative z-10">
            <Shield size={48} className="text-blue-500" />
          </div>
          <div className="absolute bottom-0 right-0 bg-slate-900 rounded-full p-1.5 border border-slate-700 z-20">
             <Loader2 size={20} className="text-emerald-400 animate-spin" />
          </div>
        </div>

        <div className="space-y-3 max-w-md">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Getting connection established
          </h2>
          <p className="text-slate-400">
            Please wait while we secure your connection...
          </p>
        </div>

      </div>
    </div>
  );
};

export default ProxyLoading;