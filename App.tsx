import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ProxyLoading from './pages/ProxyLoading';
import MeetingRoom from './pages/MeetingRoom';
import Schedule from './pages/Schedule';
import NetworkHealth from './pages/NetworkHealth';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        
        <Route path="/app" element={<Layout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="network" element={<NetworkHealth />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="/connect/:meetingId" element={<ProxyLoading />} />
        <Route path="/meeting/:meetingId" element={<MeetingRoom />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;