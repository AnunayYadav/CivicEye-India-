import React, { useState } from 'react';
import MapView from '../components/MapView';
import { Problem } from '../types';
import { X, MapPin, ThumbsUp, Share2, ArrowRight } from 'lucide-react';

const MapPage: React.FC = () => {
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  return (
    <div className="h-full w-full relative bg-black">
      <MapView onProblemClick={setSelectedProblem} />

      {/* Glassmorphism Detail Panel */}
      {selectedProblem && (
        <div className="absolute top-0 right-0 h-full w-full sm:w-[450px] bg-zinc-950/80 backdrop-blur-2xl border-l border-white/10 z-[500] shadow-2xl transform transition-transform duration-500 ease-out flex flex-col animate-in slide-in-from-right">
          
          <div className="absolute top-4 right-4 z-10">
            <button 
              onClick={() => setSelectedProblem(null)}
              className="p-2 rounded-full bg-black/50 hover:bg-white/10 text-white backdrop-blur-md transition-all border border-white/5"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Hero Image */}
            <div className="relative w-full h-72">
               <img 
                  src={selectedProblem.imageUrl} 
                  alt={selectedProblem.title} 
                  className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent"></div>
               <div className="absolute bottom-6 left-6 right-6">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3 border ${
                      selectedProblem.status === 'RESOLVED' 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                    {selectedProblem.status.replace('_', ' ')}
                  </span>
                  <h1 className="text-2xl font-bold text-white leading-tight shadow-black drop-shadow-lg">{selectedProblem.title}</h1>
               </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Location */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                 <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 shrink-0">
                    <MapPin size={20} />
                 </div>
                 <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Location</h3>
                    <p className="text-sm text-slate-200 leading-relaxed font-medium">{selectedProblem.address || 'Exact coordinates provided'}</p>
                 </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Description</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  {selectedProblem.description}
                </p>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                 <h3 className="text-sm font-bold text-white">Timeline</h3>
                 <div className="relative pl-6 border-l border-white/10 space-y-6">
                    <div className="relative group">
                       <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-zinc-900 border-2 border-indigo-500 group-hover:bg-indigo-500 transition-colors"></div>
                       <p className="text-sm text-white font-medium">Report received</p>
                       <p className="text-xs text-slate-500 mt-1">{new Date(selectedProblem.createdAt).toLocaleString()}</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-6 border-t border-white/10 bg-zinc-950/50 backdrop-blur-md">
            <div className="flex gap-4">
               <button className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl text-sm font-bold text-white transition-all group">
                  <ThumbsUp size={16} className="group-hover:text-indigo-400 transition-colors" /> 
                  <span className="text-slate-300 group-hover:text-white">Vote</span>
               </button>
               <button className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 py-3 rounded-xl text-sm font-bold text-white transition-all">
                  Share Issue <ArrowRight size={16} />
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;
