import React, { useEffect, useRef, useState } from 'react';
import { Problem, ProblemStatus, MapplsSuggestion } from '../types';
import { dataStore } from '../services/store';
import { INDIA_CENTER, DEFAULT_ZOOM } from '../constants';
import { Clock, Search, X } from 'lucide-react';
import { loadMapplsSDK, searchPlaces } from '../services/mapplsUtils';

interface MapViewProps {
  onProblemClick?: (problem: Problem) => void;
  focusedLocation?: { lat: number; lng: number } | null;
}

const MapView: React.FC<MapViewProps> = ({ onProblemClick, focusedLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const clusterLayer = useRef<any>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MapplsSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 1. Fetch Problems
  useEffect(() => {
    const fetchProblems = () => {
      setProblems(dataStore.getProblems());
    };
    fetchProblems();
    dataStore.addEventListener('updated', fetchProblems);
    return () => {
      dataStore.removeEventListener('updated', fetchProblems);
    };
  }, []);

  // 2. Load Mappls SDK
  useEffect(() => {
    loadMapplsSDK()
      .then(() => setIsMapLoaded(true))
      .catch((err) => setError(err.message || "Error loading maps"));
  }, []);

  // 3. Initialize Map
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || mapInstance.current) return;

    try {
        mapInstance.current = new window.mappls.Map(mapRef.current, {
            center: [INDIA_CENTER.lat, INDIA_CENTER.lng],
            zoom: DEFAULT_ZOOM,
            location: true,
            clickableIcons: false,
        });

        mapInstance.current.addListener('load', () => {
             renderMarkers();
        });

    } catch (e) {
        console.error("Map init error:", e);
    }
  }, [isMapLoaded]);

  // 4. Handle Markers & Clustering
  useEffect(() => {
      if (!mapInstance.current) return;
      renderMarkers();
  }, [problems]);

  // 5. Handle Focus Location
  useEffect(() => {
    if (mapInstance.current && focusedLocation) {
        mapInstance.current.flyTo({
            center: [focusedLocation.lat, focusedLocation.lng],
            zoom: 16,
            essential: true
        });
    }
  }, [focusedLocation]);

  // 6. Popup Event Listener
  useEffect(() => {
    const handlePopupClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const btn = target.closest('.view-problem-btn');
        if (btn && btn.hasAttribute('data-problem-id')) {
            e.preventDefault();
            const problemId = btn.getAttribute('data-problem-id');
            if (problemId) {
                const problem = dataStore.getProblemById(problemId);
                if (problem && onProblemClick) onProblemClick(problem);
            }
        }
    };
    const mapContainer = mapRef.current;
    if (mapContainer) mapContainer.addEventListener('click', handlePopupClick);
    return () => {
        if (mapContainer) mapContainer.removeEventListener('click', handlePopupClick);
    };
  }, [onProblemClick]);

  // Search Logic
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

  const handleSearchSelect = (s: MapplsSuggestion) => {
      setSearchQuery(s.placeName);
      setShowSuggestions(false);
      if (s.latitude && s.longitude && mapInstance.current) {
          mapInstance.current.flyTo({
              center: [s.latitude, s.longitude],
              zoom: 16
          });
          // Add temporary marker
          new window.mappls.Marker({
              map: mapInstance.current,
              position: { lat: s.latitude, lng: s.longitude },
              title: s.placeName
          });
      }
  };

  const renderMarkers = () => {
      if (!mapInstance.current || !window.mappls) return;

      if (clusterLayer.current) {
          try { mapInstance.current.removeLayer(clusterLayer.current); } catch(e) {}
          clusterLayer.current = null;
      }
      
      const mapplsMarkers = problems.map(problem => {
          let color = '#ef4444';
          if (problem.status === ProblemStatus.RESOLVED) color = '#10b981';
          if (problem.status === ProblemStatus.IN_PROGRESS) color = '#f59e0b';

          const html = `
            <div class="marker-container" style="cursor: pointer;">
                <div class="marker-glow" style="background-color: ${color}; box-shadow: 0 0 10px ${color};"></div>
            </div>
          `;

          return new window.mappls.Marker({
              position: { lat: problem.location.lat, lng: problem.location.lng },
              html: html,
              width: 20,
              height: 20,
              popupHtml: getPopupHtml(problem),
              title: problem.title
          });
      });

      if (mapplsMarkers.length > 0) {
          try {
            clusterLayer.current = new window.mappls.MarkerCluster({
                map: mapInstance.current,
                markers: mapplsMarkers,
                iconTheme: 'custom', 
                iconCreateFunction: (cluster: any) => {
                    const count = cluster.getChildCount();
                    return `<div class="custom-cluster-icon" style="width:40px; height:40px;">${count}</div>`;
                }
            });
          } catch (e) {
              mapplsMarkers.forEach(m => mapInstance.current.addLayer(m));
          }
      }
  };

  const getPopupHtml = (problem: Problem) => {
      const dateStr = new Date(problem.createdAt).toLocaleDateString();
      const statusDisplay = problem.status.replace('_', ' ');

      return `
        <div class="min-w-[200px] font-sans">
            <div class="relative h-32 w-full mb-3 overflow-hidden rounded-t-xl bg-zinc-800">
                <img src="${problem.imageUrl}" style="width:100%; height:100%; object-fit:cover;" />
                <div style="position:absolute; top:8px; right:8px; padding:4px 8px; border-radius:99px; font-size:10px; font-weight:bold; background:rgba(0,0,0,0.8); color:white; border:1px solid rgba(255,255,255,0.1); text-transform:uppercase;">
                    ${statusDisplay}
                </div>
            </div>
            <div style="padding: 12px;">
                <h3 style="font-weight:bold; color:#f1f5f9; font-size:14px; margin-bottom:4px; line-height:1.2;">${problem.title}</h3>
                <p style="font-size:12px; color:#94a3b8; margin-bottom:12px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${problem.description}</p>
                
                <div style="display:flex; align-items:center; justify-content:space-between; padding-top:8px; border-top:1px solid rgba(255,255,255,0.1);">
                    <span style="font-size:10px; color:#64748b;">${dateStr}</span>
                    <button class="view-problem-btn" data-problem-id="${problem.id}" style="background:#4f46e5; color:white; font-size:10px; font-weight:bold; padding:6px 12px; border-radius:6px; border:none; cursor:pointer;">VIEW</button>
                </div>
            </div>
        </div>
      `;
  };

  if (error) {
      return (
          <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center text-red-400 p-8 text-center">
              <p className="font-bold text-lg mb-2">Map Error</p>
              <p className="text-sm text-slate-500 font-mono">{error}</p>
              <p className="text-xs text-slate-600 mt-4">Check VITE_MAPPLS_JS_KEY in .env</p>
          </div>
      );
  }

  return (
    <div className="w-full h-full relative bg-black">
      <div ref={mapRef} id="map" className="w-full h-full z-0" style={{ background: '#000' }}></div>

      {/* Map Search Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[90%] md:w-[400px] z-[400]">
          <div className="relative group">
              <div className="absolute inset-0 bg-white/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2.5 shadow-2xl">
                  <Search size={16} className="text-white/50 mr-3" />
                  <input 
                    type="text" 
                    placeholder="Search city, area, or landmark..." 
                    className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-white/30"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="text-white/40 hover:text-white">
                          <X size={14} />
                      </button>
                  )}
              </div>
              
              {/* Autosuggest Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                      {suggestions.map((s, i) => (
                          <div 
                            key={i} 
                            onClick={() => handleSearchSelect(s)}
                            className="px-4 py-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-none flex flex-col"
                          >
                              <span className="text-sm font-bold text-white">{s.placeName}</span>
                              <span className="text-xs text-white/50 truncate">{s.placeAddress}</span>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>

      {!isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
              <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-indigo-500 tracking-widest animate-pulse">LOADING MAPPLS...</p>
              </div>
          </div>
      )}

      {/* Legend & Status Badges */}
      <div className="absolute top-4 right-4 z-[400] bg-black/60 backdrop-blur-xl border border-white/10 rounded-full pl-3 pr-4 py-1.5 flex items-center gap-2 shadow-2xl pointer-events-none hidden sm:flex">
        <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[10px] font-semibold text-slate-200 tracking-wide">LIVE SYSTEM</span>
      </div>
      
       <div className="absolute bottom-6 left-6 z-[400] bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl hidden sm:block pointer-events-none">
        <h4 className="text-[9px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Status Legend</h4>
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></div>
                <span className="text-[10px] text-slate-300 font-medium">Critical / Pending</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                <span className="text-[10px] text-slate-300 font-medium">Resolved</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
