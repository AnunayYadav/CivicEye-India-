import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Map, Plus, LayoutGrid, Globe } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Map', icon: <Map size={20} strokeWidth={2} /> },
    { path: '/report', label: 'Report', icon: <Plus size={22} strokeWidth={2.5} /> },
    { path: '/dashboard', label: 'Stats', icon: <LayoutGrid size={20} strokeWidth={2} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen w-full bg-black text-white overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* Desktop Sidebar - Compact & Minimalist */}
      <aside className="hidden md:flex flex-col w-20 lg:w-64 bg-black border-r border-white/5 py-6 px-3 z-20 transition-all duration-300">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 overflow-hidden shrink-0">
            <Globe size={20} />
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl"></div>
          </div>
          <div className="hidden lg:block">
            <h1 className="text-lg font-bold tracking-tight">CivicEye</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">India</p>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive(item.path) 
                  ? 'bg-white/10 text-white shadow-inner' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className={`transition-transform duration-200 ${isActive(item.path) ? 'scale-105' : 'group-hover:scale-105'}`}>
                {item.icon}
              </div>
              <span className="hidden lg:block font-medium text-sm tracking-wide">{item.label}</span>
              {isActive(item.path) && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)] hidden lg:block"></div>}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-[1.5px] shrink-0">
               <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">JD</span>
               </div>
            </div>
            <div className="hidden lg:block overflow-hidden">
              <p className="text-xs font-bold truncate">John Doe</p>
              <p className="text-[10px] text-white/40 truncate">Citizen Lvl 4</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-full w-full bg-black overflow-hidden">
        {/* Mobile Header - Compact */}
        <header className="md:hidden absolute top-0 left-0 w-full z-30 px-4 py-4 pointer-events-none">
          <div className="flex items-center justify-between pointer-events-auto">
             <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-full shadow-lg">
                <Globe className="text-indigo-500" size={16} />
                <span className="text-xs font-bold tracking-tight">CivicEye</span>
             </div>
             <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-[9px] font-bold ring-2 ring-black/50 shadow-lg">
                JD
             </div>
          </div>
        </header>

        {/* Content Render */}
        <div className="flex-1 h-full w-full relative">
          {children}
        </div>

        {/* Mobile Bottom Navigation - Compact Dynamic Island */}
        <div className="md:hidden absolute bottom-6 left-0 w-full flex justify-center z-50 px-4 pointer-events-none">
          <div className="flex items-center gap-1 bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-[24px] p-1.5 shadow-2xl pointer-events-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 ${
                  isActive(item.path) 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                    : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.icon}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;