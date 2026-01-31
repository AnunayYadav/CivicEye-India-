import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Loader2, ChevronRight, AlertCircle, Zap, Search } from 'lucide-react';
import { ProblemCategory, ProblemStatus, MapplsSuggestion } from '../types';
import { dataStore } from '../services/store';
import { loadMapplsSDK, reverseGeocode, searchPlaces } from '../services/mapplsUtils';

const ReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MapplsSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ProblemCategory.OTHER,
    location: { lat: 0, lng: 0 },
    imageUrl: '',
    address: ''
  });

  useEffect(() => {
    loadMapplsSDK();
    detectLocation();
  }, []);

  // Autosuggest Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
          const results = await searchPlaces(searchQuery);
          setSuggestions(results);
          setShowSuggestions(true);
      } else {
          setSuggestions([]);
          setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Use Mappls Reverse Geocode
        let address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        try {
            address = await reverseGeocode(lat, lng);
        } catch(e) { console.error(e); }

        setFormData(prev => ({
          ...prev,
          location: { lat, lng },
          address
        }));
        setSearchQuery(address); // Sync search bar with detected address
        setLocationLoading(false);
      },
      () => {
          setLocationLoading(false);
          setFormData(prev => ({...prev, address: "Location detection failed"}));
      }
    );
  };

  const handleSuggestionSelect = (s: MapplsSuggestion) => {
      setSearchQuery(s.placeName);
      setFormData(prev => ({
          ...prev,
          address: s.placeAddress,
          location: { 
              lat: s.latitude || prev.location.lat, 
              lng: s.longitude || prev.location.lng 
          }
      }));
      setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

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
      <div className="max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 mt-12 md:mt-0">
        
        <div className="mb-6 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-1">New Report</h1>
          <p className="text-white/50 text-sm">Help us maintain the city infrastructure.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Section: Category */}
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-[24px] p-2">
            <div className="grid grid-cols-3 gap-2">
              {Object.values(ProblemCategory).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setFormData({...formData, category: cat})}
                  className={`relative p-3 rounded-[16px] text-sm font-medium transition-all duration-300 flex flex-col items-center justify-center text-center gap-1.5 aspect-square ${
                    formData.category === cat
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-[1.02]'
                      : 'bg-transparent text-white/50 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {formData.category === cat && (
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_6px_white]"></div>
                  )}
                  <span className="text-[10px] uppercase tracking-widest opacity-60">
                    {cat.split(' ')[0]}
                  </span>
                  <span className="text-xs font-bold leading-tight">
                    {cat.split('&')[0].trim()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Details */}
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-[24px] overflow-hidden">
             <div className="p-1">
                <input
                  type="text"
                  required
                  className="w-full bg-transparent text-base font-medium text-white placeholder-white/20 px-5 py-4 outline-none border-b border-white/5 focus:bg-white/5 transition-colors"
                  placeholder="What's the issue?"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
                <textarea
                  required
                  rows={3}
                  className="w-full bg-transparent text-sm text-white/80 placeholder-white/20 px-5 py-4 outline-none resize-none focus:bg-white/5 transition-colors"
                  placeholder="Provide more details about the situation..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
             </div>
          </div>

          {/* Section: Location (Autosuggest + Detect) */}
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-[24px] p-5 relative">
              <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-xl ${locationLoading ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {locationLoading ? <Loader2 className="animate-spin" size={18} /> : <MapPin size={18} />}
                  </div>
                  <div className="flex-1 relative">
                      <input 
                        type="text" 
                        placeholder="Search location or tap detect..."
                        className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-white/30 font-bold"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                      />
                      {/* Suggestions Dropdown */}
                      {showSuggestions && suggestions.length > 0 && (
                          <div className="absolute top-full left-0 mt-2 w-full bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden max-h-40 overflow-y-auto">
                              {suggestions.map((s, i) => (
                                  <div 
                                    key={i} 
                                    onClick={() => handleSuggestionSelect(s)}
                                    className="px-4 py-2 hover:bg-white/10 cursor-pointer text-xs border-b border-white/5 last:border-none"
                                  >
                                      <p className="font-bold text-white">{s.placeName}</p>
                                      <p className="text-white/50 truncate">{s.placeAddress}</p>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
                  <button 
                    type="button" 
                    onClick={detectLocation}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                      <Zap size={16} className={locationLoading ? "text-indigo-400" : "text-white/40"} />
                  </button>
              </div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-12">
                  {formData.address || "Tap zap icon to find me"}
              </p>
          </div>

          {/* Section: Camera */}
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-[24px] p-5 flex flex-col justify-between h-32 relative overflow-hidden group">
            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
            <div className="flex items-start justify-between z-10">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <Camera size={18} />
                </div>
            </div>
            <div className="z-10">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Evidence</p>
                <p className="text-xs font-medium text-white">Upload Photo</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>

          <button
            type="submit"
            disabled={loading || locationLoading}
            className="w-full h-12 bg-white text-black font-bold text-base rounded-[24px] shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed group mt-2"
          >
            {loading ? (
               <Loader2 className="animate-spin" size={20} />
            ) : (
               <>
                 <span>Submit Report</span>
                 <div className="bg-black/10 rounded-full p-1 group-hover:translate-x-1 transition-transform">
                   <ChevronRight size={16} />
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
