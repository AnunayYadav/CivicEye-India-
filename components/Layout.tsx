import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Map, PlusCircle, LayoutDashboard, Globe } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Live Map', icon: <Map size={20} /> },
    { path: '/report', label: 'Report', icon: <PlusCircle size={20} /> },
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen w-full bg-black text-slate-100 overflow-hidden font-sans">
      
      {/* Desktop Sidebar with Glass Effect */}
      <aside className="hidden md:flex flex-col w-72 border-r border-white/5 bg-zinc-950/40 backdrop-blur-xl z-20">
        <div className="p-8 flex items-center gap-3">
          <div className="relative">
            <Globe className="text-indigo-500" size={32} />
            <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20"></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">CivicEye</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">India</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                isActive(item.path) 
                  ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/5' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className={`${isActive(item.path) ? 'text-indigo-400' : 'group-hover:text-indigo-400'} transition-colors`}>
                {item.icon}
              </div>
              <span className="font-medium tracking-wide">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-6">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-zinc-900 to-black border border-white/10">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold ring-2 ring-black">
              JD
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">John Doe</p>
              <p className="text-xs text-indigo-400 font-medium">Verified Citizen</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-full overflow-hidden bg-black">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-black/60 backdrop-blur-md flex items-center justify-between px-4 border-b border-white/10 z-30 absolute top-0 w-full">
          <div className="flex items-center gap-2">
            <Globe className="text-indigo-500" size={24} />
            <h1 className="text-lg font-bold text-white">CivicEye</h1>
          </div>
        </header>

        {/* Content Render */}
        <div className="flex-1 h-full w-full relative pt-16 md:pt-0 overflow-hidden">
          {children}
        </div>

        {/* Mobile Bottom Navigation with Glassmorphism */}
        <div className="md:hidden h-20 bg-black/80 backdrop-blur-xl border-t border-white/10 flex justify-around items-center z-30 pb-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${
                isActive(item.path) ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${isActive(item.path) ? 'bg-indigo-500/20' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[10px] mt-1 font-medium tracking-wide">{item.label}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Layout;
