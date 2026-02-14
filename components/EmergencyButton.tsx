import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Siren, Phone, Share2, Mic, AlertCircle, X, ShieldAlert } from 'lucide-react';

const EmergencyButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isActivating, setIsActivating] = useState(false);

    const handleSOS = () => {
        setIsActivating(true);
        setTimeout(() => {
            setIsOpen(true);
            setIsActivating(false);
        }, 1500);
    };

    return (
        <>
            <div className="fixed bottom-8 right-8 z-[1100]">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSOS}
                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all ${isActivating ? 'bg-red-500 scale-125' : 'bg-red-600'
                        }`}
                >
                    {isActivating ? (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        >
                            <Siren size={30} className="text-white" />
                        </motion.div>
                    ) : (
                        <Siren size={30} className="text-white" />
                    )}
                </motion.button>
                {!isActivating && !isOpen && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] font-bold px-2 py-0.5 rounded shadow shadow-red-900/50 whitespace-nowrap uppercase tracking-widest">
                        SOS
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2000] bg-red-600 flex flex-col items-center justify-center p-8 text-white text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-32 h-32 rounded-full border-4 border-white/30 flex items-center justify-center mb-8 bg-white/10"
                        >
                            <ShieldAlert size={60} className="animate-pulse" />
                        </motion.div>

                        <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">Emergency Mode Active</h1>
                        <p className="text-white/80 font-medium mb-12 max-w-sm">
                            Your live location is being shared with nearby trusted users and authorities.
                        </p>

                        <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-8">
                            <a href="tel:100" className="flex items-center justify-center gap-3 p-6 bg-white text-red-600 rounded-3xl font-bold hover:bg-neutral-100 transition-all">
                                <Phone size={24} /> 100
                            </a>
                            <a href="tel:102" className="flex items-center justify-center gap-3 p-6 bg-red-700 text-white rounded-3xl font-bold hover:bg-red-800 transition-all border border-white/10">
                                <Phone size={24} /> 102
                            </a>
                        </div>

                        <div className="flex gap-4 w-full max-w-md">
                            <button className="flex-1 flex items-center justify-center gap-2 p-4 bg-white/10 backdrop-blur-md rounded-2xl font-bold border border-white/5">
                                <Share2 size={20} /> SHARE SOS
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 p-4 bg-white/10 backdrop-blur-md rounded-2xl font-bold border border-white/5">
                                <Mic size={20} /> RECORD
                            </button>
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="mt-16 flex items-center gap-2 text-white/40 hover:text-white transition-colors"
                        >
                            <X size={20} /> DEACTIVATE EMERGENCY
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default EmergencyButton;
