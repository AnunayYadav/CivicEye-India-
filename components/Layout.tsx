
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
    { path: '/', label: 'Spatial Map', icon: <Map size={20} /> },
    { path: '/report', label: 'New Report', icon: <Plus size={22} /> },
    { path: '/dashboard', label: 'Data Stats', icon: <LayoutGrid size={20} /> },
  ];

  if (user.role !== UserRole.CITIZEN) {
    navItems.push({ path: '/admin', label: 'Admin Console', icon: <Shield size={20} /> });
  }

  const isActive = (path: string) => location.pathname === path;

  const cycleRole = (role: UserRole) => {
    userStore.setRole(role);
    setShowRolePicker(false);
  };

  const handleEmergency = () => {
    setEmergencyActive(true);
    setTimeout(() => setEmergencyActive(false), 5000);
    alert("EMERGENCY SIGNAL TRANSMITTED: Local departments notified.");
  };

  return (
    <div className={`flex h-screen w-full transition-colors duration-500 overflow-hidden font-sans selection:bg-indigo-500/30 ${emergencyActive ? 'bg-red-950/20' : 'bg-[#050505]'}`}>

      {/* Premium Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-20 lg:w-72 bg-zinc-950 border-r border-white/5 py-8 px-4 z-20 shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-10%] left-[-20%] w-[150%] h-[50%] bg-indigo-500/5 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[150%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full -z-10" />

        <div className="flex items-center gap-4 px-3 mb-12">
          <div className="relative w-12 h-12 flex items-center justify-center rounded-[18px] bg-indigo-500 text-white overflow-hidden shadow-lg shadow-indigo-500/20">
            <Globe size={24} strokeWidth={2.5} />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-xl font-black tracking-tighter leading-none">CivicEye</h1>
            <p className="text-[10px] text-indigo-400/60 uppercase tracking-[0.3em] font-black mt-1">India Protocol</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <p className="hidden lg:block text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 px-3">Main Navigation</p>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center gap-4 px-4 py-4 rounded-[20px] transition-all duration-300 group ${isActive(item.path)
                  ? 'bg-white text-black shadow-2xl scale-[1.02]'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
            >
              <div className={`transition-transform duration-300 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </div>
              <span className="hidden lg:block font-bold text-sm tracking-tight">{item.label}</span>

              {isActive(item.path) && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-white rounded-[20px] -z-10 shadow-indigo-500/20 shadow-2xl"
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Emergency Button - Static Sidebar Position */}
        <div className="mb-6 px-3">
          <button
            onClick={handleEmergency}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-[20px] bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-600/20 transition-all active:scale-95 group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <AlertCircle size={20} className={emergencyActive ? 'animate-ping' : ''} />
            <span className="hidden lg:block font-black text-[10px] uppercase tracking-widest text-white">Emergency Response</span>
          </button>
        </div>

        {/* User Profile */}
        <div className="mt-auto space-y-4">
          <div className="relative">
            <AnimatePresence>
              {showRolePicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute bottom-full mb-2 left-0 w-full bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-2 z-50 overflow-hidden"
                >
                  <div className="text-[9px] font-black text-white/20 uppercase tracking-widest p-2 border-b border-white/5">Switch Protocol</div>
                  {[UserRole.CITIZEN, UserRole.ADMIN, UserRole.SUPER_ADMIN].map(role => (
                    <button
                      key={role}
                      onClick={() => cycleRole(role)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${user.role === role ? 'bg-indigo-600 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                    >
                      <Shield size={14} />
                      {role.replace('_', ' ')}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setShowRolePicker(!showRolePicker)}
              className="w-full flex items-center justify-between gap-4 p-3 rounded-[24px] bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-[14px] bg-indigo-600 p-[1.5px] shrink-0 shadow-lg shadow-indigo-600/20">
                  <div className="w-full h-full rounded-[13px] bg-black flex items-center justify-center overflow-hidden">
                    <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                </div>
                <div className="hidden lg:block text-left overflow-hidden">
                  <p className="text-xs font-black truncate">{user.name}</p>
                  <p className="text-[10px] text-indigo-400 font-bold truncate tracking-tight uppercase">{user.role.replace('_', ' ')}</p>
                </div>
              </div>
              <ChevronUp size={16} className={`text-white/20 transition-transform ${showRolePicker ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-full w-full bg-black overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
        {/* Modern Blur Header */}
        <header className="absolute top-0 left-0 w-full z-[3000] px-6 py-6 flex items-center justify-between pointer-events-none">
          <div className="md:hidden flex items-center gap-3 bg-zinc-950/80 backdrop-blur-2xl border border-white/10 px-4 py-2.5 rounded-2xl shadow-2xl pointer-events-auto">
            <Globe className="text-indigo-500" size={18} strokeWidth={2.5} />
            <span className="text-sm font-black tracking-tight">{user.role}</span>
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
            <button
              onClick={handleEmergency}
              className="md:hidden w-10 h-10 rounded-xl bg-red-600 border border-red-500 flex items-center justify-center text-white shadow-xl shadow-red-600/30"
            >
              <Phone size={18} />
            </button>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{user.city} LOCAL NODE</span>
            </div>
            <button className="w-10 h-10 rounded-xl bg-zinc-950/80 backdrop-blur-2xl border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all shadow-xl">
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* Content Render with Transition */}
        <div className="flex-1 h-full w-full relative overflow-hidden bg-[#050505]">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname + user.role + emergencyActive}
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="h-full w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Floating Island */}
        <div className="md:hidden absolute bottom-8 left-0 w-full flex justify-center z-[3000] px-6 pointer-events-none">
          <div className="flex items-center gap-2 bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-[30px] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-500/5 -z-10" />
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center justify-center px-6 h-12 rounded-[22px] transition-all duration-500 ${isActive(item.path)
                    ? 'bg-white text-black shadow-xl scale-105'
                    : 'text-white/30'
                  }`}
              >
                {item.icon}
                {isActive(item.path) && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    className="ml-2 text-[10px] font-black uppercase tracking-widest overflow-hidden whitespace-nowrap"
                  >
                    {item.label.split(' ')[0]}
                  </motion.span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;