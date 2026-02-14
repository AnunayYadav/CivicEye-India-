
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Loader2, ChevronRight, Sparkles, Zap, Search } from 'lucide-react';
import { ProblemCategory, ProblemStatus, MapplsSuggestion } from '../types';
import { dataStore } from '../services/store';
import { loadMapplsSDK, reverseGeocode, searchPlaces } from '../services/mapplsUtils';
import { GoogleGenAI, Type } from "@google/genai";

const ReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

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

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        const address = await reverseGeocode(lat, lng);
        setFormData(prev => ({ ...prev, location: { lat, lng }, address }));
        setSearchQuery(address);
        setLocationLoading(false);
      },
      () => setLocationLoading(false)
    );
  };

  const handleAiAssist = async () => {
    if (!formData.title) return;
    setAiLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `I want to report a city problem: "${formData.title}". 
        Analyze this and return a JSON object with:
        1. "refinedTitle": A clear, concise title.
        2. "professionalDescription": A detailed description of the problem for city officials.
        3. "suggestedCategory": One of: ${Object.values(ProblemCategory).join(', ')}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              refinedTitle: { type: Type.STRING },
              professionalDescription: { type: Type.STRING },
              suggestedCategory: { type: Type.STRING },
            },
            required: ["refinedTitle", "professionalDescription", "suggestedCategory"]
          }
        }
      });

      const result = JSON.parse(response.text);
      setFormData(prev => ({
        ...prev,
        title: result.refinedTitle,
        description: result.professionalDescription,
        category: result.suggestedCategory as ProblemCategory
      }));
    } catch (e) {
      console.error("AI Assist failed", e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    setLoading(true);
    // Add logic to save problem
    const newProblem = {
      id: `rep_${Date.now()}`,
      ...formData,
      status: ProblemStatus.PENDING,
      reportedBy: 'Citizen User',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      upvotes: 0,
      imageUrl: formData.imageUrl || `https://picsum.photos/800/600?random=${Date.now()}`
    };

    dataStore.addProblem(newProblem);
    setLoading(false);
    navigate('/');
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-black p-4 md:p-8 pb-32 custom-scrollbar">
      <div className="max-w-2xl mx-auto space-y-8 mt-8">

        <header>
          <h1 className="text-3xl font-bold text-white tracking-tight">Citizen Report</h1>
          <p className="text-white/40 mt-1">Submit infrastructure issues for rapid resolution.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Categorization */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.values(ProblemCategory).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat })}
                className={`p-4 rounded-2xl text-left border transition-all ${formData.category === cat
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-zinc-900 border-white/5 text-white/40 hover:bg-zinc-800'
                  }`}
              >
                <div className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-1">{cat.split('&')[0]}</div>
                <div className="text-sm font-bold truncate">{cat}</div>
              </button>
            ))}
          </div>

          {/* Details Input */}
          <div className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden group focus-within:border-indigo-500/50 transition-colors">
            <div className="flex items-center border-b border-white/5 pr-4">
              <input
                type="text"
                placeholder="Briefly, what is the issue?"
                className="w-full bg-transparent p-6 text-lg font-medium text-white outline-none placeholder:text-white/10"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <button
                type="button"
                onClick={handleAiAssist}
                disabled={!formData.title || aiLoading}
                className="flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30"
              >
                {aiLoading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                {aiLoading ? "ANALYZING..." : "AI ENHANCE"}
              </button>
            </div>
            <textarea
              placeholder="Provide context, exact landmarks, or risk levels..."
              className="w-full bg-transparent p-6 text-sm text-white/60 outline-none resize-none min-h-[120px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Location Picker */}
          <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
              <MapPin size={24} />
            </div>
            <div className="flex-1 w-full">
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Impact Location</p>
              <p className="text-sm text-white font-medium truncate">{formData.address || "Detecting..."}</p>
            </div>
            <button
              type="button"
              onClick={detectLocation}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2"
            >
              {locationLoading ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />}
              REFRESH GPS
            </button>
          </div>

          {/* Submission */}
          <button
            type="submit"
            disabled={loading || !formData.title}
            className="w-full bg-white hover:bg-zinc-200 text-black h-16 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-30 shadow-2xl"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>SUBMIT TO MUNICIPALITY <ChevronRight /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportPage;
