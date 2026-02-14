
import React, { useState, useEffect } from 'react';
import { dataStore, userStore } from '../services/store';
import { Problem, ProblemStatus, UserRole, Department } from '../types';
import {
    Shield, Search, Clock, MapPin, CheckCircle2, XCircle,
    ArrowRight, Database, X
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
        return <div className="h-full flex items-center justify-center text-white/20 text-[10px] font-black uppercase tracking-widest">ACCESS_DENIED</div>;
    }

    const filtered = problems.filter(p => {
        const matchesFilter = filter === 'ALL' || p.status === filter;
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search);
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="h-full flex flex-col bg-black overflow-hidden">
            <header className="px-6 py-4 border-b border-white/5 flex items-center justify-between mt-10 md:mt-0">
                <h1 className="text-xs font-black uppercase italic text-white tracking-widest flex items-center gap-2">
                    <Shield size={12} className="text-indigo-500" /> Dispatch_Console
                </h1>
                <div className="flex gap-2">
                    <input
                        type="text" placeholder="FILTER..."
                        className="bg-zinc-950 border border-white/5 rounded-lg px-3 py-1.5 text-[10px] font-bold text-white outline-none w-32"
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {filtered.map(p => (
                        <div
                            key={p.id}
                            onClick={() => setSelectedProblem(p)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedProblem?.id === p.id ? 'bg-white text-black border-white' : 'bg-zinc-900/50 border-white/5 hover:border-white/10'}`}
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <p className={`text-[8px] font-black uppercase mb-1 ${selectedProblem?.id === p.id ? 'text-black/40' : 'text-indigo-500'}`}>{p.status}</p>
                                    <h3 className="text-[11px] font-bold truncate">{p.title}</h3>
                                </div>
                                <img src={p.imageUrl} className="w-8 h-8 rounded-lg object-cover grayscale" />
                            </div>
                        </div>
                    ))}
                </div>

                <AnimatePresence>
                    {selectedProblem && (
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            className="w-full md:w-80 bg-zinc-950 border-l border-white/5 p-6 overflow-y-auto absolute right-0 top-0 h-full md:relative z-50"
                        >
                            <button onClick={() => setSelectedProblem(null)} className="absolute top-4 right-4 text-white/20"><X size={16} /></button>
                            <div className="space-y-6">
                                <img src={selectedProblem.imageUrl} className="w-full h-32 rounded-xl object-cover border border-white/5" />
                                <div>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{selectedProblem.category}</p>
                                    <h2 className="text-sm font-bold text-white">{selectedProblem.title}</h2>
                                    <p className="text-[11px] text-white/40 mt-2 leading-relaxed">{selectedProblem.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => dataStore.updateProblem(selectedProblem.id, { status: ProblemStatus.IN_PROGRESS }, user.name, 'Engaged.')}
                                        className="py-2 rounded-lg bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest">Engage</button>
                                    <button onClick={() => dataStore.updateProblem(selectedProblem.id, { status: ProblemStatus.RESOLVED }, user.name, 'Resolved.')}
                                        className="py-2 rounded-lg bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest">Resolve</button>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <p className="text-[9px] font-black text-white/20 uppercase">History</p>
                                    {selectedProblem.timeline.map((ev, i) => (
                                        <div key={i} className="flex gap-3">
                                            <div className="w-1 h-full bg-white/5 rounded-full min-h-[20px]" />
                                            <div>
                                                <p className="text-[9px] font-bold text-white/60">{ev.status}</p>
                                                <p className="text-[8px] text-white/20">{ev.note}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminPage;
