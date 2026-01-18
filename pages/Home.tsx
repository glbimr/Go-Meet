import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Video, Users, ArrowRight, Activity, Zap, Loader2 } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import { supabase } from '../lib/supabaseClient';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [meetingId, setMeetingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStartMeeting = async () => {
    if (!displayName) {
      setError('Please enter a display name');
      return;
    }
    setLoading(true);
    const newId = `meet-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Create meeting in DB
      const { error: dbError } = await supabase
        .from('meetings')
        .insert([{ id: newId, host_name: displayName, status: 'active' }]);

      if (dbError) throw dbError;

      navigate(`/connect/${newId}`, { state: { displayName, isHost: true } });
    } catch (err: any) {
      console.error('Error creating meeting:', err);
      setError('Failed to create meeting. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingId || !displayName) {
      setError('Please enter both Meeting ID and Display Name');
      return;
    }
    setLoading(true);

    try {
      // Check if meeting exists
      const { data, error: fetchError } = await supabase
        .from('meetings')
        .select('id')
        .eq('id', meetingId)
        .single();

      if (fetchError || !data) {
        setError('Meeting not found or has ended.');
        setLoading(false);
        return;
      }

      navigate(`/connect/${meetingId}`, { state: { displayName, isHost: false } });
    } catch (err) {
      console.error(err);
      setError('Error joining meeting.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center space-x-2 mb-4">
          <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-500/30">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <span className="text-3xl font-bold text-slate-900 tracking-tight">UniConnect</span>
        </div>
        <p className="text-slate-500 max-w-md mx-auto">
          Universal connectivity platform for seamless meetings on any network.
        </p>
      </div>

      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
        
        {/* Left Card: Join/Start */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Join Session</h2>
          
          <div className="space-y-6">
            <Input 
              label="Your Display Name" 
              placeholder="e.g. John Doe" 
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setError('');
              }}
              className="bg-slate-50"
            />

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Instant Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={handleStartMeeting} 
                  className="w-full h-12"
                  disabled={loading}
                  icon={loading ? <Loader2 className="animate-spin mr-2" size={18}/> : <Video size={18} className="mr-2"/>}
                >
                  {loading ? 'Creating...' : 'New Meeting'}
                </Button>
                <div className="relative">
                  <form onSubmit={handleJoinMeeting} className="flex">
                    <input 
                      type="text" 
                      placeholder="Meeting ID" 
                      className="w-full rounded-l-lg border-y border-l border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      value={meetingId}
                      onChange={(e) => setMeetingId(e.target.value)}
                    />
                    <button 
                      type="submit"
                      disabled={!meetingId || loading}
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-r-lg px-3 text-slate-700 disabled:opacity-50 transition-colors"
                    >
                      <ArrowRight size={18} />
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}
          </div>
        </div>

        {/* Right Card: Features / Info */}
        <div className="bg-slate-900 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-12 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 p-12 bg-emerald-500 rounded-full blur-3xl opacity-20 -ml-16 -mb-16 pointer-events-none"></div>

          <div>
            <div className="inline-flex items-center space-x-2 bg-slate-800 rounded-full px-3 py-1 text-xs font-medium text-emerald-400 mb-6 border border-slate-700">
              <Zap size={12} />
              <span>Optimized Routing Active</span>
            </div>
            
            <h3 className="text-2xl font-bold mb-4">Why UniConnect?</h3>
            <ul className="space-y-4 text-slate-300">
              <li className="flex items-start">
                <Activity size={20} className="mr-3 text-blue-400 flex-shrink-0" />
                <span className="text-sm">Bypasses network restrictions via smart secure routing.</span>
              </li>
              <li className="flex items-start">
                <Users size={20} className="mr-3 text-blue-400 flex-shrink-0" />
                <span className="text-sm">Unified routing ensures all participants connect seamlessly.</span>
              </li>
              <li className="flex items-start">
                <ShieldCheck size={20} className="mr-3 text-blue-400 flex-shrink-0" />
                <span className="text-sm">Anonymous, log-free access with ephemeral session keys.</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-500 font-mono">
            System Status: <span className="text-emerald-500">Live</span> • Connected to Supabase
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;