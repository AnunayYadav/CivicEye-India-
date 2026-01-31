import React, { useState } from 'react';
import MapView from '../components/MapView';
import { Problem } from '../types';
import { X, MapPin, ThumbsUp, MessageSquare, Share2 } from 'lucide-react';

const MapPage: React.FC = () => {
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  return (
    <div className="h-full w-full relative">
      <MapView onProblemClick={setSelectedProblem} />

      {/* Detail Slide-over Panel */}
      {selectedProblem && (
        <div className="absolute top-0 right-0 h-full w-full sm:w-96 bg-slate-900 border-l border-slate-700 z-[500] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col">
          
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h2 className="text-lg font-bold text-white">Issue Details</h2>
            <button 
              onClick={() => setSelectedProblem(null)}
              className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-slate-800">
               <img 
                  src={selectedProblem.imageUrl} 
                  alt={selectedProblem.title} 
                  className="w-full h-full object-cover"
               />
               <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4">
                  <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide mb-1 ${
                      selectedProblem.status === 'RESOLVED' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {selectedProblem.status}
                  </span>
               </div>
            </div>

            <div>
              <h1 className="text-xl font-bold text-white mb-2">{selectedProblem.title}</h1>
              <div className="flex items-start gap-2 text-slate-400 text-sm mb-4">
                 <MapPin size={16} className="mt-0.5 shrink-0" />
                 <span>{selectedProblem.address || 'Location coordinates only'}</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-sm">
                {selectedProblem.description}
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 space-y-3">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide">Update History</h3>
               <div className="relative pl-4 border-l-2 border-slate-600 space-y-4">
                  <div className="relative">
                     <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500"></div>
                     <p className="text-sm text-slate-200">Admin marked as In Progress</p>
                     <p className="text-xs text-slate-500">2 hours ago</p>
                  </div>
                  <div className="relative">
                     <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-600"></div>
                     <p className="text-sm text-slate-200">Report Submitted</p>
                     <p className="text-xs text-slate-500">{new Date(selectedProblem.createdAt).toLocaleString()}</p>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-slate-700">
               <button className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 py-2.5 rounded-lg text-sm font-medium transition">
                  <ThumbsUp size={16} /> Upvote ({selectedProblem.upvotes})
               </button>
               <button className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 py-2.5 rounded-lg text-sm font-medium transition">
                  <Share2 size={16} /> Share
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;
