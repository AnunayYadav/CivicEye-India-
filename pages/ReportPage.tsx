import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Loader2, Send } from 'lucide-react';
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

  // Auto-detect location on mount
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          },
          address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}` // Simplified address
        }));
        setLocationLoading(false);
      },
      (error) => {
        console.error("Error getting location", error);
        setLocationLoading(false);
        alert("Unable to retrieve your location. Please ensure GPS is enabled.");
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    setLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newProblem = {
      id: `usr_${Date.now()}`,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      location: formData.location,
      address: formData.address,
      imageUrl: formData.imageUrl || `https://picsum.photos/400/300?random=${Date.now()}`,
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
      // In a real app, upload to storage bucket here.
      // For demo, we just assume it worked and use a placeholder if empty
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Report an Issue</h1>
        <p className="text-slate-400">Help us make the city better by reporting local problems.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Category Selection */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.values(ProblemCategory).map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setFormData({...formData, category: cat})}
              className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                formData.category === cat
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Text Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
            <input
              type="text"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="e.g. Broken Streetlight"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea
              required
              rows={4}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Describe the issue in detail..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        {/* Location */}
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">Location</label>
            <button 
              type="button" 
              onClick={detectLocation}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <MapPin size={12} /> Detect Again
            </button>
          </div>
          <div className="flex items-center gap-3 text-slate-400 text-sm bg-slate-900/50 p-3 rounded border border-slate-800">
             {locationLoading ? (
               <Loader2 className="animate-spin text-blue-500" size={18} />
             ) : (
               <MapPin className="text-red-500 shrink-0" size={18} />
             )}
             <span className="truncate">
               {locationLoading ? "Fetching GPS..." : (formData.address || "Location not detected")}
             </span>
          </div>
        </div>

        {/* Image Upload Dummy */}
        <div>
           <label className="block text-sm font-medium text-slate-300 mb-2">Evidence Photo</label>
           <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 flex flex-col items-center justify-center text-slate-500 hover:border-slate-500 hover:bg-slate-800/50 transition cursor-pointer relative">
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <Camera size={32} className="mb-2" />
              <span className="text-sm">Tap to upload image</span>
           </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || locationLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <Send size={18} /> Submit Report
            </>
          )}
        </button>

      </form>
    </div>
  );
};

export default ReportPage;
