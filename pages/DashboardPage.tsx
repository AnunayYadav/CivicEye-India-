import React, { useEffect, useState } from 'react';
import { dataStore } from '../services/store';
import { DashboardStats, ProblemCategory } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CheckCircle, Clock, AlertTriangle, Filter } from 'lucide-react';

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#64748b'];

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const updateStats = () => {
      setStats(dataStore.getStats());
    };
    updateStats();
    
    dataStore.addEventListener('updated', updateStats);
    return () => dataStore.removeEventListener('updated', updateStats);
  }, []);

  if (!stats) return <div className="p-8 text-white">Loading stats...</div>;

  const chartData = Object.keys(stats.byCategory).map((key) => ({
    name: key.split(' ')[0], // Shorten name for chart
    count: stats.byCategory[key]
  }));

  const pieData = [
    { name: 'Pending', value: stats.pending },
    { name: 'Resolved', value: stats.resolved },
  ];

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Civic Overview</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition">
           <Filter size={16} /> Filter
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
          <div className="flex items-center justify-between mb-4">
             <span className="text-slate-400 text-sm font-medium">Total Reports</span>
             <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><Filter size={20}/></div>
          </div>
          <p className="text-4xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
             +12% from last month
          </p>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
           <div className="flex items-center justify-between mb-4">
             <span className="text-slate-400 text-sm font-medium">Pending Issues</span>
             <div className="p-2 bg-orange-500/20 text-orange-400 rounded-lg"><Clock size={20}/></div>
          </div>
          <p className="text-4xl font-bold text-white">{stats.pending}</p>
          <p className="text-xs text-slate-500 mt-2">Requires immediate attention</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
           <div className="flex items-center justify-between mb-4">
             <span className="text-slate-400 text-sm font-medium">Resolved</span>
             <div className="p-2 bg-green-500/20 text-green-400 rounded-lg"><CheckCircle size={20}/></div>
          </div>
          <p className="text-4xl font-bold text-white">{stats.resolved}</p>
          <p className="text-xs text-green-400 mt-2">Great progress!</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Bar Chart */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6">Problems by Category</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#f1f5f9' }}
                  itemStyle={{ color: '#f1f5f9' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6">Resolution Ratio</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell key="cell-pending" fill="#ef4444" />
                  <Cell key="cell-resolved" fill="#10b981" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#f1f5f9' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-slate-300">Pending</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-slate-300">Resolved</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
