
import React, { useEffect, useRef, useState } from 'react';
import { Problem, ProblemStatus, MapplsSuggestion, ProblemCategory } from '../types';
import { dataStore } from '../services/store';
import { INDIA_CENTER, DEFAULT_ZOOM } from '../constants';
import { Clock, Search, X, LocateFixed, Loader2 } from 'lucide-react';
import { loadMapplsSDK, searchPlaces } from '../services/mapplsUtils';

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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const clusterLayer = useRef<any>(null);
  
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MapplsSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Sync with data store
  useEffect(() => {
    setProblems(dataStore.getProblems());
    const handleUpdate = () => setProblems(dataStore.getProblems());
    dataStore.addEventListener('updated', handleUpdate);
    return () => dataStore.removeEventListener('updated', handleUpdate);
  }, []);

  // Initialize Map
  useEffect(() => {
    let active = true;
    
    const init = async () => {
      try {
        await loadMapplsSDK();
        if (!active) return;
        
        // Final sanity check for container
        if (!mapContainerRef.current) return;

        mapInstance.current = new window.mappls.Map('map', {
          center: [INDIA_CENTER.lat, INDIA_CENTER.lng],
          zoom: DEFAULT_ZOOM,
          location: true,
          clickableIcons: false,
        });

        mapInstance.current.addListener('load', () => {
          setIsLoaded(true);
          renderMarkers();
        });
      } catch (err: any) {
        if (active) setError(err.message || "Failed to initialize map");
      }
    };

    init();
    return () => { active = false; };
  }, []);

  // Render Markers and Clusters
  const renderMarkers = () => {
    if (!mapInstance.current || !window.mappls) return;

    if (clusterLayer.current) {
      try { mapInstance.current.removeLayer(clusterLayer.current); } catch(e) {}
    }

    const markers = problems.map(problem => {
      const color = getCategoryColor(problem.category);
      const isResolved = problem.status === ProblemStatus.RESOLVED;
      
      const html = `
        <div class="custom-marker-wrapper">
          ${!isResolved ? `<div class="marker-pulse" style="background: ${color}; opacity: 0.6;"></div>` : ''}
          <div class="marker-base" style="background: ${isResolved ? '#10b981' : 'rgba(0,0,0,0.6)'}; border-color: ${isResolved ? '#059669' : color}; color: ${isResolved ? '#fff' : color};">
            <div class="marker-icon">${getCategoryIconSvg(problem.category)}</div>
          </div>
          ${isResolved ? '<div class="status-badge">✓</div>' : ''}
        </div>
      `;

      return new window.mappls.Marker({
        position: { lat: problem.location.lat, lng: problem.location.lng },
        html: html,
        width: 36,
        height: 36,
        popupHtml: getPopupHtml(problem),
        title: problem.title
      });
    });

    if (markers.length > 0) {
      try {
        clusterLayer.current = new window.mappls.MarkerCluster({
          map: mapInstance.current,
          markers: markers,
          iconTheme: 'custom',
          iconCreateFunction: (cluster: any) => {
            const count = cluster.getChildCount();
            return `<div class="custom-cluster-icon" style="width:40px; height:40px;">${count}</div>`;
          }
        });
      } catch (e) {
        markers.forEach(m => mapInstance.current.addLayer(m));
      }
    }
  };

  useEffect(() => {
    if (isLoaded) renderMarkers();
  }, [problems, isLoaded]);

  useEffect(() => {
    if (mapInstance.current && focusedLocation) {
      mapInstance.current.flyTo({
        center: [focusedLocation.lat, focusedLocation.lng],
        zoom: 16,
        essential: true
      });
    }
  }, [focusedLocation]);

  // Search Debounce
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
      mapInstance.current.flyTo({ center: [s.latitude, s.longitude], zoom: 16 });
    }
  };

  const getPopupHtml = (problem: Problem) => {
    const statusColor = problem.status === ProblemStatus.RESOLVED ? '#10b981' : '#ef4444';
    return `
      <div style="width: 240px; border-radius: 16px; overflow: hidden; background: #18181b;">
        <img src="${problem.imageUrl}" style="width: 100%; height: 120px; object-fit: cover;" />
        <div style="padding: 12px;">
          <h3 style="color: white; font-size: 14px; font-weight: 700; margin: 0 0 4px 0;">${problem.title}</h3>
          <p style="color: #a1a1aa; font-size: 11px; margin: 0 0 12px 0;">${problem.description.substring(0, 60)}...</p>
          <div style="display: flex; align-items: center; justify-content: space-between;">
             <span style="font-size: 9px; font-weight: 800; color: ${statusColor}; text-transform: uppercase;">${problem.status}</span>
             <button class="view-problem-btn" data-problem-id="${problem.id}" style="background: #4f46e5; color: white; border: none; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer;">VIEW DETAILS</button>
          </div>
        </div>
      </div>
    `;
  };

  const recenter = () => {
    if (navigator.geolocation && mapInstance.current) {
      navigator.geolocation.getCurrentPosition((pos) => {
        mapInstance.current.flyTo({
          center: [pos.coords.latitude, pos.coords.longitude],
          zoom: 15
        });
      });
    }
  };

  if (error) {
    return (
      <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
          <X size={32} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">GIS Subsystem Error</h2>
        <p className="text-white/50 text-sm max-w-xs">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-black">
      {/* The required #map div */}
      <div ref={mapContainerRef} id="map" className="w-full h-full" style={{ background: '#000' }}></div>

      {/* Search Interface */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] md:w-[450px] z-10">
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center px-4 py-3 shadow-2xl">
          <Search size={18} className="text-white/40 mr-3" />
          <input 
            type="text" 
            placeholder="Search location..."
            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-white/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="mt-2 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
            {suggestions.map((s, i) => (
              <div 
                key={i} 
                onClick={() => handleSuggestionSelect(s)}
                className="px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-none"
              >
                <div className="text-sm font-bold text-white">{s.placeName}</div>
                <div className="text-[10px] text-white/40 truncate">{s.placeAddress}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recenter Button */}
      <button 
        onClick={recenter}
        className="absolute bottom-24 right-6 md:bottom-10 md:right-10 w-12 h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-2xl transition-all z-10"
      >
        <LocateFixed size={20} />
      </button>

      {!isLoaded && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-50">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
            </div>
          </div>
          <p className="mt-4 text-[10px] font-bold text-indigo-400 tracking-[0.2em] uppercase">Initializing Mappls GIS</p>
        </div>
      )}
    </div>
  );
};

export default MapView;
