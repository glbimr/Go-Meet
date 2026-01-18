import React from 'react';
import NetworkVisualizer from '../components/NetworkVisualizer';
import { Server, Activity, Shield } from 'lucide-react';

const NetworkHealth: React.FC = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Network Health Monitor</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
            <Server size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Routing Gateway</p>
            <p className="text-xl font-bold text-slate-900">US-East-1</p>
          </div>
        </div>
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Uptime</p>
            <p className="text-xl font-bold text-slate-900">99.99%</p>
          </div>
        </div>
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="bg-purple-100 p-3 rounded-full text-purple-600">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Protocol</p>
            <p className="text-xl font-bold text-slate-900">WireGuard</p>
          </div>
        </div>
      </div>

      <NetworkVisualizer />
      
      <div className="bg-slate-900 text-white p-6 rounded-xl">
        <h3 className="font-bold text-lg mb-2">Technical Diagnostics</h3>
        <pre className="font-mono text-xs text-slate-400 overflow-x-auto">
          {`> PING 10.8.0.1 (SECURE_GATEWAY) 56(84) bytes of data.
64 bytes from 10.8.0.1: icmp_seq=1 ttl=64 time=45.2 ms
64 bytes from 10.8.0.1: icmp_seq=2 ttl=64 time=44.8 ms
64 bytes from 10.8.0.1: icmp_seq=3 ttl=64 time=45.1 ms

--- 10.8.0.1 statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2003ms
rtt min/avg/max/mdev = 44.812/45.051/45.231/0.176 ms`}
        </pre>
      </div>
    </div>
  );
};

export default NetworkHealth;