
import React, { useState, useEffect } from 'react';
import { dataStore, userStore } from '../services/store';
import { Problem, ProblemStatus, UserRole, Department, ProblemCategory } from '../types';
import {
    Shield, Filter, Search, ChevronRight, Clock, MapPin,
    MessageSquare, User as UserIcon, CheckCircle2, XCircle,
    AlertCircle, ArrowRight, BarChart3, Database, MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPage: React.FC = () => {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [filter, setFilter] = useState<ProblemStatus | 'ALL'>('ALL');
    const [search, setSearch] = useState('');
    const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
    const user = userStore.getCurrentUser();

    useEffect(() => {
        const update = () => setProblems(dataStore.getProblems());
        update();
        dataStore.addEventListener('updated', update);
        return () => dataStore.removeEventListener('updated', update);
    }, []);

    if (user.role === UserRole.CITIZEN) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-black p-8 text-center">
                <Shield size={64} className="text-red-500/20 mb-6" />
                <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Access Restriction</h1>
                <p className="text-white/40 text-sm max-w-xs">Your current protocol level (CITIZEN) does not allow access to the Central Authority Console.</p>
            </div>
        );
    }

    const filtered = problems.filter(p => {
        const matchesFilter = filter === 'ALL' || p.status === filter;
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search);
        return matchesFilter && matchesSearch;
    });

    const getStatusStyle = (status: ProblemStatus) => {
        switch (status) {
            case ProblemStatus.RESOLVED: return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case ProblemStatus.REJECTED: return 'bg-red-500/10 text-red-500 border-red-500/20';
            case ProblemStatus.IN_PROGRESS: return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
            default: return 'bg-zinc-800 text-white/40 border-white/5';
        }
    };

    const updateStatus = (id: string, status: ProblemStatus, note: string) => {
        dataStore.updateProblem(id, { status }, user.name, note);
    };

    const assignDepartment = (id: string, dept: Department) => {
        dataStore.updateProblem(id, { department: dept, status: ProblemStatus.ASSIGNED }, user.name, `Assigned to ${dept} department.`);
    };

    return (
        <div className="h-full flex flex-col bg-[#050505] overflow-hidden">

            {/* Admin Header */}
            <header className="p-8 pb-4 border-b border-white/5 mt-12 md:mt-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-emerald-500 mb-1">
                            <Shield size={14} />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Authority Console</span>
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Central Dispatch</h1>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="bg-zinc-950 border border-white/10 rounded-2xl flex items-center px-4 py-2 focus-within:ring-2 ring-indigo-500/50 transition-all">
                            <Search size={16} className="text-white/20 mr-3" />
                            <input
                                type="text"
                                placeholder="Search ID/Subject..."
                                className="bg-transparent border-none outline-none text-xs font-bold text-white placeholder-white/10 w-40"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <select
                            className="bg-zinc-950 border border-white/10 rounded-2xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/60 outline-none"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                        >
                            <option value="ALL">All Signals</option>
                            {Object.values(ProblemStatus).map(s => (
                                <option key={s} value={s}>{s.replace('_', ' ')}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* List Section */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 custom-scrollbar">
                    <div className="flex items-center justify-between px-2 mb-4">
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{filtered.length} INCIDENTS LOGGED</span>
                        <div className="flex items-center gap-4 text-[10px] font-black text-white/40 uppercase">
                            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> CRITICAL</span>
                            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> ACTIVE</span>
                        </div>
                    </div>

                    {filtered.map(problem => (
                        <motion.div
                            layoutId={problem.id}
                            key={problem.id}
                            onClick={() => setSelectedProblem(problem)}
                            className={`group cursor-pointer p-5 rounded-3xl border transition-all hover:scale-[1.01] active:scale-[0.99] ${selectedProblem?.id === problem.id
                                    ? 'bg-white text-black border-white'
                                    : 'bg-zinc-950/50 border-white/5 hover:border-white/20'
                                }`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${selectedProblem?.id === problem.id ? 'bg-black/10 border-black/10 text-black/60' : getStatusStyle(problem.status)
                                            }`}>
                                            {problem.status}
                                        </span>
                                        <span className="text-[10px] font-mono text-white/20 uppercase">ID: {problem.id}</span>
                                    </div>
                                    <h3 className="text-sm md:text-base font-black truncate">{problem.title}</h3>
                                    <div className={`flex items-center gap-4 text-[10px] font-bold ${selectedProblem?.id === problem.id ? 'text-black/40' : 'text-white/20'}`}>
                                        <div className="flex items-center gap-1"><MapPin size={10} /> {problem.address?.split(',')[0]}</div>
                                        <div className="flex items-center gap-1"><Clock size={10} /> {new Date(problem.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className={`w-12 h-12 rounded-2xl overflow-hidden shrink-0 border-2 ${selectedProblem?.id === problem.id ? 'border-black/5' : 'border-white/5'}`}>
                                    <img src={problem.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Details Panel - Tablet/Desktop only or Overlay */}
                <AnimatePresence>
                    {selectedProblem && (
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="w-full md:w-[450px] lg:w-[500px] border-l border-white/10 bg-zinc-950 p-8 overflow-y-auto custom-scrollbar z-50 absolute right-0 top-0 h-full md:relative"
                        >
                            <button onClick={() => setSelectedProblem(null)} className="md:hidden absolute top-8 right-8 text-white/40"><XCircle size={24} /></button>

                            <div className="space-y-8">
                                <section className="space-y-4">
                                    <div className="h-48 rounded-[32px] overflow-hidden border border-white/5">
                                        <img src={selectedProblem.imageUrl} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 text-indigo-400 mb-2">
                                            <Database size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{selectedProblem.category}</span>
                                        </div>
                                        <h2 className="text-2xl font-black text-white leading-tight">{selectedProblem.title}</h2>
                                        <p className="text-sm text-white/40 mt-3 leading-relaxed">{selectedProblem.description}</p>
                                    </div>
                                </section>

                                {/* Action Matrix */}
                                <section className="space-y-4 pt-6 border-t border-white/5">
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Protocol Actions</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => updateStatus(selectedProblem.id, ProblemStatus.IN_PROGRESS, 'Work initiated by authority.')}
                                            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all group"
                                        >
                                            <ArrowRight className="mb-2 group-hover:translate-x-1 transition-transform" size={20} />
                                            <span className="text-[9px] font-black uppercase tracking-tighter">Engage Ops</span>
                                        </button>
                                        <button
                                            onClick={() => updateStatus(selectedProblem.id, ProblemStatus.RESOLVED, 'Resolution verified and closed.')}
                                            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all group"
                                        >
                                            <CheckCircle2 className="mb-2 group-hover:scale-110 transition-transform" size={20} />
                                            <span className="text-[9px] font-black uppercase tracking-tighter">Resolve Unit</span>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="relative group">
                                            <select
                                                className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 text-xs font-bold text-white outline-none appearance-none"
                                                onChange={(e) => assignDepartment(selectedProblem.id, e.target.value as Department)}
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Assign to Department...</option>
                                                {Object.values(Department).map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                            <MoreVertical size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                                        </div>
                                        <button
                                            onClick={() => updateStatus(selectedProblem.id, ProblemStatus.REJECTED, 'Incident flagged as invalid/duplicate.')}
                                            className="w-full p-4 rounded-2xl bg-red-500/5 text-red-500/40 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
                                        >
                                            Terminate Incident
                                        </button>
                                    </div>
                                </section>

                                {/* Timeline (Spatial History) */}
                                <section className="space-y-4 pt-6 border-t border-white/5 pb-12">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Spatial History</p>
                                        <Clock size={12} className="text-white/10" />
                                    </div>
                                    <div className="space-y-6 relative ml-2">
                                        {/* Line */}
                                        <div className="absolute left-1.5 top-2 bottom-2 w-[1px] bg-white/5" />

                                        {selectedProblem.timeline.map((event, i) => (
                                            <div key={event.id} className="relative pl-6">
                                                <div className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 border-zinc-950 ${i === selectedProblem.timeline.length - 1 ? 'bg-indigo-500 shadow-[0_0_8px_#6366f1]' : 'bg-zinc-800'
                                                    }`} />
                                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tight text-white/20 mb-1">
                                                    <span>{event.status}</span>
                                                    <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                                                </div>
                                                <p className="text-[11px] font-bold text-white mb-0.5">{event.user}</p>
                                                <p className="text-[10px] text-white/40 leading-relaxed font-medium">{event.note}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Super Admin Analytics Widget */}
            {user.role === UserRole.SUPER_ADMIN && (
                <div className="bg-indigo-600 p-3 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                        <BarChart3 size={14} className="text-white/60" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Grid Efficiency: 94.2%</span>
                    </div>
                    <div className="h-4 w-[1px] bg-white/20" />
                    <div className="flex items-center gap-2">
                        <UserIcon size={14} className="text-white/60" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Active Admins: 12 Online</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;
