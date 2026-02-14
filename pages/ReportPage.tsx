
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Loader2, ChevronRight, Sparkles, Zap, Hash, Target, ClipboardList, AlertTriangle } from 'lucide-react';
import { ProblemCategory, ProblemStatus, Department } from '../types';
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
    address: '',
    urgency: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH'
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
        3. "suggestedCategory": One of: ${Object.values(ProblemCategory).join(', ')}.
        4. "urgency": Either "LOW", "MEDIUM", or "HIGH" based on safety and necessity.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              refinedTitle: { type: Type.STRING },
              professionalDescription: { type: Type.STRING },
              suggestedCategory: { type: Type.STRING },
              urgency: { type: Type.STRING },
            },
            required: ["refinedTitle", "professionalDescription", "suggestedCategory", "urgency"]
          }
        }
      });

      const result = JSON.parse(response.text);
      setFormData(prev => ({
        ...prev,
        title: result.refinedTitle,
        description: result.professionalDescription,
        category: result.suggestedCategory as ProblemCategory,
        urgency: (['LOW', 'MEDIUM', 'HIGH'].includes(result.urgency) ? result.urgency : 'MEDIUM') as any
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
      status: ProblemStatus.SUBMITTED,
      reportedBy: 'Citizen User',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      upvotes: 0,
      imageUrl: formData.imageUrl || `https://picsum.photos/800/600?random=${Date.now()}`,
      timeline: [
        {
          id: `ev_${Date.now()}`,
          status: ProblemStatus.SUBMITTED,
          user: 'Citizen User',
          note: 'Incident logged and transmitted to central node.',
          timestamp: Date.now()
        }
      ]
    };

    dataStore.addProblem(newProblem as any);
    setLoading(false);
    navigate('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full h-full overflow-y-auto bg-[#050505] p-4 md:p-8 pb-32 custom-scrollbar"
    >
      <div className="max-w-4xl mx-auto space-y-12 mt-12 pb-20">
        <header className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/[0.03] rounded-[24px] flex items-center justify-center text-indigo-500 border border-white/5 shadow-2xl">
              <ClipboardList size={32} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 text-indigo-400">
                <Sparkles size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Protocol Input</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">Log Incident</h1>
              <p className="text-white/40 text-sm font-bold">Transmitting real-time civic diagnostics to the grid.</p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">

          {/* Categorization Matrix */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Category Matrix</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.values(ProblemCategory).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat })}
                  className={`p-4 rounded-2xl text-left border transition-all duration-300 ${formData.category === cat
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-600/30 ring-2 ring-indigo-500/20'
                    : 'bg-zinc-950 border-white/5 text-white/20 hover:border-white/20 hover:text-white'
                    }`}
                >
                  <p className="text-[9px] font-black uppercase tracking-tighter mb-1 opacity-60">CAT_{cat.slice(0, 3).toUpperCase()}</p>
                  <div className="text-[11px] font-black leading-tight">{cat}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Intelligence & Urgency */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Problem Intelligence</p>
              </div>
              <div className="bg-zinc-950 border border-white/5 rounded-[32px] overflow-hidden focus-within:border-indigo-500/30 transition-all shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center border-b border-white/5 bg-white/[0.01]">
                  <input
                    type="text"
                    placeholder="INCIDENT TITLE..."
                    className="flex-1 bg-transparent p-6 text-lg font-black text-white outline-none placeholder:text-white/10 italic"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                  <div className="px-6 py-4 border-t md:border-t-0 md:border-l border-white/5 flex items-center justify-between gap-4">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest hidden md:block">Process Signal</span>
                    <button
                      type="button"
                      onClick={handleAiAssist}
                      disabled={!formData.title || aiLoading}
                      className="flex items-center gap-3 bg-indigo-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-indigo-500 active:scale-95 disabled:opacity-20 shadow-lg shadow-indigo-600/20"
                    >
                      {aiLoading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                      {aiLoading ? "Analysing" : "AI Refine"}
                    </button>
                  </div>
                </div>
                <textarea
                  placeholder="Detailed diagnostics. Mention proximity to landmarks, risk profiles, and observed impact..."
                  className="w-full bg-transparent p-8 text-sm font-medium text-white/50 outline-none resize-none min-h-[140px] leading-relaxed custom-scrollbar"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-red-500 rounded-full" />
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Risk Profile</p>
              </div>
              <div className="bg-zinc-950 border border-white/5 rounded-[32px] p-6 space-y-4 shadow-2xl">
                {['LOW', 'MEDIUM', 'HIGH'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, urgency: level as any })}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${formData.urgency === level
                        ? level === 'HIGH' ? 'bg-red-500 border-red-400 text-white shadow-lg' : 'bg-indigo-600 border-indigo-400 text-white shadow-lg'
                        : 'bg-white/[0.02] border-white/5 text-white/40 hover:border-white/20'
                      }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">{level} PRIORITY</span>
                    {formData.urgency === level && <AlertTriangle size={14} className={level === 'HIGH' ? 'animate-pulse' : ''} />}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Telemetry Block */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Spatial Telemetry</p>
            </div>
            <div className="bg-zinc-950 border border-white/5 rounded-[32px] p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-emerald-500/[0.02] -z-10 group-hover:opacity-100 opacity-0 transition-opacity" />
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-[22px] flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Target size={32} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex-1 w-full space-y-3">
                <p className="text-[11px] text-white font-black leading-tight tracking-tight uppercase group-hover:text-emerald-400 transition-colors">
                  {formData.address || "Establishing Uplink..."}
                </p>
                <div className="flex flex-wrap gap-4 font-mono text-[10px] font-black text-emerald-500/60 transition-all">
                  <div className="flex items-center gap-2 bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/10">
                    <span className="opacity-30">LAT:</span>
                    <span>{formData.location.lat.toFixed(8)}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/10">
                    <span className="opacity-30">LNG:</span>
                    <span>{formData.location.lng.toFixed(8)}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={detectLocation}
                className="w-full md:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border border-white/10 active:scale-95 flex items-center justify-center gap-3"
              >
                {locationLoading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                RE-SYNC RADIUS
              </button>
            </div>
          </section>

          {/* Submission Control */}
          <button
            type="submit"
            disabled={loading || !formData.title}
            className="group relative w-full h-24 rounded-[40px] font-black text-2xl uppercase tracking-tighter flex items-center justify-center gap-4 transition-all overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 bg-white group-hover:bg-indigo-50 transition-colors" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <div className="relative flex items-center gap-4 text-black italic">
              {loading ? <Loader2 className="animate-spin" /> : <>Transmit Data <ChevronRight strokeWidth={4} className="group-hover:translate-x-2 transition-transform" /></>}
            </div>
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default ReportPage;
