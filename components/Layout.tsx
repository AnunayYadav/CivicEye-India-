import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Map, Plus, LayoutGrid, Globe } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Map', icon: <Map size={22} strokeWidth={2} /> },
    { path: '/report', label: 'Report', icon: <Plus size={24} strokeWidth={2.5} /> },
    { path: '/dashboard', label: 'Stats', icon: <LayoutGrid size={22} strokeWidth={2} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen w-full bg-black text-white overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* Desktop Sidebar - Minimalist Glass */}
      <aside className="hidden md:flex flex-col w-24 lg:w-72 bg-black border-r border-white/5 pt-8 pb-6 px-4 z-20 transition-all duration-300">
        <div className="flex items-center gap-4 px-2 mb-10">
          <div className="relative w-10 h-10 flex items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 overflow-hidden">
            <Globe size={24} />
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl"></div>
          </div>
          <div className="hidden lg:block">
            <h1 className="text-xl font-bold tracking-tight">CivicEye</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">India</p>
          </div>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-3 py-3 rounded-2xl transition-all duration-300 group ${
                isActive(item.path) 
                  ? 'bg-white/10 text-white shadow-inner' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className={`p-1 transition-transform duration-300 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </div>
              <span className="hidden lg:block font-medium tracking-wide">{item.label}</span>
              {isActive(item.path) && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)] hidden lg:block"></div>}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-[2px]">
               <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                  <span className="text-xs font-bold text-white">JD</span>
               </div>
            </div>
            <div className="hidden lg:block overflow-hidden">
              <p className="text-sm font-bold truncate">John Doe</p>
              <p className="text-xs text-white/40 truncate">Citizen Lvl 4</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-full w-full bg-black overflow-hidden">
        {/* Mobile Header - Transparent and floating */}
        <header className="md:hidden absolute top-0 left-0 w-full z-30 px-6 py-6 pointer-events-none">
          <div className="flex items-center justify-between pointer-events-auto">
             <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full">
                <Globe className="text-indigo-500" size={18} />
                <span className="text-sm font-bold tracking-tight">CivicEye</span>
             </div>
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold ring-2 ring-black/50">
                JD
             </div>
          </div>
        </header>

        {/* Content Render */}
        <div className="flex-1 h-full w-full relative">
          {children}
        </div>

        {/* Mobile Bottom Navigation - Floating Dynamic Island */}
        <div className="md:hidden absolute bottom-8 left-0 w-full flex justify-center z-50 px-4 pointer-events-none">
          <div className="flex items-center gap-1 bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-2 shadow-2xl pointer-events-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${
                  isActive(item.path) 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-110 -translate-y-2' 
                    : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.icon}
                {isActive(item.path) && (
                   <span className="absolute -bottom-6 text-[10px] font-bold text-white tracking-wide opacity-0 animate-in fade-in slide-in-from-bottom-2 fill-mode-forwards duration-300">
                     {item.label}
                   </span>
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