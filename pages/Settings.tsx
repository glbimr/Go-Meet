import React, { useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import { Mic, Video, Monitor } from 'lucide-react';

const Settings: React.FC = () => {
  const [proxyEnabled, setProxyEnabled] = useState(true);

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-slate-800">Connection Preferences</h2>
        
        <div className="flex items-center justify-between py-4 border-b border-slate-100">
          <div>
            <p className="font-medium text-slate-900">Force Secure Routing</p>
            <p className="text-sm text-slate-500">Route all traffic through the UniConnect secure gateway for better stability.</p>
          </div>
          <button 
            onClick={() => setProxyEnabled(!proxyEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative ${proxyEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${proxyEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>
        </div>

        <div>
            <Input label="Preferred Gateway Region" placeholder="Auto (US-East)" disabled />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-slate-800">Audio & Video</h2>
        
        <div className="space-y-4">
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">Microphone</label>
             <div className="flex items-center space-x-2 p-3 border border-slate-300 rounded-lg bg-slate-50">
               <Mic size={18} className="text-slate-500" />
               <span className="text-sm text-slate-700">Default - MacBook Pro Microphone</span>
             </div>
           </div>
           
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">Camera</label>
             <div className="flex items-center space-x-2 p-3 border border-slate-300 rounded-lg bg-slate-50">
               <Video size={18} className="text-slate-500" />
               <span className="text-sm text-slate-700">FaceTime HD Camera</span>
             </div>
           </div>
        </div>
        
        <div className="pt-4">
            <Button variant="secondary">Test Devices</Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;