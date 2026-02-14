
import React, { useEffect, useState } from 'react';
import { dataStore } from '../services/store';
import { DashboardStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, CheckCircle2, AlertTriangle, TrendingUp, Zap, Database, Loader2, Clock, Star, Users, Brain, MessageSquare } from 'lucide-react';
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
               {/* Smart City Score */}
               <div className="col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl group">
                  <motion.div
                     animate={{ rotate: 360 }}
                     transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                     className="absolute -top-10 -right-10 opacity-10"
                  >
                     <Zap size={140} />
                  </motion.div>
                  <div className="relative z-10">
                     <p className="text-[10px] font-black text-white/40 uppercase mb-1 tracking-widest">Smart City Index</p>
                     <div className="flex items-baseline gap-2">
                        <p className="text-6xl font-black text-white italic tracking-tighter">{stats.cityScore}</p>
                        <span className="text-xl font-bold text-white/20">/100</span>
                     </div>
                     <div className="mt-4 flex items-center gap-2">
                        <div className="px-2 py-1 bg-white/10 rounded-lg text-[8px] font-black text-white uppercase tracking-tighter border border-white/5">
                           Real-time Sync
                        </div>
                        <p className="text-[10px] text-white/60 font-bold italic">+2.4 pts from last week</p>
                     </div>
                  </div>
               </div>

               <div className="bg-zinc-950 border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
                  <div>
                     <p className="text-[9px] font-black text-white/20 uppercase mb-2 tracking-widest">Global Signals</p>
                     <p className="text-3xl font-black text-white italic">{stats.total}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                     <Activity size={12} className="text-indigo-500" />
                     <span className="text-[8px] font-bold text-white/40 uppercase tracking-tighter">Diagnostic Vol: Normal</span>
                  </div>
               </div>

               <div className="bg-zinc-950 border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
                  <div>
                     <p className="text-[9px] font-black text-white/20 uppercase mb-2 tracking-widest">Resolutions</p>
                     <p className="text-3xl font-black text-emerald-500 italic">{stats.resolved}</p>
                  </div>
                  <button className="w-full mt-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[9px] font-black uppercase text-white/40 hover:text-white transition-all">
                     Export CSV
                  </button>
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
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* AI Sentiment Analysis */}
                  <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Brain size={120} />
                     </div>
                     <div className="relative z-10">
                        <h3 className="text-[10px] font-black uppercase text-white/40 tracking-[0.3em] mb-6 flex items-center gap-2">
                           <MessageSquare size={14} className="text-purple-400" /> Civic Sentiment Analysis
                        </h3>
                        <div className="space-y-6">
                           <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white/60">Community Satisfaction</span>
                              <span className="text-sm font-black text-emerald-400 italic">POSITIVE (82%)</span>
                           </div>
                           <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                              <div className="bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 h-full w-[82%] relative">
                                 <div className="absolute right-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_white]" />
                              </div>
                           </div>
                           <p className="text-[10px] text-white/30 leading-relaxed italic">
                              "AI analysis of 1.2k comments indicates strong community support for recent road repairs in Sector 4, while detecting rising frustration regarding sanitation delays in Northern zones."
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Predictive Insights */}
                  <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 flex flex-col justify-between">
                     <div>
                        <h3 className="text-[10px] font-black uppercase text-white/40 tracking-[0.3em] mb-6 flex items-center gap-2">
                           <TrendingUp size={14} className="text-orange-400" /> AI Resource Optimization
                        </h3>
                        <div className="space-y-4">
                           {[
                              { label: 'Sanitation Load', val: '+12%', color: 'text-orange-400' },
                              { label: 'Water Supply Efficiency', val: '+4.2 pts', color: 'text-emerald-400' },
                              { label: 'Avg. Triage Speed', val: '-1.4h', color: 'text-indigo-400' }
                           ].map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                 <span className="text-[10px] font-bold text-white/40 uppercase">{item.label}</span>
                                 <span className={`text-xs font-black italic ${item.color}`}>{item.val}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                     <div className="mt-8 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">AI Recommendation</p>
                        <p className="text-[10px] text-white/60">Shift priority resources to Water Leaks protocol; detection rate is surfacing 3 potential major bursts.</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default DashboardPage;