import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import MapPage from './pages/MapPage';
import ReportPage from './pages/ReportPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import LeaderboardPage from './pages/LeaderboardPage';

import { userStore } from './services/store';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const user = userStore.getCurrentUser();

      setInitializing(userStore.getIsInitializing());
    };

    checkAuth();
    userStore.addEventListener('user_updated', checkAuth);
    return () => userStore.removeEventListener('user_updated', checkAuth);
  }, []);

  if (initializing) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="text-indigo-500 animate-spin" size={40} />
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Initializing_Grid</p>
      </div>
    );
  }


  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Layout>
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
