import React, { useEffect, useState } from 'react';
import { dataStore } from '../services/store';
import { DashboardStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Filter, Activity, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const update = () => setStats(dataStore.getStats());
    update();
    dataStore.addEventListener('updated', update);
    return () => dataStore.removeEventListener('updated', update);
  }, []);

  if (!stats) return <div className="p-8 text-white font-mono">INITIALIZING ANALYTICS...</div>;

  const chartData = Object.keys(stats.byCategory).map((key) => ({ name: key.split(' ')[0], count: stats.byCategory[key] }));
  const pieData = [{ name: 'Pending', value: stats.pending }, { name: 'Resolved', value: stats.resolved }];

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-black">
      <div className="flex items-end justify-between mb-10">
        <div>
           <h1 className="text-3xl font-bold text-white tracking-tight">City Pulse</h1>
           <p className="text-slate-500 mt-1">Real-time infrastructure analytics</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
           <span className="text-xs font-mono text-emerald-500">SYSTEM ONLINE</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Reports', value: stats.total, icon: Activity, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Active Issues', value: stats.pending, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-zinc-950/50 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all group">
            <div className="flex items-center justify-between mb-4">
               <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</span>
               <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                 <stat.icon size={18}/>
               </div>
            </div>
            <p className="text-4xl font-bold text-white font-mono">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zinc-950/50 backdrop-blur-md rounded-2xl p-6 border border-white/10">
          <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Reports by Category</h3>
          <div className="h-64 w-full">
            {stats.total === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-600 text-sm">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: '#27272a'}}
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#f8fafc' }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-zinc-950/50 backdrop-blur-md rounded-2xl p-6 border border-white/10">
          <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Efficiency Ratio</h3>
          <div className="h-64 w-full relative">
            {stats.total === 0 ? (
               <div className="h-full flex items-center justify-center text-slate-600 text-sm">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#ef4444" />
                    <Cell fill="#10b981" />
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
            {/* Center Text Overlay */}
            {stats.total > 0 && (
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                     <p className="text-2xl font-bold text-white">{Math.round((stats.resolved / stats.total) * 100) || 0}%</p>
                     <p className="text-[10px] text-slate-500 uppercase">Resolved</p>
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
