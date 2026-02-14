
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Map, Plus, LayoutGrid, Globe, Bell, Settings, Shield, User as UserIcon, LogOut, ChevronUp, AlertCircle, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { userStore } from '../services/store';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [user, setUser] = useState(userStore.getCurrentUser());
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [emergencyActive, setEmergencyActive] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setUser(userStore.getCurrentUser());
    userStore.addEventListener('user_updated', handleUpdate);
    return () => userStore.removeEventListener('user_updated', handleUpdate);
  }, []);

  const navItems = [
    { path: '/', label: 'Spatial Map', icon: <Map size={18} /> },
    { path: '/report', label: 'New Report', icon: <Plus size={18} /> },
    { path: '/dashboard', label: 'Data Stats', icon: <LayoutGrid size={18} /> },
  ];

  if (user.role !== UserRole.CITIZEN) {
    navItems.push({ path: '/admin', label: 'Authority', icon: <Shield size={18} /> });
  }

  const isActive = (path: string) => location.pathname === path;

  const cycleRole = (role: UserRole) => {
    userStore.setRole(role);
    setShowRolePicker(false);
  };

  const handleEmergency = () => {
    setEmergencyActive(true);
    setTimeout(() => setEmergencyActive(false), 5000);
  };

  return (
    <div className={`flex h-screen w-full transition-colors duration-500 overflow-hidden font-sans selection:bg-indigo-500/30 ${emergencyActive ? 'bg-red-950/10' : 'bg-black'}`}>

      {/* Compact Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-zinc-950 border-r border-white/5 py-6 px-3 z-20 relative overflow-hidden">
        <div className="flex items-center gap-3 px-3 mb-10">
          <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <Globe size={18} strokeWidth={2.5} />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-sm font-black tracking-tighter uppercase italic">CivicEye</h1>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group ${isActive(item.path)
                  ? 'bg-white text-black font-bold'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
            >
              <div className="shrink-0">{item.icon}</div>
              <span className="text-xs tracking-tight">{item.label}</span>
              {isActive(item.path) && (
                <motion.div layoutId="active-nav" className="absolute inset-0 bg-white rounded-xl -z-10" />
              )}
            </Link>
          ))}
        </nav>

        {/* Minimal User Profile */}
        <div className="mt-auto pt-6 border-t border-white/5 space-y-3">
          <button
            onClick={handleEmergency}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-red-500/10"
          >
            <AlertCircle size={14} />
            Emergency
          </button>

          <div className="relative">
            <AnimatePresence>
              {showRolePicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full mb-2 left-0 w-full bg-zinc-900 border border-white/10 rounded-xl shadow-2xl p-1 z-50 overflow-hidden"
                >
                  {[UserRole.CITIZEN, UserRole.ADMIN, UserRole.SUPER_ADMIN].map(role => (
                    <button
                      key={role}
                      onClick={() => cycleRole(role)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold ${user.role === role ? 'bg-indigo-600 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                    >
                      {role.replace('_', ' ')}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setShowRolePicker(!showRolePicker)}
              className="w-full flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all text-left"
            >
              <img src={user.profilePic} alt="" className="w-8 h-8 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-white truncate">{user.name}</p>
                <p className="text-[9px] text-white/30 uppercase font-black tracking-widest truncate">{user.role}</p>
              </div>
              <ChevronUp size={14} className={`text-white/20 transition-transform ${showRolePicker ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative h-full bg-black overflow-hidden">
        {/* Compact Header for Mobile */}
        <header className="absolute top-0 left-0 w-full z-[3000] px-4 py-4 flex items-center justify-between md:hidden pointer-events-none">
          <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-xl border border-white/10 shadow-2xl pointer-events-auto">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">{user.role}</span>
          </div>
          <button className="w-8 h-8 rounded-lg bg-zinc-950 border border-white/10 flex items-center justify-center text-white/40 pointer-events-auto">
            <Bell size={14} />
          </button>
        </header>

        <div className="flex-1 h-full w-full relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname + user.role}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              className="h-full w-full overflow-hidden"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Compact Bottom Nav for Mobile */}
        <div className="md:hidden absolute bottom-6 left-0 w-full flex justify-center z-[3000] px-6 pointer-events-none">
          <div className="flex items-center gap-1 bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-1 shadow-2xl pointer-events-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-center px-4 h-10 rounded-xl transition-all ${isActive(item.path) ? 'bg-white text-black' : 'text-white/30'
                  }`}
              >
                {item.icon}
              </Link>
            ))}
            <button onClick={() => setShowRolePicker(!showRolePicker)} className="flex items-center justify-center px-4 h-10 rounded-xl text-white/30">
              <UserIcon size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;