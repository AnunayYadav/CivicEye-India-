
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import { Problem, ProblemStatus, MapplsSuggestion, ProblemCategory } from '../types';
import { dataStore } from '../services/store';
import { INDIA_CENTER, DEFAULT_ZOOM } from '../constants';
import { Search, X, Locate, Loader2, Filter, Flame, HardHat, Lightbulb, Trash2, Droplets, Waves, Bath, Home, Volume2, Dog, Info } from 'lucide-react';
import { searchPlaces } from '../services/mapUtils';
import { motion, AnimatePresence } from 'framer-motion';

interface MapViewProps {
  onProblemClick?: (problem: Problem) => void;
  focusedLocation?: { lat: number; lng: number } | null;
}

const getCategoryColor = (category: ProblemCategory): string => {
  switch (category) {
    case ProblemCategory.ROADS: return '#f97316';
    case ProblemCategory.STREET_LIGHT: return '#fbbf24';
    case ProblemCategory.GARBAGE: return '#10b981';
    case ProblemCategory.WATER_LEAK: return '#3b82f6';
    case ProblemCategory.DRAINAGE: return '#6366f1';
    case ProblemCategory.PUBLIC_TOILET: return '#ec4899';
    case ProblemCategory.CONSTRUCTION: return '#ef4444';
    case ProblemCategory.NOISE: return '#8b5cf6';
    case ProblemCategory.ANIMAL: return '#14b8a6';
    default: return '#9ca3af';
  }
};

const getCategoryIconSvg = (category: ProblemCategory): string => {
  const props = 'width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"';
  switch (category) {
    case ProblemCategory.ROADS: return `<svg ${props}><path d="M12 2v20"/><path d="M2 12h20"/><path d="m17 7-5-5-5 5"/><path d="m17 17-5 5-5-5"/></svg>`;
    case ProblemCategory.STREET_LIGHT: return `<svg ${props}><circle cx="12" cy="12" r="3"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
    case ProblemCategory.GARBAGE: return `<svg ${props}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;
    case ProblemCategory.WATER_LEAK: return `<svg ${props}><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>`;
    case ProblemCategory.DRAINAGE: return `<svg ${props}><path d="M2 12h20"/><path d="M7 12a5 5 0 0 1 10 0"/><path d="M12 7V2"/></svg>`;
    default: return `<svg ${props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
  }
};

const MapView: React.FC<MapViewProps> = ({ onProblemClick, focusedLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerLayer = useRef<L.LayerGroup | null>(null);
  const heatLayer = useRef<any>(null);

  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MapplsSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current, {
      center: [INDIA_CENTER.lat, INDIA_CENTER.lng],
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);

    markerLayer.current = L.layerGroup().addTo(mapInstance.current);
    setIsLoaded(true);

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const update = () => setProblems(dataStore.getProblems());
    update();
    dataStore.addEventListener('updated', update);
    return () => dataStore.removeEventListener('updated', update);
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !markerLayer.current) return;

    markerLayer.current.clearLayers();
    if (heatLayer.current) {
      mapInstance.current.removeLayer(heatLayer.current);
      heatLayer.current = null;
    }

    if (showHeatmap) {
      const heatPoints = problems.map(p => [p.location.lat, p.location.lng, p.urgency === 'HIGH' ? 1.0 : 0.6]);
      // @ts-ignore
      heatLayer.current = L.heatLayer(heatPoints, {
        radius: 25, blur: 15, maxZoom: 17,
        gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' }
      }).addTo(mapInstance.current);
    } else {
      problems.forEach(problem => {
        const color = getCategoryColor(problem.category);
        const isResolved = problem.status === ProblemStatus.RESOLVED || problem.status === ProblemStatus.CLOSED;

        const html = `
              <div class="custom-marker-wrapper">
                ${!isResolved ? `<div class="marker-pulse" style="background: ${color}; opacity: 0.6;"></div>` : ''}
                <div class="marker-base" style="background: ${isResolved ? '#10b981' : 'rgba(24, 24, 27, 0.9)'}; border-color: ${isResolved ? '#059669' : color}; color: ${isResolved ? '#fff' : color};">
                  <div class="marker-icon">${getCategoryIconSvg(problem.category)}</div>
                </div>
                ${isResolved ? '<div class="status-badge">✓</div>' : ''}
              </div>
            `;

        const icon = L.divIcon({
          html: html,
          className: 'custom-leaflet-marker',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          popupAnchor: [0, -18]
        });

        const popupHtml = `
              <div class="w-64 bg-[#050505] rounded-[24px] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,1)]">
                <div class="relative h-28">
                  <img src="${problem.imageUrl}" class="w-full h-full object-cover grayscale" />
                  <div class="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent"></div>
                  <div class="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/50 backdrop-blur-md border border-white/5 text-[8px] font-black text-white/40 uppercase tracking-widest">${problem.id}</div>
                </div>
                <div class="p-4 pt-1">
                  <h3 class="text-white font-black text-sm mb-1 line-clamp-1">${problem.title}</h3>
                  <div class="flex items-center gap-2 mb-3">
                    <div class="w-2 h-2 rounded-full" style="background: ${color}"></div>
                    <span class="text-[9px] text-white/40 uppercase font-black tracking-widest">${problem.category}</span>
                  </div>
                  <div class="flex items-center justify-between pt-3 border-t border-white/5">
                    <div class="flex flex-col">
                        <span class="text-[7px] font-black text-white/20 uppercase">STATUS_PROTOCOL</span>
                        <span class="text-[9px] font-black uppercase ${isResolved ? 'text-emerald-500' : 'text-indigo-500'}">
                            ${problem.status}
                        </span>
                    </div>
                    <button class="text-[8px] font-black bg-white/5 hover:bg-white text-white hover:text-black px-3 py-1.5 rounded-lg transition-all uppercase tracking-widest">Observe</button>
                  </div>
                </div>
              </div>
            `;

        L.marker([problem.location.lat, problem.location.lng], { icon })
          .bindPopup(popupHtml, { className: 'premium-map-popup', minWidth: 260, offset: [0, -10] })
          .addTo(markerLayer.current!);
      });
    }
  }, [problems, showHeatmap]);

  useEffect(() => {
    if (mapInstance.current && focusedLocation) {
      mapInstance.current.flyTo([focusedLocation.lat, focusedLocation.lng], 16, { animate: true, duration: 1.5 });
    }
  }, [focusedLocation]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 2) {
        const res = await searchPlaces(searchQuery);
        setSuggestions(res);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="w-full h-full relative bg-black overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />

      {/* Modern Search Hub */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[90%] md:w-[600px] z-[1000] flex gap-3">
        <div className="flex-1 relative group">
          <div className="bg-zinc-950/80 backdrop-blur-3xl border border-white/10 rounded-[28px] flex items-center px-6 py-4 shadow-2xl transition-all focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500/30">
            <Search size={20} className="text-white/20 mr-4" />
            <input
              type="text"
              placeholder="Search Spatial Hub / Cities / Signals..."
              className="bg-transparent border-none outline-none text-white text-sm font-bold w-full placeholder-white/10 italic"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Locate onClick={() => { if (navigator.geolocation) navigator.geolocation.getCurrentPosition(pos => mapInstance.current?.flyTo([pos.coords.latitude, pos.coords.longitude], 15)) }} size={18} className="text-white/20 hover:text-white cursor-pointer ml-2" />
          </div>

          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                className="absolute mt-3 w-full bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden max-h-72 overflow-y-auto custom-scrollbar z-50"
              >
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setSearchQuery(s.placeName); setShowSuggestions(false); if (s.latitude && s.longitude) mapInstance.current?.flyTo([s.latitude, s.longitude], 16) }}
                    className="w-full px-6 py-4 hover:bg-white/5 text-left border-b border-white/5 last:border-none group flex items-start gap-4 transition-all"
                  >
                    <div className="mt-1.5 w-1.5 h-4 bg-indigo-500/20 group-hover:bg-indigo-500 rounded-full transition-all" />
                    <div>
                      <div className="text-xs font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{s.placeName}</div>
                      <div className="text-[10px] text-white/20 font-bold truncate max-w-[400px]">{s.placeAddress}</div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`px-6 py-4 rounded-[28px] border flex items-center justify-center transition-all duration-500 backdrop-blur-3xl shadow-2xl ${showHeatmap
            ? 'bg-orange-500 text-white border-orange-400 shadow-orange-500/20'
            : 'bg-zinc-950/80 border-white/10 text-white/40 hover:text-white hover:border-white/30'
            }`}
        >
          <Flame size={20} className={showHeatmap ? 'animate-pulse' : ''} />
          <span className="ml-3 text-[10px] font-black uppercase tracking-widest hidden md:block">Heat Nexus</span>
        </button>
      </div>

      <div className="absolute bottom-24 left-8 md:bottom-12 md:left-12 z-[1000] hidden lg:block">
        <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/5 rounded-[32px] p-6 shadow-2xl flex items-center gap-10">
          <div className="flex flex-col gap-1 pr-6 border-r border-white/5">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Signal Legend</span>
            <span className="text-xs font-black text-white italic">Spectral Index</span>
          </div>
          <div className="flex items-center gap-8">
            {[ProblemCategory.ROADS, ProblemCategory.GARBAGE, ProblemCategory.WATER_LEAK, ProblemCategory.STREET_LIGHT].map(cat => (
              <div key={cat} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_12px_currentColor]" style={{ background: getCategoryColor(cat), color: getCategoryColor(cat) }} />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{cat.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!isLoaded && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-[2000]">
          <div className="w-20 h-20 border-[3px] border-white/5 border-t-indigo-500 rounded-full animate-spin" />
          <p className="mt-8 text-[11px] font-black text-white tracking-[0.5em] uppercase animate-pulse">Establishing Neural Link</p>
        </div>
      )}
    </div>
  );
};

export default MapView;
