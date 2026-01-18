import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Video, Calendar, Clock, MoreHorizontal, ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import NetworkVisualizer from '../components/NetworkVisualizer';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleStartInstantMeeting = () => {
    const meetingId = `meet-${Math.random().toString(36).substr(2, 9)}`;
    navigate(`/connect/${meetingId}`, { state: { displayName: 'Host' } });
  };

  const publicRooms = [
    { id: 'demo-room-1', title: 'Open Public Lobby #1', participants: 4, region: 'US-East' },
    { id: 'demo-room-2', title: 'Dev Testing Ground', participants: 12, region: 'EU-West' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Guest Dashboard</h1>
          <p className="text-slate-500">Monitor network stability and join public channels.</p>
        </div>
        <div className="flex space-x-3">
           <Button onClick={handleStartInstantMeeting}>
             <Plus className="mr-2" size={18} />
             Start Private Session
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
               <p className="text-xs text-slate-500 uppercase font-semibold">Connection Status</p>
               <p className="text-xl font-mono font-bold text-slate-800">Secured</p>
             </div>
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
               <p className="text-xs text-slate-500 uppercase font-semibold">Routing Node</p>
               <p className="text-xl font-bold text-emerald-600">Active</p>
             </div>
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
               <p className="text-xs text-slate-500 uppercase font-semibold">Latency</p>
               <p className="text-xl font-bold text-blue-600">~45ms</p>
             </div>
          </div>

          {/* Network Visualizer */}
          <NetworkVisualizer />

          {/* Public Rooms */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
               <h3 className="font-semibold text-slate-900">Public Access Points</h3>
               <span className="text-xs text-slate-400">Auto-routed</span>
             </div>
             <div className="divide-y divide-slate-100">
               {publicRooms.map(room => (
                 <div key={room.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                   <div>
                     <p className="font-medium text-slate-900">{room.title}</p>
                     <p className="text-xs text-slate-500">Region: {room.region} • {room.participants} active peers</p>
                   </div>
                   <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => navigate(`/connect/${room.id}`, { state: { displayName: 'Guest' } })}
                   >
                     Join
                   </Button>
                 </div>
               ))}
             </div>
           </div>

        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 rounded-xl p-6 text-white relative overflow-hidden">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500 rounded-full opacity-20 blur-2xl"></div>
             <h3 className="font-bold mb-2">System Status</h3>
             <div className="space-y-3">
               <div className="flex justify-between text-sm">
                 <span className="text-slate-400">Global Gateway</span>
                 <span className="text-emerald-400">Operational</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-400">Network Load</span>
                 <span>34%</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-400">Active Sessions</span>
                 <span>1,204</span>
               </div>
             </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <h3 className="text-blue-900 font-bold mb-2">Pro Tip</h3>
            <p className="text-blue-700 text-sm mb-4">
              Experiencing high jitter on public WiFi? The optimized routing automatically buffers packets to smooth out audio delivery.
            </p>
            <Button size="sm" variant="ghost" className="text-blue-700 hover:bg-blue-100 p-0">
              Run Speed Test <ArrowRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;