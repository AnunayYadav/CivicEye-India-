
import React, { useEffect, useState } from 'react';
import { dataStore } from '../services/store';
import { DashboardStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, CheckCircle2, AlertTriangle, TrendingUp, Zap, Server, ShieldCheck, Database, Loader2, Clock, Star, Users } from 'lucide-react';
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
      name: key.length > 10 ? key.slice(0, 10) + '...' : key,
      fullName: key,
      count: stats.byCategory[key]
   }));

   const pieData = [
      { name: 'Pending', value: stats.pending },
      { name: 'Resolved', value: stats.resolved }
   ];
   const COLORS = ['#ef4444', '#10b981'];

   return (
      <div className="h-full overflow-y-auto bg-[#050505] p-6 md:p-12 pb-32 md:pb-12 custom-scrollbar">
         <div className="max-w-7xl mx-auto space-y-12 mt-12 pb-20">

            {/* Modern Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5">
               <div className="space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400">
                     <Database size={16} />
                     <span className="text-[10px] font-black uppercase tracking-[0.3em]">Protocol Analytics</span>
                  </div>
                  <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">Network Health</h1>
                  <p className="text-white/40 font-medium text-sm">Real-time telemetry and infrastructure diagnostics for the civic grid.</p>
               </div>
               <div className="flex items-center gap-6">
                  <div className="text-right hidden md:block">
                     <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Global Stability</p>
                     <p className="text-xl font-black text-white uppercase italic">98.4% Nominal</p>
                  </div>
                  <div className="flex items-center gap-4 bg-zinc-950/50 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-[24px] shadow-2xl">
                     <div className="w-3 h-3 rounded-full bg-emerald-500 animate-[pulse_2s_infinite] shadow-[0_0_15px_#10b981]" />
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Logic Status</span>
                        <span className="text-xs font-black text-white uppercase tracking-tight">Fully Operational</span>
                     </div>
                  </div>
               </div>
            </header>

            {/* Industrial Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <motion.div
                  whileHover={{ y: -5 }}
                  className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[40px] p-10 relative overflow-hidden group shadow-2xl"
               >
                  <div className="absolute top-0 right-0 p-10 opacity-10 scale-150 rotate-12 group-hover:scale-175 transition-transform duration-1000">
                     <TrendingUp size={160} className="text-white" />
                  </div>
                  <div className="relative z-10 h-full flex flex-col justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/10">
                           <TrendingUp size={24} className="text-white" />
                        </div>
                        <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Signal Influx</span>
                     </div>
                     <div className="mt-16">
                        <p className="text-8xl font-black text-white tracking-tighter line-height-none mb-2">{stats.total}</p>
                        <div className="flex items-center gap-3 py-2 px-4 bg-white/10 rounded-full w-fit">
                           <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                           <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em]">+24% Resolution Spike</p>
                        </div>
                     </div>
                  </div>
               </motion.div>

               <div className="grid grid-cols-1 gap-6 md:col-span-2 lg:col-span-1">
                  <motion.div
                     whileHover={{ y: -5 }}
                     className="bg-zinc-950 border border-white/5 rounded-[32px] p-8 flex flex-col justify-between group relative overflow-hidden shadow-2xl"
                  >
                     <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <AlertTriangle size={80} className="text-red-500" />
                     </div>
                     <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Active Signals</p>
                     <div className="flex items-end justify-between">
                        <p className="text-5xl font-black text-white tracking-tighter">{stats.pending}</p>
                        <div className="text-[11px] font-black text-red-500 uppercase flex items-center gap-1 mb-1">
                           <TrendingUp size={12} /> Priority
                        </div>
                     </div>
                     <div className="h-1.5 w-full bg-zinc-900 rounded-full mt-6 overflow-hidden p-[1px]">
                        <div className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full w-[65%]" />
                     </div>
                  </motion.div>

                  <motion.div
                     whileHover={{ y: -5 }}
                     className="bg-zinc-950 border border-white/5 rounded-[32px] p-8 flex flex-col justify-between group relative overflow-hidden shadow-2xl"
                  >
                     <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <ShieldCheck size={80} className="text-emerald-500" />
                     </div>
                     <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Resolved Units</p>
                     <div className="flex items-end justify-between">
                        <p className="text-5xl font-black text-white tracking-tighter">{stats.resolved}</p>
                     </div>
                     <div className="h-1.5 w-full bg-zinc-900 rounded-full mt-6 overflow-hidden p-[1px]">
                        <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full w-[85%]" />
                     </div>
                  </motion.div>
               </div>

               <div className="bg-zinc-950 border border-white/5 rounded-[32px] p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                           <Clock size={20} />
                        </div>
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AVG Response</span>
                     </div>
                     <div>
                        <p className="text-4xl font-black text-white tracking-tighter uppercase italic">{stats.avgResolutionTime}</p>
                        <p className="text-[10px] text-white/20 font-bold uppercase mt-1 tracking-widest">Deployment to Resolution</p>
                     </div>
                     <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-black text-white/30 uppercase">SLA Complaince</span>
                        <span className="text-[11px] font-black text-emerald-400">92%</span>
                     </div>
                  </div>
               </div>

               {/* Spatial Distribution Map/Chart */}
               <div className="md:col-span-2 lg:col-span-3 bg-zinc-950 border border-white/5 rounded-[40px] p-10 relative shadow-2xl overflow-hidden min-h-[400px]">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                     <div className="flex items-center gap-4">
                        <div className="w-2 h-10 bg-indigo-600 rounded-full" />
                        <div>
                           <h3 className="text-xl font-black text-white tracking-tight uppercase italic">Spectral Load</h3>
                           <p className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em]">Cross-Category Vector Distribution</p>
                        </div>
                     </div>
                     <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
                        {['REAL_TIME', 'HISTORIC', 'PREDICTIVE'].map(t => (
                           <button key={t} className="px-5 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all text-white/40 hover:text-white hover:bg-white/10">{t}</button>
                        ))}
                     </div>
                  </div>
                  <div className="h-64 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} barSize={40}>
                           <CartesianGrid strokeDasharray="16 16" stroke="rgba(255,255,255,0.03)" vertical={false} />
                           <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={9} fontWeight={900} tickLine={false} axisLine={false} dy={15} />
                           <Tooltip
                              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                              contentStyle={{ backgroundColor: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', color: '#fff', fontSize: '10px', fontWeight: 900, padding: '16px 20px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                              itemStyle={{ color: '#6366f1' }}
                           />
                           <Bar dataKey="count" fill="#4f46e5" radius={[14, 14, 14, 14]} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               {/* Efficiency Core - Circular */}
               <div className="lg:col-span-1 bg-zinc-950 border border-white/5 rounded-[40px] p-10 flex flex-col items-center justify-around relative shadow-2xl overflow-hidden group">
                  <div className="absolute inset-0 bg-yellow-500/5 blur-[80px] group-hover:bg-yellow-500/10 transition-colors -z-10" />
                  <div className="text-center">
                     <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-1">Protocol Efficiency</h3>
                     <p className="text-lg font-black text-white uppercase italic tracking-tighter">System Output</p>
                  </div>
                  <div className="w-52 h-52 relative my-10">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie
                              data={pieData}
                              innerRadius={75}
                              outerRadius={95}
                              paddingAngle={10}
                              dataKey="value"
                              stroke="none"
                           >
                              {pieData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={16} />
                              ))}
                           </Pie>
                        </PieChart>
                     </ResponsiveContainer>
                     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <Star size={32} className="text-yellow-400 fill-yellow-400 mb-2 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]" />
                        <span className="text-5xl font-black text-white tracking-tighter italic">{stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%</span>
                     </div>
                  </div>
                  <div className="w-full flex items-center justify-between text-[10px] font-black text-emerald-400/60 uppercase tracking-widest px-4 py-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                     <div className="flex items-center gap-2"><Users size={12} /> {stats.satisfactionRate}% Satisfaction</div>
                  </div>
               </div>

            </div>
         </div>
      </div>
   );
};

export default DashboardPage;