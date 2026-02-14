import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Star, Shield, TrendingUp, Users, Crown, Zap, Loader2 } from 'lucide-react';
import { TrustLevel, User } from '../types';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

const LeaderboardPage: React.FC = () => {
    const [leaders, setLeaders] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'users'), orderBy('trustScore', 'desc'), limit(10));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setLeaders(snapshot.docs.map(doc => doc.data() as User));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) return (
        <div className="h-full flex flex-col items-center justify-center bg-black gap-4">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Sequencing_Heroes</p>
        </div>
    );

    // If no users yet, show empty state or at least handle it gracefully
    const topThree = leaders.slice(0, 3);
    const others = leaders.slice(3);

    return (
        <div className="h-full overflow-y-auto bg-black p-4 md:p-10 pb-32 custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-10 mt-10">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-yellow-500">
                            <Trophy size={18} />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Guardian Protocol</span>
                        </div>
                        <h1 className="text-4xl font-black uppercase italic text-white tracking-tighter leading-none">Civic Heroes</h1>
                        <p className="text-xs text-white/40 font-medium mt-2 max-w-sm">Top contributors validating the pulse of India through data integrity and community action.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex flex-col items-center min-w-[100px]">
                            <Users size={16} className="text-white/20 mb-1" />
                            <span className="text-lg font-black text-white italic">{leaders.length}+</span>
                            <span className="text-[8px] font-bold text-white/20 uppercase">Citizens</span>
                        </div>
                        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex flex-col items-center min-w-[100px]">
                            <Shield size={16} className="text-indigo-500 mb-1" />
                            <span className="text-lg font-black text-white italic">{leaders.filter(l => l.trustLevel === TrustLevel.CIVIC_GUARDIAN).length}</span>
                            <span className="text-[8px] font-bold text-white/20 uppercase">Guardians</span>
                        </div>
                    </div>
                </header>

                {/* Podium */}
                {topThree.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 items-end pt-10">
                        {/* 2nd Place */}
                        {topThree[1] && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="flex flex-col items-center"
                            >
                                <div className="relative mb-4 group text-center">
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-zinc-800 overflow-hidden bg-zinc-900 mx-auto">
                                        <img src={topThree[1].profilePic || `https://ui-avatars.com/api/?name=${topThree[1].name}&background=6366f1&color=fff`} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-zinc-400 rounded-full flex items-center justify-center text-black font-black italic shadow-lg">2</div>
                                </div>
                                <div className="bg-zinc-900/50 border border-white/5 w-full h-32 rounded-t-3xl p-4 text-center">
                                    <p className="text-[10px] font-black text-white truncate">{topThree[1].name}</p>
                                    <p className="text-lg font-black text-white/40 italic">{topThree[1].trustScore}</p>
                                </div>
                            </motion.div>
                        )}

                        {/* 1st Place */}
                        {topThree[0] && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="flex flex-col items-center"
                            >
                                <div className="relative mb-6 group text-center">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                                        className="absolute -inset-4 border border-dashed border-yellow-500/20 rounded-full"
                                    />
                                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-yellow-500 overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.2)] bg-zinc-900 mx-auto">
                                        <img src={topThree[0].profilePic || `https://ui-avatars.com/api/?name=${topThree[0].name}&background=eab308&color=000`} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-yellow-500">
                                        <Crown size={24} fill="currentColor" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-black font-black italic text-xl shadow-lg">1</div>
                                </div>
                                <div className="bg-gradient-to-t from-yellow-500/10 to-yellow-500/20 border border-yellow-500/20 w-full h-44 rounded-t-3xl p-6 text-center">
                                    <p className="text-xs font-black text-white uppercase tracking-tighter truncate">{topThree[0].name}</p>
                                    <p className="text-3xl font-black text-yellow-500 italic mt-1">{topThree[0].trustScore}</p>
                                    <div className="flex items-center justify-center gap-1 mt-2 text-[8px] font-black text-yellow-500/60 uppercase tracking-widest leading-none">
                                        <Zap size={10} fill="currentColor" /> {topThree[0].trustLevel}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 3rd Place */}
                        {topThree[2] && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-col items-center"
                            >
                                <div className="relative mb-4 group text-center">
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-orange-900/50 overflow-hidden bg-zinc-900 mx-auto">
                                        <img src={topThree[2].profilePic || `https://ui-avatars.com/api/?name=${topThree[2].name}&background=c2410c&color=fff`} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-700 rounded-full flex items-center justify-center text-white font-black italic shadow-lg">3</div>
                                </div>
                                <div className="bg-zinc-900/50 border border-white/5 w-full h-28 rounded-t-3xl p-4 text-center">
                                    <p className="text-[10px] font-black text-white truncate">{topThree[2].name}</p>
                                    <p className="text-lg font-black text-white/40 italic">{topThree[2].trustScore}</p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* Full Table */}
                <div className="bg-zinc-950 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
                            <TrendingUp size={14} className="text-indigo-500" /> Regional Rankings
                        </h3>
                    </div>
                    <div className="divide-y divide-white/5">
                        {leaders.length === 0 ? (
                            <div className="p-20 text-center text-[10px] font-black text-white/10 uppercase tracking-[0.4em]">Grid Empty</div>
                        ) : (
                            leaders.map((user, idx) => (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    className="flex items-center gap-4 p-5 hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className="w-6 text-center text-[10px] font-black text-white/20 italic">
                                        {idx + 1}
                                    </div>
                                    <div className="w-10 h-10 rounded-xl overflow-hidden grayscale hover:grayscale-0 transition-all border border-white/5 bg-zinc-900">
                                        <img src={user.profilePic || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-white truncate italic uppercase tracking-tighter">{user.name}</p>
                                        <p className="text-[9px] font-bold text-indigo-400/60 uppercase tracking-widest">{user.trustLevel}</p>
                                    </div>
                                    <div className="hidden md:flex flex-col items-end mr-6">
                                        <span className="text-[8px] font-black text-white/20 uppercase tracking-tighter">Engagement</span>
                                        <span className="text-xs font-black text-white italic">{user.reportsCount} Reports</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 justify-end text-emerald-400">
                                            <Star size={12} fill="currentColor" />
                                            <span className="text-lg font-black italic">{user.trustScore}</span>
                                        </div>
                                        <p className="text-[8px] font-black text-white/20 uppercase">Trust Index</p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Badges Preview */}
                <section className="pt-10">
                    <h3 className="text-xs font-black uppercase text-white/40 tracking-[0.3em] mb-6 flex items-center gap-2">
                        <Medal size={14} /> Merit Badges
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Guardian', icon: Shield, color: 'text-indigo-400', desc: 'Verified 50+ issues' },
                            { label: 'Sharp Eye', icon: Zap, color: 'text-yellow-400', desc: 'First to report 10 resolved issues' },
                            { label: 'Voice of People', icon: Users, color: 'text-pink-400', desc: 'Top voted comments' },
                            { label: 'Consistent', icon: TrendingUp, color: 'text-emerald-400', desc: '14 day resolution streak' },
                        ].map((badge, idx) => (
                            <div key={idx} className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 flex flex-col items-center text-center group hover:bg-zinc-900/50 transition-all border-dashed">
                                <badge.icon size={32} className={`${badge.color} mb-3 group-hover:scale-110 transition-transform`} />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{badge.label}</span>
                                <p className="text-[8px] text-white/20 font-medium leading-tight">{badge.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default LeaderboardPage;
