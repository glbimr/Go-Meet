import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Activity 
} from 'lucide-react';

const Layout: React.FC = () => {
  const navigate = useNavigate();

  const handleExit = () => {
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">UniConnect</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded inline-block">
            Proxy Tunnel: Active
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavLink 
            to="/app/dashboard"
            className={({ isActive }) => 
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </NavLink>
          
          <NavLink 
            to="/app/schedule"
            className={({ isActive }) => 
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Calendar size={20} />
            <span>Schedule</span>
          </NavLink>

           <NavLink 
            to="/app/network"
            className={({ isActive }) => 
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Activity size={20} />
            <span>Network Health</span>
          </NavLink>

          <NavLink 
            to="/app/settings"
            className={({ isActive }) => 
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleExit}
            className="flex items-center space-x-3 text-slate-400 hover:text-white w-full px-4 py-2 transition-colors"
          >
            <LogOut size={20} />
            <span>Exit Dashboard</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center md:hidden">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">UniConnect</span>
          </div>
          <button onClick={handleExit} className="text-slate-500">
            <LogOut size={20} />
          </button>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;