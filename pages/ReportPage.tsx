import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Loader2, ChevronRight, AlertCircle, Zap } from 'lucide-react';
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
          address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
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
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate neater loading

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
    <div className="w-full h-full overflow-y-auto bg-black p-4 md:p-8 pb-32">
      <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">New Report</h1>
          <p className="text-white/50 text-lg">Help us maintain the city infrastructure.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section: Category */}
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.values(ProblemCategory).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setFormData({...formData, category: cat})}
                  className={`relative p-4 rounded-[24px] text-sm font-medium transition-all duration-300 flex flex-col items-center justify-center text-center gap-2 aspect-square ${
                    formData.category === cat
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-[1.02]'
                      : 'bg-transparent text-white/50 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {formData.category === cat && (
                    <div className="absolute top-3 right-3 w-2 h-2 bg-white rounded-full shadow-[0_0_8px_white]"></div>
                  )}
                  <span className="text-xs uppercase tracking-widest opacity-60">
                    {cat.split(' ')[0]}
                  </span>
                  <span className="font-bold leading-tight">
                    {cat.split('&')[0].trim()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Details */}
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden">
             <div className="p-1">
                <input
                  type="text"
                  required
                  className="w-full bg-transparent text-lg font-medium text-white placeholder-white/20 px-6 py-5 outline-none border-b border-white/5 focus:bg-white/5 transition-colors"
                  placeholder="What's the issue?"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
                <textarea
                  required
                  rows={4}
                  className="w-full bg-transparent text-base text-white/80 placeholder-white/20 px-6 py-5 outline-none resize-none focus:bg-white/5 transition-colors"
                  placeholder="Provide more details about the situation..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
             </div>
          </div>

          {/* Section: Location & Photo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Location Widget */}
             <div 
                onClick={detectLocation}
                className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 flex flex-col justify-between h-40 cursor-pointer hover:bg-white/5 transition-colors group relative overflow-hidden"
             >
                <div className="flex items-start justify-between z-10">
                   <div className={`p-3 rounded-2xl ${locationLoading ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {locationLoading ? <Loader2 className="animate-spin" size={20} /> : <MapPin size={20} />}
                   </div>
                   <div className="bg-white/10 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Zap size={16} className="text-white" fill="white" />
                   </div>
                </div>
                <div className="z-10">
                   <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Location</p>
                   <p className="text-sm font-medium text-white truncate font-mono">
                      {locationLoading ? "Triangulating..." : (formData.address || "Tap to detect")}
                   </p>
                </div>
                {/* Decoration */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full"></div>
             </div>

             {/* Camera Widget */}
             <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 flex flex-col justify-between h-40 relative overflow-hidden group">
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                <div className="flex items-start justify-between z-10">
                   <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
                      <Camera size={20} />
                   </div>
                </div>
                <div className="z-10">
                   <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Evidence</p>
                   <p className="text-sm font-medium text-white">Upload Photo</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             </div>
          </div>

          <button
            type="submit"
            disabled={loading || locationLoading}
            className="w-full h-16 bg-white text-black font-bold text-lg rounded-[32px] shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed group"
          >
            {loading ? (
               <Loader2 className="animate-spin" />
            ) : (
               <>
                 <span>Submit Report</span>
                 <div className="bg-black/10 rounded-full p-1 group-hover:translate-x-1 transition-transform">
                   <ChevronRight size={20} />
                 </div>
               </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ReportPage;