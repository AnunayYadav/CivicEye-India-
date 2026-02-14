
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Problem, ProblemStatus, MapplsSuggestion, ProblemCategory } from '../types';
import { dataStore } from '../services/store';
import { INDIA_CENTER, DEFAULT_ZOOM } from '../constants';
import { Search, X, Locate, Loader2 } from 'lucide-react';
import { searchPlaces } from '../services/mapUtils';

interface MapViewProps {
  onProblemClick?: (problem: Problem) => void;
  focusedLocation?: { lat: number; lng: number } | null;
}

const getCategoryColor = (category: ProblemCategory): string => {
  switch (category) {
    case ProblemCategory.ROADS: return '#f97316';
    case ProblemCategory.GARBAGE: return '#eab308';
    case ProblemCategory.ELECTRICITY: return '#a855f7';
    case ProblemCategory.WATER: return '#3b82f6';
    case ProblemCategory.TRAFFIC: return '#ef4444';
    case ProblemCategory.OTHER: return '#9ca3af';
    default: return '#9ca3af';
  }
};

const getCategoryIconSvg = (category: ProblemCategory): string => {
  const props = 'width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"';
  switch (category) {
    case ProblemCategory.ROADS: return `<svg ${props}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`;
    case ProblemCategory.GARBAGE: return `<svg ${props}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`;
    case ProblemCategory.ELECTRICITY: return `<svg ${props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
    case ProblemCategory.WATER: return `<svg ${props}><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>`;
    case ProblemCategory.TRAFFIC: return `<svg ${props}><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3"/><circle cx="7" cy="15" r="1"/><circle cx="17" cy="15" r="1"/></svg>`;
    default: return `<svg ${props}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
  }
};

const MapView: React.FC<MapViewProps> = ({ onProblemClick, focusedLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerLayer = useRef<L.LayerGroup | null>(null);

  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MapplsSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current, {
      center: [INDIA_CENTER.lat, INDIA_CENTER.lng],
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd'
    }).addTo(mapInstance.current);

    markerLayer.current = L.layerGroup().addTo(mapInstance.current);
    setIsLoaded(true);

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  // Sync Problems
  useEffect(() => {
    setProblems(dataStore.getProblems());
    const handleUpdate = () => setProblems(dataStore.getProblems());
    dataStore.addEventListener('updated', handleUpdate);
    return () => dataStore.removeEventListener('updated', handleUpdate);
  }, []);

  // Update Markers
  useEffect(() => {
    if (!mapInstance.current || !markerLayer.current) return;

    markerLayer.current.clearLayers();

    problems.forEach(problem => {
      const color = getCategoryColor(problem.category);
      const isResolved = problem.status === ProblemStatus.RESOLVED;

      const html = `
        <div class="custom-marker-wrapper">
          ${!isResolved ? `<div class="marker-pulse" style="background: ${color}; opacity: 0.6;"></div>` : ''}
          <div class="marker-base" style="background: ${isResolved ? '#10b981' : 'rgba(24, 24, 27, 0.8)'}; border-color: ${isResolved ? '#059669' : color}; color: ${isResolved ? '#fff' : color};">
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
        <div class="w-60 bg-zinc-950 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <img src="${problem.imageUrl}" class="w-full h-24 object-cover" />
          <div class="p-3">
            <h3 class="text-white font-bold text-sm mb-1">${problem.title}</h3>
            <p class="text-white/40 text-[10px] mb-2">${problem.description.substring(0, 50)}...</p>
            <div class="flex items-center justify-between">
              <span class="text-[9px] font-black uppercase ${isResolved ? 'text-emerald-500' : 'text-red-500'}">
                ${problem.status}
              </span>
            </div>
          </div>
        </div>
      `;

      const marker = L.marker([problem.location.lat, problem.location.lng], { icon })
        .bindPopup(popupHtml, { className: 'premium-map-popup', minWidth: 240 })
        .on('click', () => onProblemClick?.(problem))
        .addTo(markerLayer.current!);
    });
  }, [problems, onProblemClick]);

  // Handle Focus
  useEffect(() => {
    if (mapInstance.current && focusedLocation) {
      mapInstance.current.flyTo([focusedLocation.lat, focusedLocation.lng], 16, { animate: true, duration: 1.5 });
    }
  }, [focusedLocation]);

  // Search Logic
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

  const handleSuggestionSelect = (s: MapplsSuggestion) => {
    setSearchQuery(s.placeName);
    setShowSuggestions(false);
    if (s.latitude && s.longitude && mapInstance.current) {
      mapInstance.current.flyTo([s.latitude, s.longitude], 16);
    }
  };

  const recenter = () => {
    if (navigator.geolocation && mapInstance.current) {
      navigator.geolocation.getCurrentPosition((pos) => {
        mapInstance.current?.flyTo([pos.coords.latitude, pos.coords.longitude], 15);
      });
    }
  };

  return (
    <div className="w-full h-full relative bg-black overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />

      {/* Search Overlay */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] md:w-[450px] z-[1000]">
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center px-4 py-3 shadow-2xl">
          <Search size={18} className="text-white/40 mr-3" />
          <input
            type="text"
            placeholder="Search global locations..."
            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-white/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-white/40 hover:text-white">
              <X size={16} />
            </button>
          )}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="mt-2 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
            {suggestions.map((s, i) => (
              <div
                key={i}
                onClick={() => handleSuggestionSelect(s)}
                className="px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-none group"
              >
                <div className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{s.placeName}</div>
                <div className="text-[10px] text-white/40 truncate">{s.placeAddress}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={recenter}
        className="absolute bottom-24 right-6 md:bottom-10 md:right-10 w-12 h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-2xl transition-all z-[1000]"
      >
        <Locate size={20} />
      </button>

      {!isLoaded && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-[2000]">
          <Loader2 className="animate-spin text-white mb-4" size={32} />
          <p className="text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">Initializing Open Maps</p>
        </div>
      )}
    </div>
  );
};

export default MapView;
