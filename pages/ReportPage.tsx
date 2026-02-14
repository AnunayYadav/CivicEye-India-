
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Loader2, ChevronRight, Sparkles, Zap, Hash, Target, ClipboardList } from 'lucide-react';
import { ProblemCategory, ProblemStatus } from '../types';
import { dataStore } from '../services/store';
import { reverseGeocode } from '../services/mapUtils';
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';

const ReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
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
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        const address = await reverseGeocode(lat, lng);
        setFormData(prev => ({ ...prev, location: { lat, lng }, address }));
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
        model: 'gemini-2.0-flash',
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full overflow-y-auto bg-black p-4 md:p-8 pb-32 custom-scrollbar"
    >
      <div className="max-w-3xl mx-auto space-y-12 mt-12">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-500/20">
              <ClipboardList size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">Citizen Report</h1>
              <p className="text-white/40 text-sm font-medium">Contribute to India's infrastructure evolution.</p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Categorization */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-white/20 uppercase text-[10px] font-black tracking-widest px-1">
              <Hash size={12} />
              <span>Select Category</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.values(ProblemCategory).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat })}
                  className={`p-6 rounded-3xl text-left border-2 transition-all group ${formData.category === cat
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_30px_rgba(79,70,229,0.3)]'
                    : 'bg-zinc-900 border-white/5 text-white/40 hover:border-white/10 hover:text-white'
                    }`}
                >
                  <div className={`text-[10px] uppercase font-black tracking-widest opacity-60 mb-2 transition-transform ${formData.category === cat ? 'translate-x-1' : ''}`}>{cat}</div>
                  <div className="text-sm font-bold truncate">Issue detected</div>
                </button>
              ))}
            </div>
          </section>

          {/* Details Input */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-white/20 uppercase text-[10px] font-black tracking-widest px-1">
              <Target size={12} />
              <span>Problem Intelligence</span>
            </div>
            <div className="bg-zinc-900 border-2 border-white/5 rounded-[32px] overflow-hidden transition-all focus-within:border-indigo-500/50 shadow-2xl">
              <div className="flex items-center border-b-2 border-white/5 pr-6 bg-white/[0.02]">
                <input
                  type="text"
                  placeholder="Briefly describe the observation..."
                  className="w-full bg-transparent p-8 text-xl font-bold text-white outline-none placeholder:text-white/10"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <button
                  type="button"
                  onClick={handleAiAssist}
                  disabled={!formData.title || aiLoading}
                  className="flex items-center gap-2 bg-indigo-500 text-white px-5 py-3 rounded-2xl text-[10px] font-black tracking-wider transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:scale-100 shadow-xl shadow-indigo-600/20"
                >
                  {aiLoading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                  {aiLoading ? "PROCESSING" : "AI ENHANCE"}
                </button>
              </div>
              <textarea
                placeholder="Provide context, exact landmarks, or risk levels for municipal officials..."
                className="w-full bg-transparent p-8 text-base text-white/60 outline-none resize-none min-h-[160px] leading-relaxed"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </section>

          {/* Location Picker with GPS visibility */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-white/20 uppercase text-[10px] font-black tracking-widest px-1">
              <MapPin size={12} />
              <span>Spatial telemetry</span>
            </div>
            <div className="bg-zinc-900 border-2 border-white/5 rounded-[32px] p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
              <div className="w-16 h-16 bg-emerald-500 text-black rounded-[20px] flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                <MapPin size={32} strokeWidth={2.5} />
              </div>
              <div className="flex-1 w-full space-y-2">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Verified Position</p>
                <p className="text-lg text-white font-bold leading-tight">{formData.address || "Resolving address..."}</p>
                <div className="flex items-center gap-4 text-emerald-500/60 font-mono text-[11px] font-bold p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10 inline-block w-fit">
                  <div className="flex items-center gap-1">
                    <span className="opacity-50 text-[9px]">LAT:</span>
                    <span>{formData.location.lat.toFixed(6) || "---"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="opacity-50 text-[9px]">LNG:</span>
                    <span>{formData.location.lng.toFixed(6) || "---"}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={detectLocation}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white text-xs font-black rounded-2xl transition-all flex items-center gap-3 border border-white/5 active:scale-95"
              >
                {locationLoading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                SYNC GPS
              </button>
            </div>
          </section>

          {/* Submission */}
          <button
            type="submit"
            disabled={loading || !formData.title}
            className="group relative w-full h-20 rounded-[32px] font-black text-xl flex items-center justify-center gap-4 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-white group-hover:bg-zinc-100 transition-colors" />
            <div className="relative flex items-center gap-3 text-black">
              {loading ? <Loader2 className="animate-spin" /> : <>TRANSMIT REPORT <ChevronRight className="group-hover:translate-x-1 transition-transform" strokeWidth={3} /></>}
            </div>
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default ReportPage;
