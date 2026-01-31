import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Map, PlusCircle, LayoutDashboard, Menu, X, Globe } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Live Map', icon: <Map size={20} /> },
    { path: '/report', label: 'Report', icon: <PlusCircle size={20} /> },
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen w-full bg-slate-900 text-slate-100 overflow-hidden">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-700 bg-slate-800 z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-700">
          <Globe className="text-blue-500" size={28} />
          <h1 className="text-xl font-bold tracking-tight text-white">CivicEye</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.path) 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
              JD
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">John Doe</p>
              <p className="text-xs text-slate-400">Citizen</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-slate-800/90 backdrop-blur-md flex items-center justify-between px-4 border-b border-slate-700 z-30 absolute top-0 w-full">
          <div className="flex items-center gap-2">
            <Globe className="text-blue-500" size={24} />
            <h1 className="text-lg font-bold text-white">CivicEye</h1>
          </div>
          {/* Mobile menu toggle could go here if we had more secondary links */}
        </header>

        {/* Content Render */}
        <div className="flex-1 h-full w-full relative pt-16 md:pt-0 overflow-hidden">
          {children}
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden h-16 bg-slate-800 border-t border-slate-700 flex justify-around items-center z-30">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive(item.path) ? 'text-blue-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.icon}
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Layout;
