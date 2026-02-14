
import React, { useEffect, useState } from 'react';
import { dataStore } from '../services/store';
import { DashboardStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, CheckCircle2, AlertTriangle, TrendingUp, Zap, Database, Loader2, Clock, Star, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardPage: React.FC = () => {
   const [stats, setStats] = useState<DashboardStats | null>(null);

   useEffect(() => {
      const update = () => setStats(dataStore.getStats());
      update();
      dataStore.addEventListener('updated', update);
      return () => dataStore.removeEventListener('updated', update);
   }, []);

   if (!stats) return (
      <div className="h-full flex items-center justify-center bg-black">
         <Loader2 className="animate-spin text-white/20" size={24} />
      </div>
   );

   const chartData = Object.keys(stats.byCategory).map((key) => ({
      name: key.length > 8 ? key.slice(0, 8) + '..' : key,
      count: stats.byCategory[key]
   }));

   const pieData = [{ name: 'Pending', value: stats.pending }, { name: 'Resolved', value: stats.resolved }];
   const COLORS = ['#ef4444', '#10b981'];

   return (
      <div className="h-full overflow-y-auto bg-black p-4 md:p-10 pb-32 custom-scrollbar">
         <div className="max-w-6xl mx-auto space-y-6 mt-6">

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/5">
               <div>
                  <div className="flex items-center gap-2 mb-1 text-indigo-400">
                     <Database size={14} />
                     <span className="text-[9px] font-black uppercase tracking-widest">Analytics Interface</span>
                  </div>
                  <h1 className="text-2xl font-black uppercase italic text-white tracking-tighter">Diagnostic Overlay</h1>
               </div>
               <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-xl border border-white/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-white/60">SYSTEM_NOMINAL</span>
               </div>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
               {/* Totals */}
               <div className="col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
                  <TrendingUp size={60} className="absolute top-0 right-0 opacity-10" />
                  <p className="text-[10px] font-black text-white/40 uppercase mb-4">Global Signal Count</p>
                  <p className="text-5xl font-black text-white italic">{stats.total}</p>
               </div>

               <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5">
                  <p className="text-[9px] font-black text-white/20 uppercase mb-2">Anomalies</p>
                  <p className="text-2xl font-black text-red-500 italic">{stats.pending}</p>
                  <div className="w-full bg-white/5 h-1 rounded-full mt-3"><div className="bg-red-500 h-full rounded-full w-[60%]" /></div>
               </div>

               <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5">
                  <p className="text-[9px] font-black text-white/20 uppercase mb-2">Resolutions</p>
                  <p className="text-2xl font-black text-emerald-500 italic">{stats.resolved}</p>
                  <div className="w-full bg-white/5 h-1 rounded-full mt-3"><div className="bg-emerald-500 h-full rounded-full w-[80%]" /></div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
               {/* Spectral Chart */}
               <div className="lg:col-span-2 bg-zinc-900/50 border border-white/5 rounded-2xl p-6 h-64 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                     <span className="text-[10px] font-black text-white/40 uppercase">Load Distribution</span>
                     <div className="flex gap-1">
                        {['24H', '7D'].map(t => <button key={t} className="px-2 py-1 text-[8px] font-black text-white/20 hover:text-white transition-all bg-white/5 rounded-md">{t}</button>)}
                     </div>
                  </div>
                  <ResponsiveContainer width="100%" height="80%">
                     <BarChart data={chartData}>
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.1)" fontSize={8} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: '#000', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }} />
                        <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 4, 4]} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>

               {/* Efficiency */}
               <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center relative shadow-xl">
                  <span className="absolute top-4 left-4 text-[9px] font-black text-white/20 uppercase">Core Efficiency</span>
                  <div className="w-32 h-32 relative">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie data={pieData} innerRadius={35} outerRadius={45} paddingAngle={5} dataKey="value" stroke="none">
                              {pieData.map((e, i) => <Cell key={i} fill={COLORS[i]} />)}
                           </Pie>
                        </PieChart>
                     </ResponsiveContainer>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-white italic">{stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%</span>
                     </div>
                  </div>
                  <div className="mt-4 flex gap-4 text-[8px] font-black text-white/30 uppercase">
                     <span className="flex items-center gap-1"><Clock size={10} /> {stats.avgResolutionTime}</span>
                     <span className="flex items-center gap-1"><Users size={10} /> {stats.satisfactionRate}%</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default DashboardPage;