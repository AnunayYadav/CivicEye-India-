
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Map, Plus, LayoutGrid, Globe, Bell, Settings, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Spatial Map', icon: <Map size={20} /> },
    { path: '/report', label: 'New Report', icon: <Plus size={22} /> },
    { path: '/dashboard', label: 'Data Stats', icon: <LayoutGrid size={20} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen w-full bg-[#050505] text-white overflow-hidden font-sans selection:bg-indigo-500/30">

      {/* Premium Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-20 lg:w-72 bg-zinc-950 border-r border-white/5 py-8 px-4 z-20 shadow-2xl relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-[-10%] left-[-20%] w-[150%] h-[50%] bg-indigo-500/5 blur-[120px] rounded-full -z-10" />

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
                  ? 'bg-white text-black shadow-2xl'
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

        <div className="mt-auto space-y-6">
          <div className="hidden lg:flex items-center gap-4 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-950 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt="" className="w-full h-full object-cover opacity-60" />
                </div>
              ))}
            </div>
            <p className="text-[10px] font-bold text-white/40"><span className="text-emerald-400">12</span> Active Peers</p>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-[24px] bg-gradient-to-tr from-white/5 to-transparent border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
            <div className="w-10 h-10 rounded-[14px] bg-indigo-600 p-[1.5px] shrink-0 shadow-lg shadow-indigo-600/20">
              <div className="w-full h-full rounded-[13px] bg-black flex items-center justify-center overflow-hidden">
                <img src="https://i.pravatar.cc/150?u=anunay" alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="hidden lg:block overflow-hidden">
              <p className="text-xs font-black truncate">Anunay Yadav</p>
              <p className="text-[10px] text-white/40 truncate flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                Senior Contributor
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-full w-full bg-black overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
        {/* Modern Blur Header - Persistent on all pages */}
        <header className="absolute top-0 left-0 w-full z-[3000] px-6 py-6 flex items-center justify-between pointer-events-none">
          <div className="md:hidden flex items-center gap-3 bg-zinc-950/80 backdrop-blur-2xl border border-white/10 px-4 py-2.5 rounded-2xl shadow-2xl pointer-events-auto">
            <Globe className="text-indigo-500" size={18} strokeWidth={2.5} />
            <span className="text-sm font-black tracking-tight">Protocol</span>
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
            <button className="w-10 h-10 rounded-xl bg-zinc-950/80 backdrop-blur-2xl border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">
              <Bell size={18} />
            </button>
            <button className="w-10 h-10 rounded-xl bg-zinc-950/80 backdrop-blur-2xl border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all md:hidden">
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* Content Render with Transition */}
        <div className="flex-1 h-full w-full relative overflow-hidden bg-[#050505]">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
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

        {/* Mobile Modern Navigation - Floating Island */}
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