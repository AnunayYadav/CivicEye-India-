import React, { useState, useEffect } from 'react';
import { dataStore, userStore } from '../services/store';
import { Problem, ProblemStatus, UserRole, Department } from '../types';
import {
    Shield, Search, Clock, MapPin, CheckCircle2,
    ArrowRight, Database, X, Filter, Truck, HardHat,
    Droplet, Trash2, Zap, AlertCircle, Activity,
    MessageSquare, ExternalLink, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPage: React.FC = () => {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [search, setSearch] = useState('');
    const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
    const [activeTab, setActiveTab] = useState<'PENDING' | 'ACTIVE' | 'RESOLVED'>('PENDING');
    const user = userStore.getCurrentUser();

    useEffect(() => {
        const update = () => setProblems(dataStore.getProblems());
        update();
        dataStore.addEventListener('updated', update);
        return () => dataStore.removeEventListener('updated', update);
    }, []);

    if (user.role === UserRole.CITIZEN) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-black gap-6 p-10 text-center">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 animate-pulse border border-red-500/20">
                    <Shield size={40} />
                </div>
                <div className="space-y-2">
                    <h1 className="text-xl font-black text-white uppercase italic tracking-tighter">Restriction Protocol Active</h1>
                    <p className="text-xs text-white/40 font-medium max-w-xs">Your credentials do not meet the security clearance for the Authority Mission Control interface.</p>
                </div>
                <button className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full">Request Clearance</button>
            </div>
        );
    }

    const stats = {
        unassigned: problems.filter(p => p.status === ProblemStatus.SUBMITTED).length,
        inProgress: problems.filter(p => p.status === ProblemStatus.IN_PROGRESS).length,
        critical: problems.filter(p => p.urgency === 'HIGH' && p.status !== ProblemStatus.RESOLVED).length,
        validationWait: problems.filter(p => p.validationCount < 5).length
    };

    const filtered = problems.filter(p => {
        const matchesTab =
            activeTab === 'PENDING' ? [ProblemStatus.SUBMITTED, ProblemStatus.UNDER_REVIEW].includes(p.status) :
                activeTab === 'ACTIVE' ? [ProblemStatus.ASSIGNED, ProblemStatus.IN_PROGRESS].includes(p.status) :
                    [ProblemStatus.RESOLVED, ProblemStatus.CLOSED].includes(p.status);

        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search);
        return matchesTab && matchesSearch;
    });

    const getDeptIcon = (dept?: Department) => {
        switch (dept) {
            case Department.SANITATION: return <Trash2 size={14} />;
            case Department.ROADS_TRANSPORT: return <Truck size={14} />;
            case Department.WATER_SUPPLY: return <Droplet size={14} />;
            case Department.ELECTRICITY: return <Zap size={14} />;
            default: return <HardHat size={14} />;
        }
    };

    return (
        <div className="h-full flex flex-col bg-black overflow-hidden font-sans">
            {/* Mission Control Header */}
            <header className="px-8 py-6 border-b border-white/5 bg-zinc-950/50 backdrop-blur-3xl flex items-center justify-between mt-10 md:mt-0 z-30">
                <div className="flex items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1 text-indigo-400">
                            <Shield size={14} />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Authority Control</span>
                        </div>
                        <h1 className="text-3xl font-black uppercase italic text-white tracking-tighter">Mission Control</h1>
                    </div>

                    <div className="hidden lg:flex items-center gap-4 border-l border-white/10 pl-6 ml-2">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-white/20 uppercase">Alert Level</span>
                            <span className="text-xs font-black text-emerald-500 italic">NOMINAL</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-500 transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="SEARCH INCIDENT ID..."
                            className="bg-black border border-white/10 rounded-2xl px-12 py-3 text-[10px] font-black text-white placeholder-white/20 outline-none w-64 focus:border-indigo-500/50 transition-all uppercase tracking-widest"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="w-10 h-10 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                        <img src={user.profilePic} alt="" className="w-full h-full object-cover" />
                    </div>
                </div>
            </header>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-white/5 border-b border-white/5 bg-zinc-950/20">
                {[
                    { label: 'Unassigned Ops', val: stats.unassigned, color: 'text-indigo-400' },
                    { label: 'In-Field Units', val: stats.inProgress, color: 'text-white' },
                    { label: 'Critical Alerts', val: stats.critical, color: 'text-red-500' },
                    { label: 'Pending Verification', val: stats.validationWait, color: 'text-orange-500' }
                ].map((stat, i) => (
                    <div key={i} className="px-8 py-4 group hover:bg-white/[0.02] transition-colors">
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                        <p className={`text-2xl font-black italic tracking-tighter ${stat.color}`}>{stat.val}</p>
                    </div>
                ))}
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Lateral Navigation / Feed */}
                <div className="w-full md:w-[450px] flex flex-col border-r border-white/5 bg-zinc-950/30">
                    <div className="p-6 border-b border-white/5 flex gap-2">
                        {(['PENDING', 'ACTIVE', 'RESOLVED'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setActiveTab(t)}
                                className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-white text-black' : 'bg-white/5 text-white/20 hover:text-white/40'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-black/40">
                        {filtered.map(p => (
                            <div
                                key={p.id}
                                onClick={() => setSelectedProblem(p)}
                                className={`p-4 rounded-3xl border cursor-pointer transition-all relative overflow-hidden group ${selectedProblem?.id === p.id ? 'bg-white border-white shadow-2xl' : 'bg-zinc-900/40 border-white/5 hover:border-white/10'}`}
                            >
                                <div className="flex gap-4">
                                    <div className="relative">
                                        <img src={p.imageUrl} className={`w-14 h-14 rounded-2xl object-cover border border-white/5 transition-all ${selectedProblem?.id === p.id ? '' : 'grayscale'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${selectedProblem?.id === p.id ? 'text-black/40' : 'text-indigo-400'}`}>{p.status}</span>
                                            <span className="text-[8px] font-black text-white/20 uppercase">{new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <h3 className={`text-xs font-black truncate uppercase italic tracking-tighter ${selectedProblem?.id === p.id ? 'text-black' : 'text-white'}`}>{p.title}</h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Workspace */}
                <div className="flex-1 overflow-y-auto bg-black p-6 md:p-10 pb-32 custom-scrollbar">
                    {selectedProblem ? (
                        <div className="max-w-4xl mx-auto space-y-10">
                            <header className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="w-full md:w-80 shrink-0">
                                    <div className="rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
                                        <img src={selectedProblem.imageUrl} className="w-full aspect-square object-cover" />
                                    </div>
                                </div>

                                <div className="flex-1 space-y-6 pt-4">
                                    <div>
                                        <div className="flex gap-2 mb-3">
                                            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest border border-red-500/20">{selectedProblem.urgency} SEVERITY</span>
                                            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase tracking-widest border border-indigo-500/20">{selectedProblem.category}</span>
                                        </div>
                                        <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-4">{selectedProblem.title}</h2>
                                        <p className="text-sm text-white/40 font-medium leading-relaxed">{selectedProblem.description}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-3xl bg-zinc-900/50 border border-white/5 space-y-3">
                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Assign Department</p>
                                            <div className="flex flex-wrap gap-2">
                                                {Object.values(Department).map(dept => (
                                                    <button
                                                        key={dept}
                                                        onClick={() => dataStore.updateProblem(selectedProblem.id, { department: dept }, user.name, `Assigned to ${dept}.`)}
                                                        className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase border transition-all ${selectedProblem.department === dept ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-white/5 text-white/20 hover:border-white/20'}`}
                                                    >
                                                        {dept}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-3xl bg-zinc-900/50 border border-white/5 space-y-3">
                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Operational Control</p>
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => dataStore.updateProblem(selectedProblem.id, { status: ProblemStatus.IN_PROGRESS }, user.name, 'Units dispatched.')}
                                                    className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white text-white/40 hover:text-black transition-all text-[10px] font-black uppercase tracking-widest border border-white/5"
                                                >
                                                    Engage Units
                                                </button>
                                                <button
                                                    onClick={() => dataStore.updateProblem(selectedProblem.id, { status: ProblemStatus.RESOLVED }, user.name, 'Issue marked as resolved.')}
                                                    className="w-full py-3 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-emerald-500/20"
                                                >
                                                    Resolve Case
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </header>

                            <section>
                                <h3 className="text-xs font-black uppercase text-white tracking-[0.3em] mb-8 flex items-center gap-2">
                                    <Database size={14} className="text-indigo-400" /> Operational Trail
                                </h3>
                                <div className="space-y-4">
                                    {selectedProblem.timeline.slice().reverse().map((ev, i) => (
                                        <div key={ev.id} className="relative pl-10 border-l border-white/5">
                                            <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-black border-2 border-white/10" />
                                            <div className="p-5 rounded-3xl bg-zinc-900/30 border border-white/5">
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-[10px] font-black text-indigo-400 uppercase italic">{ev.status}</span>
                                                    <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{new Date(ev.timestamp).toLocaleString()}</span>
                                                </div>
                                                <p className="text-[11px] text-white/60 font-medium">{ev.note}</p>
                                                <p className="mt-2 text-[8px] font-black text-white/10 uppercase italic">Logged by {ev.user}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                            <Shield size={60} className="text-white/5" />
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Standing By</h3>
                                <p className="text-xs text-white/20 font-medium uppercase tracking-widest">Select an incident to begin dispatch operations.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
