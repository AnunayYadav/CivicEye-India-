import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Loader2, Send, AlertCircle } from 'lucide-react';
import { ProblemCategory, ProblemStatus } from '../types';
import { dataStore } from '../services/store';

const ReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ProblemCategory.OTHER,
    location: { lat: 0, lng: 0 },
    imageUrl: '',
    address: ''
  });

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          location: { lat: position.coords.latitude, lng: position.coords.longitude },
          address: `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`
        }));
        setLocationLoading(false);
      },
      () => setLocationLoading(false)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newProblem = {
      id: `usr_${Date.now()}`,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      location: formData.location,
      address: formData.address,
      imageUrl: formData.imageUrl || `https://picsum.photos/400/300?grayscale&random=${Date.now()}`,
      status: ProblemStatus.PENDING,
      reportedBy: 'current_user',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      upvotes: 0
    };

    dataStore.addProblem(newProblem);
    setLoading(false);
    navigate('/');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Demo implementation
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-black p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-tight">New Report</h1>
          <p className="text-slate-400">Contribute to a smarter India by reporting local issues.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Category Grid */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Issue Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.values(ProblemCategory).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setFormData({...formData, category: cat})}
                  className={`p-4 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    formData.category === cat
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                      : 'bg-zinc-900/50 border-white/5 text-slate-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subject</label>
              <input
                type="text"
                required
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="Brief title of the problem"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Details</label>
              <textarea
                required
                rows={4}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Describe the situation..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          {/* Smart Location */}
          <div className="p-1 rounded-xl bg-gradient-to-r from-zinc-800 to-black p-[1px]">
            <div className="bg-zinc-950 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`p-2 rounded-lg ${locationLoading ? 'bg-indigo-500/20' : 'bg-emerald-500/20'}`}>
                   {locationLoading ? <Loader2 className="animate-spin text-indigo-500" size={18} /> : <MapPin className="text-emerald-500" size={18} />}
                </div>
                <div>
                   <p className="text-xs font-bold text-slate-500 uppercase">GPS Location</p>
                   <p className="text-sm text-slate-200 truncate font-mono">
                     {locationLoading ? "Triangulating..." : (formData.address || "Waiting for signal")}
                   </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={detectLocation}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors"
              >
                RETRY
              </button>
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Proof</label>
             <div className="relative group cursor-pointer">
               <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-20 blur transition-opacity group-hover:opacity-30"></div>
               <div className="relative border border-dashed border-white/20 bg-zinc-900/80 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 hover:text-white transition-colors">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <Camera size={28} className="mb-2" />
                  <span className="text-sm font-medium">Click to capture or upload photo</span>
               </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || locationLoading}
            className="w-full bg-white text-black hover:bg-slate-200 font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wide"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Submit Report</>}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ReportPage;
