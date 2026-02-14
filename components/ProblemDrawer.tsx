import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, User, CheckCircle, Shield, AlertTriangle, TrendingUp, MessageSquare, ThumbsUp, Send } from 'lucide-react';
import { Problem, ProblemStatus, ProblemCategory, TrustLevel } from '../types';
import { dataStore, userStore } from '../services/store';

interface ProblemDrawerProps {
    problem: Problem | null;
    onClose: () => void;
}

const getStatusColor = (status: ProblemStatus) => {
    switch (status) {
        case ProblemStatus.RESOLVED: return 'text-green-400 bg-green-400/10';
        case ProblemStatus.IN_PROGRESS: return 'text-blue-400 bg-blue-400/10';
        case ProblemStatus.SUBMITTED: return 'text-orange-400 bg-orange-400/10';
        default: return 'text-zinc-400 bg-zinc-400/10';
    }
};

const ProblemDrawer: React.FC<ProblemDrawerProps> = ({ problem, onClose }) => {
    const [commentText, setCommentText] = React.useState('');
    const currentUser = userStore.getCurrentUser();

    if (!problem) return null;

    const handleVote = () => {
        dataStore.upvoteProblem(problem.id);
    };

    const handleValidate = () => {
        dataStore.validateProblem(problem.id, currentUser.id, currentUser.trustLevel === TrustLevel.CIVIC_GUARDIAN);
    };

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        dataStore.addComment(problem.id, {
            id: `cmt_${Date.now()}`,
            userId: currentUser.id,
            userName: currentUser.name,
            text: commentText,
            timestamp: Date.now()
        });
        setCommentText('');
    };

    return (
        <AnimatePresence>
            {problem && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1100] md:hidden"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                        className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-zinc-950 border-l border-white/5 z-[1200] overflow-y-auto shadow-2xl custom-scrollbar"
                    >
                        <div className="relative h-72 w-full">
                            <img
                                src={problem.imageUrl || 'https://images.unsplash.com/photo-1594498653385-d5172b532c00?q=80&w=1000'}
                                alt={problem.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2.5 bg-black/40 backdrop-blur-xl rounded-2xl text-white hover:bg-black/60 transition-all border border-white/5 active:scale-90"
                            >
                                <X size={20} />
                            </button>

                            <div className="absolute bottom-6 left-8 right-8">
                                <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest mb-3 ${getStatusColor(problem.status)} border border-current opacity-80`}>
                                    {problem.status}
                                </div>
                                <h2 className="text-3xl font-black text-white tracking-tighter italic leading-none">{problem.title}</h2>
                            </div>
                        </div>

                        <div className="p-8 space-y-10">
                            {/* Interaction Bar */}
                            <div className="flex items-center justify-between py-1 border-y border-white/5">
                                <button
                                    onClick={handleVote}
                                    className="flex items-center gap-2 group text-white/40 hover:text-white transition-all px-4 py-2"
                                >
                                    <ThumbsUp size={18} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-black">{problem.upvotes}</span>
                                </button>
                                <div className="h-4 w-px bg-white/5" />
                                <div className="flex items-center gap-2 text-white/40 px-4 py-2">
                                    <MessageSquare size={18} />
                                    <span className="text-sm font-black">{problem.comments?.length || 0}</span>
                                </div>
                                <div className="h-4 w-px bg-white/5" />
                                <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-widest bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20">
                                    <CheckCircle size={14} />
                                    {problem.validationCount} Verified
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-white/20 relative group-hover:border-indigo-500 transition-colors">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-0.5">Reported By</p>
                                        <p className="text-sm font-bold text-white">Citizen #{problem.reportedBy?.slice(-4) || '7721'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1.5 justify-end text-orange-400">
                                        <Shield size={16} fill="currentColor" className="opacity-20" />
                                        <span className="text-lg font-black italic">{problem.reporterTrustScore || 50}</span>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Trust Index</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-zinc-900/50 border border-white/5 rounded-3xl group hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-2 text-zinc-400 mb-3">
                                        <AlertTriangle size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Triage Level</span>
                                    </div>
                                    <p className={`text-sm font-black italic tracking-tight ${problem.urgency === 'HIGH' ? 'text-red-400' : problem.urgency === 'MEDIUM' ? 'text-yellow-400' : 'text-blue-400'}`}>
                                        {problem.urgency} PRIORITY
                                    </p>
                                </div>
                                <div className="p-5 bg-zinc-900/50 border border-white/5 rounded-3xl group hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-2 text-zinc-400 mb-3">
                                        <Clock size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Timestamp</span>
                                    </div>
                                    <p className="text-sm font-black italic text-white tracking-tight">
                                        {new Date(problem.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                    <TrendingUp size={14} /> Operational Analysis
                                </h3>
                                <div className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/30 p-6 rounded-[2rem] border border-white/5 relative overflow-hidden">
                                    <div className="relative z-10">{problem.description}</div>
                                    <div className="absolute top-0 right-0 p-4 opacity-5">
                                        <TrendingUp size={80} />
                                    </div>
                                </div>
                            </div>

                            {/* Validation Section */}
                            <div className="pt-6 border-t border-white/5">
                                <button
                                    onClick={handleValidate}
                                    className="w-full py-5 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black text-xs transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3 uppercase tracking-tighter"
                                >
                                    <Shield size={18} /> CONFIRM SPATIAL DATA
                                </button>
                                <p className="text-center text-[9px] text-zinc-600 mt-5 uppercase font-bold tracking-[0.2em] max-w-[250px] mx-auto leading-relaxed">
                                    Verifying this report increases local resolution weight for authorities
                                </p>
                            </div>

                            {/* Comments Section */}
                            <div className="space-y-6 pt-10 border-t border-white/5">
                                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                    <MessageSquare size={14} /> Community Feed
                                </h3>

                                <form onSubmit={handleAddComment} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Add to the discussion..."
                                        className="flex-1 bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-indigo-500/50 transition-all font-medium"
                                    />
                                    <button
                                        type="submit"
                                        className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white hover:bg-indigo-500 transition-all active:scale-95"
                                    >
                                        <Send size={18} />
                                    </button>
                                </form>

                                <div className="space-y-4">
                                    {problem.comments?.length > 0 ? (
                                        problem.comments.map((comment) => (
                                            <div key={comment.id} className="bg-zinc-900/20 border border-white/5 p-4 rounded-2xl">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-black text-indigo-400 uppercase">{comment.userName}</span>
                                                    <span className="text-[8px] font-bold text-zinc-600 uppercase">{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <p className="text-xs text-zinc-400 font-medium leading-relaxed">{comment.text}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">No transmissions recorded</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ProblemDrawer;
