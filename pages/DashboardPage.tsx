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
    <div className="h-full overflow-y-auto bg-black p-4 md:p-8 pb-28 md:pb-8 custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mt-12 md:mt-0">
          <div>
             <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-1">Dashboard</h1>
             <p className="text-white/40 font-medium text-sm">Overview of city infrastructure health</p>
          </div>
          <div className="self-start md:self-auto inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e] animate-pulse"></div>
             <span className="text-[10px] font-bold text-white/80 tracking-wide">LIVE UPDATES</span>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Main Stat Card - Large */}
          <div className="md:col-span-2 lg:col-span-2 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                <Activity size={100} className="text-white rotate-12 translate-x-8 -translate-y-8" />
             </div>
             <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                   <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
                      <TrendingUp size={20} className="text-white" />
                   </div>
                   <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Total Reports</span>
                </div>
                <div>
                   <p className="text-5xl font-bold text-white tracking-tighter mb-1">{stats.total}</p>
                   <p className="text-white/40 text-xs font-medium">+12% increase from last week</p>
                </div>
             </div>
             {/* Gradient Glow */}
             <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-600/20 blur-[80px] rounded-full group-hover:bg-indigo-500/30 transition-colors duration-700"></div>
          </div>

          {/* Secondary Stats - Small Squares */}
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[24px] p-5 flex flex-col justify-between relative overflow-hidden group hover:bg-white/5 transition-colors">
             <div className="absolute top-4 right-4 p-2 bg-red-500/10 rounded-lg text-red-400">
                <AlertTriangle size={16} />
             </div>
             <span className="text-xs font-bold text-white/60 uppercase tracking-wider mt-1">Active</span>
             <p className="text-3xl font-bold text-white tracking-tight mt-2">{stats.pending}</p>
             <div className="w-full bg-white/10 h-1 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-red-500 w-[65%] rounded-full"></div>
             </div>
          </div>

          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[24px] p-5 flex flex-col justify-between relative overflow-hidden group hover:bg-white/5 transition-colors">
             <div className="absolute top-4 right-4 p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <CheckCircle2 size={16} />
             </div>
             <span className="text-xs font-bold text-white/60 uppercase tracking-wider mt-1">Resolved</span>
             <p className="text-3xl font-bold text-white tracking-tight mt-2">{stats.resolved}</p>
             <div className="w-full bg-white/10 h-1 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-emerald-500 w-[45%] rounded-full"></div>
             </div>
          </div>

          {/* Chart Section - Wide */}
          <div className="md:col-span-2 lg:col-span-3 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 min-h-[260px] relative">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-white">Issue Categories</h3>
                <div className="flex gap-1.5">
                   {['Day', 'Week', 'Month'].map(t => (
                      <button key={t} className="px-2.5 py-1 text-[10px] font-medium rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-all">{t}</button>
                   ))}
                </div>
             </div>
             <div className="h-48 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData} barSize={32}>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                   <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                   <Tooltip 
                     cursor={{fill: 'rgba(255,255,255,0.05)', radius: 6}}
                     contentStyle={{ backgroundColor: 'rgba(20,20,20,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px', padding: '8px 12px' }}
                     itemStyle={{ color: '#fff' }}
                   />
                   <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 6, 6]} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* Pie Chart - Square */}
          <div className="lg:col-span-1 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 flex flex-col items-center justify-center relative">
             <h3 className="absolute top-6 left-6 text-sm font-bold text-white">Efficiency</h3>
             <div className="w-40 h-40 relative mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={50}
                      outerRadius={65}
                      paddingAngle={6}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(20,20,20,0.8)', border: 'none', borderRadius: '12px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <Zap size={20} className="text-yellow-400 fill-yellow-400 mb-1" />
                   <span className="text-xl font-bold text-white">{stats.total > 0 ? Math.round((stats.resolved/stats.total)*100) : 0}%</span>
                </div>
             </div>
             <p className="text-[10px] text-white/40 font-medium mt-2 uppercase tracking-widest">Resolution Rate</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;