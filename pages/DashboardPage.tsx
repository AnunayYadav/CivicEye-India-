
import React, { useEffect, useState } from 'react';
import { dataStore } from '../services/store';
import { DashboardStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, CheckCircle2, AlertTriangle, TrendingUp, Zap, Server, ShieldCheck, Database } from 'lucide-react';
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
      <div className="h-full flex flex-col items-center justify-center bg-black">
         <Loader2 className="animate-spin text-white mb-4" />
         <div className="text-white/30 font-bold tracking-widest text-[10px] uppercase">Retrieving System Analytics...</div>
      </div>
   );

   const chartData = Object.keys(stats.byCategory).map((key) => ({
      name: key.split(' ')[0],
      count: stats.byCategory[key]
   }));
   const pieData = [
      { name: 'Pending', value: stats.pending },
      { name: 'Resolved', value: stats.resolved }
   ];
   const COLORS = ['#ef4444', '#10b981'];

   return (
      <div className="h-full overflow-y-auto bg-[#050505] p-6 md:p-12 pb-32 md:pb-12 custom-scrollbar">
         <div className="max-w-7xl mx-auto space-y-10 mt-12">

            {/* Modern Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
               <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-2 text-indigo-400">
                     <Database size={16} />
                     <span className="text-[10px] font-black uppercase tracking-[0.3em]">Protocol Analytics</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Network Health</h1>
                  <p className="text-white/40 font-medium text-sm">Real-time telemetry and infrastructure diagnostics.</p>
               </div>
               <div className="flex items-center gap-4 bg-zinc-950/50 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-2xl">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_2s_infinite] shadow-[0_0_12px_#10b981]" />
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">System Status</span>
                     <span className="text-xs font-bold text-white uppercase">Operational</span>
                  </div>
               </div>
            </header>

            {/* Dynamic Industrial Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

               {/* Main Traffic Card */}
               <motion.div
                  whileHover={{ y: -5 }}
                  className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[32px] p-8 relative overflow-hidden group shadow-2xl shadow-indigo-600/20"
               >
                  <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 rotate-12 group-hover:scale-175 transition-transform duration-1000">
                     <TrendingUp size={160} className="text-white" />
                  </div>
                  <div className="relative z-10 flex flex-col justify-between h-full">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/10 rounded-xl backdrop-blur-md flex items-center justify-center border border-white/10">
                           <TrendingUp size={22} className="text-white" />
                        </div>
                        <span className="text-xs font-black text-white/60 uppercase tracking-widest">Signal Density</span>
                     </div>
                     <div className="mt-12">
                        <p className="text-7xl font-black text-white tracking-tighter mb-2">{stats.total}</p>
                        <div className="flex items-center gap-2 py-1 px-3 bg-white/10 rounded-full w-fit">
                           <TrendingUp size={14} className="text-emerald-400" />
                           <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">+2.4k This Cycle</p>
                        </div>
                     </div>
                  </div>
               </motion.div>

               {/* Critical Interruptions Card */}
               <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-zinc-950 border border-white/5 rounded-[32px] p-8 flex flex-col justify-between group relative overflow-hidden shadow-2xl transition-colors hover:border-red-500/30"
               >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                     <AlertTriangle size={80} className="text-red-500" />
                  </div>
                  <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6 border border-red-500/10">
                     <Activity size={24} />
                  </div>
                  <div>
                     <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1 block">Active Anomalies</span>
                     <p className="text-4xl font-black text-white tracking-tight">{stats.pending}</p>
                     <div className="h-1.5 w-full bg-zinc-900 rounded-full mt-4 overflow-hidden p-[1px]">
                        <div className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full w-[65%]" />
                     </div>
                  </div>
               </motion.div>

               {/* Secure Resolutions Card */}
               <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-zinc-950 border border-white/5 rounded-[32px] p-8 flex flex-col justify-between group relative overflow-hidden shadow-2xl transition-colors hover:border-emerald-500/30"
               >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                     <CheckCircle2 size={80} className="text-emerald-500" />
                  </div>
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 border border-emerald-500/10">
                     <ShieldCheck size={24} />
                  </div>
                  <div>
                     <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1 block">Data Resolved</span>
                     <p className="text-4xl font-black text-white tracking-tight">{stats.resolved}</p>
                     <div className="h-1.5 w-full bg-zinc-900 rounded-full mt-4 overflow-hidden p-[1px]">
                        <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full w-[45%]" />
                     </div>
                  </div>
               </motion.div>

               {/* Heat Gradient Distribution Chart */}
               <div className="md:col-span-2 lg:col-span-3 bg-zinc-950 border border-white/5 rounded-[32px] p-10 relative shadow-2xl overflow-hidden min-h-[350px]">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                     <div className="flex items-center gap-3">
                        <div className="w-1 h-8 bg-indigo-500 rounded-full" />
                        <div>
                           <h3 className="text-lg font-black text-white tracking-tight uppercase">Spectral Distribution</h3>
                           <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Cross-category signal analysis</p>
                        </div>
                     </div>
                     <div className="flex bg-white/5 p-1 rounded-xl">
                        {['24h', '7d', '30d'].map(t => (
                           <button key={t} className="px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all text-white/40 hover:text-white hover:bg-white/5 active:bg-white/10">{t}</button>
                        ))}
                     </div>
                  </div>
                  <div className="h-64 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} barSize={40}>
                           <CartesianGrid strokeDasharray="10 10" stroke="rgba(255,255,255,0.03)" vertical={false} />
                           <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={9} fontWeight={900} tickLine={false} axisLine={false} dy={15} />
                           <Tooltip
                              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                              contentStyle={{ backgroundColor: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', color: '#fff', fontSize: '10px', fontWeight: 900, padding: '12px 16px' }}
                              itemStyle={{ color: '#6366f1' }}
                           />
                           <Bar dataKey="count" fill="#4f46e5" radius={[12, 12, 12, 12]} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               {/* Efficiency Core - Circular */}
               <div className="lg:col-span-1 bg-zinc-950 border border-white/5 rounded-[32px] p-10 flex flex-col items-center justify-around relative shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-yellow-500/5 blur-[60px] translate-y-20 -z-10" />
                  <div className="text-center">
                     <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Process Velocity</h3>
                     <p className="text-sm font-black text-white uppercase tracking-tight">Core Efficiency</p>
                  </div>
                  <div className="w-48 h-48 relative my-8">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie
                              data={pieData}
                              innerRadius={65}
                              outerRadius={85}
                              paddingAngle={8}
                              dataKey="value"
                              stroke="none"
                           >
                              {pieData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={12} />
                              ))}
                           </Pie>
                        </PieChart>
                     </ResponsiveContainer>
                     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <Zap size={28} className="text-yellow-400 fill-yellow-400 mb-2 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                        <span className="text-4xl font-black text-white tracking-tighter">{stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%</span>
                     </div>
                  </div>
                  <div className="w-full flex justify-between items-center text-[9px] font-black text-white/20 uppercase tracking-widest px-2">
                     <span>Latency: 42ms</span>
                     <span>Throughput: High</span>
                  </div>
               </div>

            </div>
         </div>
      </div>
   );
};

export default DashboardPage;