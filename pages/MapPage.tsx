import React, { useState } from 'react';
import MapView from '../components/MapView';
import { Problem } from '../types';
import { X, MapPin, ThumbsUp, ArrowRight, Clock, ShieldCheck } from 'lucide-react';

const MapPage: React.FC = () => {
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  return (
    <div className="h-full w-full relative bg-black">
      <MapView onProblemClick={setSelectedProblem} />

      {/* Floating Detail Panel - Compact Modern Style */}
      {selectedProblem && (
        <div className="absolute inset-0 sm:inset-auto sm:top-4 sm:right-4 sm:bottom-4 sm:w-[380px] z-[500] flex flex-col pointer-events-none">
          <div className="h-full w-full bg-zinc-900/95 backdrop-blur-3xl sm:rounded-[24px] sm:border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-500 relative pointer-events-auto">
            
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-20">
              <button 
                onClick={() => setSelectedProblem(null)}
                className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-white/20 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* Hero Image */}
              <div className="relative w-full h-56">
                 <img 
                    src={selectedProblem.imageUrl} 
                    alt={selectedProblem.title} 
                    className="w-full h-full object-cover"
                 />
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-900/10 to-zinc-900/95"></div>
                 
                 <div className="absolute bottom-0 left-0 w-full p-6 pb-2">
                    <div className="flex gap-2 mb-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide backdrop-blur-md border ${
                          selectedProblem.status === 'RESOLVED' 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                          : 'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}>
                        {selectedProblem.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h1 className="text-xl font-bold text-white leading-tight drop-shadow-md">{selectedProblem.title}</h1>
                 </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Stats Row */}
                <div className="flex gap-3">
                   <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/5 backdrop-blur-md">
                      <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Reported</p>
                      <div className="flex items-center gap-1.5 text-white">
                         <Clock size={14} />
                         <span className="font-medium text-xs">{new Date(selectedProblem.createdAt).toLocaleDateString()}</span>
                      </div>
                   </div>
                   <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/5 backdrop-blur-md">
                      <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Upvotes</p>
                      <div className="flex items-center gap-1.5 text-white">
                         <ThumbsUp size={14} className="text-indigo-400" />
                         <span className="font-medium text-xs">{selectedProblem.upvotes || 0} Citizens</span>
                      </div>
                   </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                   <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                      <MapPin size={18} />
                   </div>
                   <div>
                      <h3 className="text-xs font-bold text-white mb-0.5">Location Details</h3>
                      <p className="text-white/60 text-xs leading-relaxed">{selectedProblem.address || 'Precise coordinates locked.'}</p>
                   </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs font-bold text-white mb-2">Situation Report</h3>
                  <p className="text-white/70 leading-relaxed text-sm">
                    {selectedProblem.description}
                  </p>
                </div>
                
                {/* Timeline Visual */}
                <div className="bg-zinc-950/50 rounded-xl p-4 border border-white/5">
                   <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                         <ShieldCheck size={14} />
                      </div>
                      <div>
                         <p className="text-xs font-bold text-white">System Verified</p>
                         <p className="text-[10px] text-white/40">Automated AI check passed</p>
                      </div>
                   </div>
                </div>

              </div>
            </div>

            {/* Action Footer */}
            <div className="p-4 bg-zinc-900/90 backdrop-blur-xl border-t border-white/5">
              <button className="w-full bg-white text-black font-bold py-3 rounded-xl text-xs uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors shadow-lg">
                 Support Issue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;