import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Map, Plus, LayoutGrid, Globe, Bell, Shield,
  User as UserIcon, ChevronUp, AlertCircle, Trophy,
  LogOut, Settings, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { userStore } from '../services/store';
import { UserRole } from '../types';
import EmergencyButton from './EmergencyButton';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(userStore.getCurrentUser());
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setUser(userStore.getCurrentUser());
    userStore.addEventListener('user_updated', handleUpdate);
    return () => userStore.removeEventListener('user_updated', handleUpdate);
  }, []);

  const navItems = [
    { path: '/', label: 'Spatial Map', icon: <Map size={18} /> },
    { path: '/report', label: 'Log Incident', icon: <Plus size={18} /> },
    { path: '/dashboard', label: 'Analytics', icon: <LayoutGrid size={18} /> },
    { path: '/leaderboard', label: 'Leaders', icon: <Trophy size={18} /> },
  ];

  if (user.role !== UserRole.CITIZEN) {
    navItems.push({ path: '/admin', label: 'Authority', icon: <Shield size={18} /> });
  }

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await userStore.logout();
    navigate('/');
  };


  return (
    <div className="flex h-screen w-full transition-all duration-700 overflow-hidden font-sans bg-black">

      {/* Visual Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Glass Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white/[0.01] backdrop-blur-3xl border-r border-white/5 py-8 px-4 z-20 relative overflow-hidden">
        <div className="flex items-center gap-3 px-3 mb-12">
          <div className="w-9 h-9 flex items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20">
            <Globe size={20} strokeWidth={2.5} />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-lg font-black tracking-tighter uppercase italic gradient-text">CivicEye</h1>
            <p className="text-[8px] text-white/20 font-black uppercase tracking-[0.3em] mt-0.5">India Protocol</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-500 group overflow-hidden ${isActive(item.path)
                ? 'text-black font-black'
                : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
            >
              <div className="shrink-0 z-10">{item.icon}</div>
              <span className="text-xs tracking-tight z-10">{item.label}</span>
              {isActive(item.path) && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-white rounded-2xl shadow-2xl"
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-8 space-y-4">

          <div className="relative">
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute bottom-full mb-3 left-0 w-full bg-zinc-950 border border-white/10 rounded-[2rem] shadow-2xl p-4 z-50 overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-white/5">
                      <span className="text-[9px] font-black text-white/20 uppercase">Profile Settings</span>
                      <Settings size={12} className="text-white/20" />
                    </div>

                    <button className="w-full flex items-center justify-between text-[10px] font-black text-white hover:text-indigo-400 transition-colors uppercase">
                      <span>Verified Guardian</span>
                      <ExternalLink size={10} />
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 text-[10px] font-black text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-all uppercase"
                    >
                      <LogOut size={14} /> Log Out Protocol
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setShowProfile(!showProfile)}
              className="w-full flex items-center gap-3 p-2.5 rounded-[1.5rem] bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10 group-hover:border-indigo-500 transition-colors bg-zinc-900">
                <img src={user.profilePic || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-black text-white truncate">{user.name}</p>
                  <div className="flex items-center gap-0.5 text-orange-400">
                    <Shield size={8} fill="currentColor" />
                    <span className="text-[8px] font-black">{user.trustScore}</span>
                  </div>
                </div>
                <p className="text-[9px] text-indigo-400/60 uppercase font-black tracking-widest truncate">{user.trustLevel}</p>
              </div>
              <ChevronUp size={14} className={`text-white/20 transition-transform duration-500 ${showProfile ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative h-full bg-transparent overflow-hidden">
        <header className="absolute top-0 left-0 w-full z-[3000] px-6 py-6 flex items-center justify-between md:hidden pointer-events-none">
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-3xl px-4 py-2 rounded-2xl border border-white/10 shadow-2xl pointer-events-auto">
            <Globe size={16} className="text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-widest italic">{user.role}</span>
          </div>
        </header>

        <div className="flex-1 h-full w-full relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname + user.role}
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="h-full w-full overflow-hidden"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Compact Glass Bottom Nav - Mobile */}
        <div className="md:hidden absolute bottom-8 left-0 w-full flex justify-center z-[3000] px-6 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] pointer-events-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-center px-5 h-11 rounded-[2rem] transition-all duration-500 relative ${isActive(item.path) ? 'text-black' : 'text-white/30'
                  }`}
              >
                {item.icon}
                {isActive(item.path) && (
                  <motion.div layoutId="mobile-active" className="absolute inset-0 bg-white rounded-[2rem] -z-10" />
                )}
              </Link>
            ))}
            <button onClick={() => setShowProfile(!showProfile)} className="flex items-center justify-center px-5 h-11 rounded-[2rem] text-white/30">
              <UserIcon size={18} />
            </button>
          </div>
        </div>
      </main>
      <EmergencyButton />
    </div>
  );
};

export default Layout;