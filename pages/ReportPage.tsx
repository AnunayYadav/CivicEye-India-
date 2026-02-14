
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
        contents: `Report city problem: "${formData.title}". Return JSON: refinedTitle, professionalDescription, suggestedCategory, urgency.`,
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
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    setLoading(true);
    dataStore.addProblem({
      id: `rep_${Date.now()}`,
      ...formData,
      status: ProblemStatus.SUBMITTED,
      reportedBy: 'Citizen',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      upvotes: 0,
      imageUrl: `https://picsum.photos/800/600?random=${Date.now()}`,
      timeline: [{ id: `ev_1`, status: ProblemStatus.SUBMITTED, user: 'Citizen', note: 'Logged.', timestamp: Date.now() }]
    } as any);
    navigate('/');
  };

  return (
    <div className="h-full overflow-y-auto bg-black p-4 md:p-10 pb-32 custom-scrollbar flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-10 mt-10">
        <header className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 border border-white/5">
            <ClipboardList size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase italic tracking-tighter">Log Incident</h1>
            <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Protocol Input v2.0</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.values(ProblemCategory).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat })}
                className={`px-3 py-2.5 rounded-lg border text-[10px] font-bold text-left transition-all ${formData.category === cat ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-zinc-900 border-white/5 text-white/30'
                  }`}
              >
                {cat}
              </button>
            ))}
          </section>

          <section className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center border-b border-white/5 pr-4 bg-white/[0.01]">
              <input
                type="text"
                placeholder="SUBJECT..."
                className="flex-1 bg-transparent p-4 text-sm font-bold text-white outline-none placeholder:text-white/5"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <button
                type="button"
                onClick={handleAiAssist}
                disabled={!formData.title || aiLoading}
                className="flex items-center gap-2 bg-indigo-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase disabled:opacity-30"
              >
                {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Refine
              </button>
            </div>
            <textarea
              placeholder="DETAILS & OBSERVATIONS..."
              className="w-full bg-transparent p-4 text-xs font-medium text-white/40 outline-none resize-none min-h-[100px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </section>

          <section className="flex flex-wrap gap-2">
            {['LOW', 'MEDIUM', 'HIGH'].map(level => (
              <button
                key={level}
                type="button"
                onClick={() => setFormData({ ...formData, urgency: level as any })}
                className={`px-4 py-2 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${formData.urgency === level
                    ? 'bg-red-600/20 border-red-500 text-red-500'
                    : 'bg-zinc-900 border-white/5 text-white/20'
                  }`}
              >
                {level} PRIORITY
              </button>
            ))}
          </section>

          <footer className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={12} className="text-emerald-500" />
                <span className="text-[10px] font-black uppercase text-white/20">Spatial Lock</span>
              </div>
              <p className="text-[11px] font-bold text-white truncate">{formData.address || "Acquiring..."}</p>
            </div>
            <button
              type="submit"
              disabled={loading || !formData.title}
              className="bg-white text-black px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-tighter hover:scale-105 transition-all disabled:opacity-20"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : "Transmit Signal"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default ReportPage;
