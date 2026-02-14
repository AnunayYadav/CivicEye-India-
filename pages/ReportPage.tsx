
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Loader2, ChevronRight, Sparkles, Zap, Hash, Target, ClipboardList, AlertTriangle } from 'lucide-react';
import { ProblemCategory, ProblemStatus, Department } from '../types';
import { dataStore, userStore } from '../services/store';
import { reverseGeocode } from '../services/mapUtils';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, CheckCircle, AlertCircle as AlertIcon } from 'lucide-react';

const ReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);

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

  const fileToGenerativePart = async (file: File) => {
    const base64Promise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
    const base64Data = await base64Promise as string;
    return {
      inlineData: {
        data: base64Data.split(',')[1],
        mimeType: file.type
      }
    };
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    // AI Intelligent Triage
    setAiLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const imagePart = await fileToGenerativePart(file);
      const prompt = "Act as an expert civic engineer. Analyze this image of a civic issue. Return ONLY a JSON object with keys: title (short, technical), description (detailed, professional), category (must be one of: Road Damage, Street Light Issue, Garbage Problem, Water Leakage, Drainage Block, Public Toilet Damage, Illegal Construction, Noise Complaint, Animal Issue), urgency (LOW, MEDIUM, or HIGH).";

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      const analysis = JSON.parse(text);

      setFormData(prev => ({
        ...prev,
        title: analysis.title,
        description: analysis.description,
        category: analysis.category as ProblemCategory,
        urgency: analysis.urgency as any
      }));

      // Mock Duplicate Detection
      if (analysis.category === 'Garbage Problem') setIsDuplicate(true);
    } catch (error) {
      console.error("AI Analysis failed:", error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    setLoading(true);

    let finalImageUrl = 'https://images.unsplash.com/photo-1594498653385-d5172b532c00?q=80&w=1000';

    if (imageFile) {
      try {
        const imageRef = ref(storage, `reports/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        finalImageUrl = await getDownloadURL(imageRef);
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }

    const user = userStore.getCurrentUser();

    await dataStore.addProblem({
      ...formData,
      imageUrl: finalImageUrl,
      reportedBy: user.id,
      reporterTrustScore: user.trustScore,
      upvotes: 0,
      validationCount: 0,
      verifiedByGuardians: [],
      comments: [],
      timeline: [] // Store logic handles initial timeline
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
            <h1 className="text-xl font-black uppercase italic tracking-tighter">Smart Report Protocol</h1>
            <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Powered by Gemini AI</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* AI Image Upload Section */}
          <section className="relative group">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="image-upload"
              onChange={handleImageChange}
            />
            <label
              htmlFor="image-upload"
              className={`block w-full h-64 rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${imagePreview ? 'border-indigo-500/50' : 'border-white/5 bg-zinc-900/50 hover:bg-zinc-900 hover:border-white/20'
                }`}
            >
              {imagePreview ? (
                <div className="relative h-full w-full">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera size={32} className="text-white" />
                  </div>
                  {aiLoading && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-4">
                      <div className="w-12 h-12 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Gemini Scanning...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-white/20">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                    <ImageIcon size={32} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold uppercase tracking-widest text-white/40">Upload Visual Data</p>
                    <p className="text-[10px] font-medium tracking-tighter mt-1">AI will automatically triage the issue</p>
                  </div>
                </div>
              )}
            </label>
            {isDuplicate && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute -top-4 -right-4 bg-orange-500 text-white p-3 rounded-2xl shadow-xl flex items-center gap-2 z-10 border border-orange-400"
              >
                <AlertIcon size={16} />
                <span className="text-[10px] font-black uppercase tracking-tight">Probable Duplicate Detected</span>
              </motion.div>
            )}
          </section>

          <section className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.values(ProblemCategory).map((cat) => (
              <button
                key={cat}
                type="button"
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
                placeholder="SUBJECT (AI AUTO-GENERATED)..."
                className="flex-1 bg-transparent p-4 text-sm font-bold text-white outline-none placeholder:text-white/5"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              {formData.title && !aiLoading && (
                <div className="text-emerald-500 flex items-center gap-1">
                  <CheckCircle size={14} />
                  <span className="text-[8px] font-black uppercase">Verified</span>
                </div>
              )}
            </div>
            <textarea
              placeholder="DETAILED OBSERVATIONS..."
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
              className="bg-white text-black px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-tighter hover:scale-105 transition-all shadow-xl shadow-white/5 disabled:opacity-20 flex items-center gap-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} fill="currentColor" />}
              {loading ? "TRANSMITTING..." : "PUBLISH SIGNAL"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default ReportPage;
