import React, { useState } from 'react';
import MapView from '../components/MapView';
import { Problem } from '../types';
import { X, MapPin, ThumbsUp, Share2, ArrowRight, Clock, ShieldCheck } from 'lucide-react';

const MapPage: React.FC = () => {
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  return (
    <div className="h-full w-full relative bg-black">
      <MapView onProblemClick={setSelectedProblem} />

      {/* Floating Detail Panel - Modern iOS Sheet Style */}
      {selectedProblem && (
        <div className="absolute inset-0 sm:inset-auto sm:top-4 sm:right-4 sm:bottom-4 sm:w-[480px] z-[500] flex flex-col">
          <div className="h-full w-full bg-zinc-900/90 backdrop-blur-3xl sm:rounded-[32px] sm:border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-500 relative">
            
            {/* Close Button */}
            <div className="absolute top-5 right-5 z-20">
              <button 
                onClick={() => setSelectedProblem(null)}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-white/20 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* Hero Image */}
              <div className="relative w-full h-80">
                 <img 
                    src={selectedProblem.imageUrl} 
                    alt={selectedProblem.title} 
                    className="w-full h-full object-cover"
                 />
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-900/20 to-zinc-900"></div>
                 
                 <div className="absolute bottom-0 left-0 w-full p-8 pb-4">
                    <div className="flex gap-2 mb-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide backdrop-blur-md border ${
                          selectedProblem.status === 'RESOLVED' 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                          : 'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}>
                        {selectedProblem.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h1 className="text-3xl font-bold text-white leading-tight drop-shadow-lg">{selectedProblem.title}</h1>
                 </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Stats Row */}
                <div className="flex gap-4">
                   <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-md">
                      <p className="text-xs font-bold text-white/40 uppercase mb-1">Reported</p>
                      <div className="flex items-center gap-2 text-white">
                         <Clock size={16} />
                         <span className="font-medium text-sm">{new Date(selectedProblem.createdAt).toLocaleDateString()}</span>
                      </div>
                   </div>
                   <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-md">
                      <p className="text-xs font-bold text-white/40 uppercase mb-1">Upvotes</p>
                      <div className="flex items-center gap-2 text-white">
                         <ThumbsUp size={16} className="text-indigo-400" />
                         <span className="font-medium text-sm">{selectedProblem.upvotes || 0} Citizens</span>
                      </div>
                   </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                      <MapPin size={24} />
                   </div>
                   <div>
                      <h3 className="text-sm font-bold text-white mb-1">Location Details</h3>
                      <p className="text-white/60 text-sm leading-relaxed">{selectedProblem.address || 'Precise coordinates locked.'}</p>
                   </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-bold text-white mb-3">Situation Report</h3>
                  <p className="text-white/70 leading-relaxed text-base">
                    {selectedProblem.description}
                  </p>
                </div>
                
                {/* Timeline Visual */}
                <div className="bg-zinc-950/50 rounded-2xl p-6 border border-white/5">
                   <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                         <ShieldCheck size={16} />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-white">System Verified</p>
                         <p className="text-xs text-white/40">Automated AI check passed</p>
                      </div>
                   </div>
                </div>

              </div>
            </div>

            {/* Action Footer */}
            <div className="p-6 bg-zinc-900/80 backdrop-blur-xl border-t border-white/5">
              <button className="w-full bg-white text-black font-bold py-4 rounded-2xl text-sm uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors shadow-lg">
                 Support Issue <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;