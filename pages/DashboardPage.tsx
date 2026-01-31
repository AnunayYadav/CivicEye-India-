import React, { useEffect, useState } from 'react';
import { dataStore } from '../services/store';
import { DashboardStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, CheckCircle2, AlertTriangle, TrendingUp, Zap } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const update = () => setStats(dataStore.getStats());
    update();
    dataStore.addEventListener('updated', update);
    return () => dataStore.removeEventListener('updated', update);
  }, []);

  if (!stats) return <div className="h-full flex items-center justify-center text-white/30 font-medium tracking-widest text-xs animate-pulse">LOADING ANALYTICS...</div>;

  const chartData = Object.keys(stats.byCategory).map((key) => ({ name: key.split(' ')[0], count: stats.byCategory[key] }));
  const pieData = [{ name: 'Pending', value: stats.pending }, { name: 'Resolved', value: stats.resolved }];
  const COLORS = ['#ef4444', '#10b981'];

  return (
    <div className="h-full overflow-y-auto bg-black p-6 md:p-10 pb-32 md:pb-10 custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
             <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Dashboard</h1>
             <p className="text-white/40 font-medium">Overview of city infrastructure health</p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
             <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse"></div>
             <span className="text-xs font-bold text-white/80 tracking-wide">LIVE UPDATES</span>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Main Stat Card - Large */}
          <div className="md:col-span-2 lg:col-span-2 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                <Activity size={120} className="text-white rotate-12 translate-x-10 -translate-y-10" />
             </div>
             <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                   <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                      <TrendingUp size={24} className="text-white" />
                   </div>
                   <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Total Reports</span>
                </div>
                <div>
                   <p className="text-7xl font-bold text-white tracking-tighter mb-2">{stats.total}</p>
                   <p className="text-white/40 text-sm font-medium">+12% increase from last week</p>
                </div>
             </div>
             {/* Gradient Glow */}
             <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-600/30 blur-[100px] rounded-full group-hover:bg-indigo-500/40 transition-colors duration-700"></div>
          </div>

          {/* Secondary Stats - Small Squares */}
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-6 flex flex-col justify-between relative overflow-hidden group hover:bg-white/5 transition-colors">
             <div className="absolute top-4 right-4 p-2 bg-red-500/20 rounded-xl text-red-400">
                <AlertTriangle size={20} />
             </div>
             <span className="text-sm font-bold text-white/60 uppercase tracking-wider mt-2">Active Issues</span>
             <p className="text-5xl font-bold text-white tracking-tight mt-4">{stats.pending}</p>
             <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-red-500 w-[65%] rounded-full"></div>
             </div>
          </div>

          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-6 flex flex-col justify-between relative overflow-hidden group hover:bg-white/5 transition-colors">
             <div className="absolute top-4 right-4 p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
                <CheckCircle2 size={20} />
             </div>
             <span className="text-sm font-bold text-white/60 uppercase tracking-wider mt-2">Resolved</span>
             <p className="text-5xl font-bold text-white tracking-tight mt-4">{stats.resolved}</p>
             <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-emerald-500 w-[45%] rounded-full"></div>
             </div>
          </div>

          {/* Chart Section - Wide */}
          <div className="md:col-span-2 lg:col-span-3 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 min-h-[300px] relative">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-white">Issue Categories</h3>
                <div className="flex gap-2">
                   {['Day', 'Week', 'Month'].map(t => (
                      <button key={t} className="px-3 py-1 text-xs font-medium rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all">{t}</button>
                   ))}
                </div>
             </div>
             <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData} barSize={40}>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                   <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                   <Tooltip 
                     cursor={{fill: 'rgba(255,255,255,0.05)', radius: 8}}
                     contentStyle={{ backgroundColor: 'rgba(20,20,20,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
                     itemStyle={{ color: '#fff' }}
                   />
                   <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 8, 8]} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* Pie Chart - Square */}
          <div className="lg:col-span-1 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 flex flex-col items-center justify-center relative">
             <h3 className="absolute top-8 left-8 text-lg font-bold text-white">Efficiency</h3>
             <div className="w-48 h-48 relative mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(20,20,20,0.8)', border: 'none', borderRadius: '12px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <Zap size={24} className="text-yellow-400 fill-yellow-400 mb-1" />
                   <span className="text-2xl font-bold text-white">{stats.total > 0 ? Math.round((stats.resolved/stats.total)*100) : 0}%</span>
                </div>
             </div>
             <p className="text-xs text-white/40 font-medium mt-4 uppercase tracking-widest">Resolution Rate</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;