import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateMockNetworkStats } from '../services/networkService';

const NetworkVisualizer: React.FC = () => {
  const [data, setData] = useState<{ time: string; proxy: number; public: number }[]>([]);

  useEffect(() => {
    // Initialize data
    const initialData = Array.from({ length: 10 }).map((_, i) => ({
      time: `00:${i}0`,
      proxy: 45,
      public: 80
    }));
    setData(initialData);

    const interval = setInterval(() => {
      setData(prevData => {
        const now = new Date();
        const timeStr = `${now.getSeconds()}s`;
        
        const proxyStats = generateMockNetworkStats(true);
        const publicStats = generateMockNetworkStats(false);

        const newDataPoint = {
          time: timeStr,
          proxy: Math.round(proxyStats.latency),
          public: Math.round(publicStats.latency)
        };

        const newData = [...prevData.slice(1), newDataPoint];
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Tunnel Latency vs Public Internet</h3>
          <p className="text-sm text-slate-500">Real-time comparison of packet traversal speed.</p>
        </div>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
            <span className="text-slate-700">Proxy Tunnel (Optimized)</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-slate-300 rounded-full mr-2"></span>
            <span className="text-slate-500">Public Internet (Unstable)</span>
          </div>
        </div>
      </div>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="time" 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              unit="ms"
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              itemStyle={{ fontSize: '12px' }}
            />
            <Line 
              type="monotone" 
              dataKey="public" 
              stroke="#cbd5e1" 
              strokeWidth={2} 
              dot={false} 
              activeDot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="proxy" 
              stroke="#10b981" 
              strokeWidth={3} 
              dot={false} 
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
        <div>
          <p className="text-xs text-slate-500 uppercase font-semibold">Current Jitter</p>
          <p className="text-lg font-bold text-slate-800">2.4ms</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase font-semibold">Packet Loss</p>
          <p className="text-lg font-bold text-emerald-600">0.01%</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase font-semibold">Route Protocol</p>
          <p className="text-lg font-bold text-blue-600">UDP/Tunnel</p>
        </div>
      </div>
    </div>
  );
};

export default NetworkVisualizer;