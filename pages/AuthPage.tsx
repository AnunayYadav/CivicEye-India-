import React, { useState } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, User as UserIcon, ArrowRight, Github, Loader2, AlertCircle } from 'lucide-react';
import { UserRole, TrustLevel } from '../types';

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                await updateProfile(user, { displayName: name });

                // Initialize user profile in Firestore
                await setDoc(doc(db, 'users', user.uid), {
                    id: user.uid,
                    name: name,
                    email: email,
                    role: UserRole.CITIZEN,
                    trustScore: 10, // Initial trust
                    trustLevel: TrustLevel.NEW_USER,
                    reportsCount: 0,
                    resolvedReportsCount: 0,
                    isVerified: false,
                    createdAt: Date.now()
                });
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (!userDoc.exists()) {
                await setDoc(doc(db, 'users', user.uid), {
                    id: user.uid,
                    name: user.displayName || 'Anonymous',
                    email: user.email,
                    role: UserRole.CITIZEN,
                    trustScore: 10,
                    trustLevel: TrustLevel.NEW_USER,
                    reportsCount: 0,
                    resolvedReportsCount: 0,
                    isVerified: false,
                    createdAt: Date.now()
                });
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Aesthetics */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/5 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-zinc-950/50 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative z-10 shadow-2xl"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-indigo-600/20 text-indigo-500 mb-6 border border-indigo-500/20">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">CivicEye India</h1>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Guardian Protocol Entry</p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <AnimatePresence mode="wait">
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="relative"
                            >
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                <input
                                    type="text"
                                    placeholder="FULL NAME"
                                    required
                                    className="w-full bg-black border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white uppercase tracking-widest outline-none focus:border-indigo-500/50 transition-all"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                        <input
                            type="email"
                            placeholder="EMAIL ADDRESS"
                            required
                            className="w-full bg-black border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white uppercase tracking-widest outline-none focus:border-indigo-500/50 transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                        <input
                            type="password"
                            placeholder="PASSWORD"
                            required
                            className="w-full bg-black border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white uppercase tracking-widest outline-none focus:border-indigo-500/50 transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-[10px] font-bold uppercase tracking-widest">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}

                    <button
                        disabled={loading}
                        className="w-full py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all mt-4 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : (
                            <>
                                {isLogin ? 'Initialize Session' : 'Create Credentials'}
                                <ArrowRight size={14} />
                            </>
                        )}
                    </button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                    <div className="relative flex justify-center text-[8px] font-black uppercase"><span className="bg-zinc-950 px-4 text-white/20 tracking-widest uppercase">Or Protocol</span></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={handleGoogleSignIn}
                        className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/5 text-[9px] font-black text-white hover:bg-white/10 transition-all uppercase tracking-widest"
                    >
                        <Github size={14} /> Google
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/5 text-[9px] font-black text-white hover:bg-white/10 transition-all uppercase tracking-widest">
                        <Github size={14} /> Github
                    </button>
                </div>

                <p className="mt-8 text-center text-[10px] font-bold text-white/20 uppercase tracking-widest">
                    {isLogin ? "New to the grid?" : "Already cleared?"}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="ml-2 text-indigo-500 hover:text-indigo-400 transition-colors"
                    >
                        {isLogin ? "Sign Up" : "Log In"}
                    </button>
                </p>
            </motion.div>
        </div>
    );
};

export default AuthPage;
