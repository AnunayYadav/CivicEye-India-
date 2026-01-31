import React, { useEffect, useRef, useState } from 'react';
import { Problem, ProblemStatus } from '../types';
import { dataStore } from '../services/store';
import { INDIA_CENTER, DEFAULT_ZOOM } from '../constants';
import { Clock } from 'lucide-react';

// Declaration for Mappls on window
declare global {
  interface Window {
    mappls: any;
  }
}

interface MapViewProps {
  onProblemClick?: (problem: Problem) => void;
  focusedLocation?: { lat: number; lng: number } | null;
}

const MapView: React.FC<MapViewProps> = ({ onProblemClick, focusedLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const clusterLayer = useRef<any>(null); // For Mappls Marker Cluster
  const markersRef = useRef<any[]>([]); // Keep track of markers
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // 2. Load Mappls SDK Script
  useEffect(() => {
    if (window.mappls) {
      setIsMapLoaded(true);
      return;
    }

    const key = (import.meta as any).env.VITE_MAPPLS_JS_KEY;
    
    if (!key) {
      setError("Mappls API Key not found in environment variables (VITE_MAPPLS_JS_KEY)");
      return;
    }

    const loadScript = async () => {
      try {
        // Load Main Map SDK
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = `https://apis.mappls.com/advancedmaps/api/${key}/map_sdk?layer=vector&v=3.0`;
          script.async = true;
          script.defer = true;
          script.onload = resolve;
          script.onerror = () => reject(new Error("Failed to load Mappls Map SDK"));
          document.head.appendChild(script);
        });

        // Load Plugins (required for clustering if not in main bundle, usually safe to load)
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `https://apis.mappls.com/advancedmaps/api/${key}/map_sdk_plugins?v=3.0`;
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error("Failed to load Mappls Plugins"));
            document.head.appendChild(script);
        });

        setIsMapLoaded(true);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error loading maps");
      }
    };

    loadScript();
  }, []);

  // 3. Initialize Map
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || mapInstance.current) return;

    try {
        // Initialize Map
        mapInstance.current = new window.mappls.Map(mapRef.current, {
            center: [INDIA_CENTER.lat, INDIA_CENTER.lng],
            zoom: DEFAULT_ZOOM,
            location: true, // Show user location
            clickableIcons: false,
        });

        mapInstance.current.addListener('load', () => {
             // Map Loaded fully
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

  const renderMarkers = () => {
      if (!mapInstance.current || !window.mappls) return;

      // Clear existing layer if it exists
      if (clusterLayer.current) {
          // Check documentation for remove logic, often setMap(null) or remove()
          try {
             mapInstance.current.removeLayer(clusterLayer.current);
          } catch(e) {/* ignore */}
          clusterLayer.current = null;
      }
      
      // Clear individual markers if we tracked them
      // In Mappls clustering, we pass an array of markers to the clusterer
      
      const mapplsMarkers = problems.map(problem => {
          // Status Color
          let color = '#ef4444'; // Red
          if (problem.status === ProblemStatus.RESOLVED) color = '#10b981'; // Green
          if (problem.status === ProblemStatus.IN_PROGRESS) color = '#f59e0b'; // Orange

          // Create Marker HTML
          const html = `
            <div class="marker-container" style="cursor: pointer;">
                <div class="marker-glow" style="background-color: ${color}; box-shadow: 0 0 10px ${color};"></div>
            </div>
          `;

          // Create Marker
          const marker = new window.mappls.Marker({
              position: { lat: problem.location.lat, lng: problem.location.lng },
              html: html,
              width: 20,
              height: 20,
              popupHtml: getPopupHtml(problem),
              title: problem.title
          });
          
          // Add click listener to bridge to React
          // Note: Mappls markers might consume the click event for the popup.
          // We can listen to 'click' on the marker object
          marker.addListener('click', () => {
              // We can still trigger the React state update
              // But we let Mappls handle the popup display
          });
          
          // Hack to hook into the "View" button inside the popup
          // Since popup HTML is just string, we need to delegate event or bind it globally
          // A simple way is to use a global function or rely on the "More Details" pattern
          
          return marker;
      });

      if (mapplsMarkers.length > 0) {
          // Initialize Marker Cluster
          // Mappls SDK v3 syntax for MarkerCluster
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
            
            // Interaction: Zoom on cluster click is usually default in Mappls Cluster
          } catch (e) {
              console.error("Cluster init failed", e);
              // Fallback: just add markers to map
              mapplsMarkers.forEach(m => mapInstance.current.addLayer(m));
          }
      }
  };

  // Helper to generate Popup HTML string
  const getPopupHtml = (problem: Problem) => {
      const dateStr = new Date(problem.createdAt).toLocaleDateString();
      const statusDisplay = problem.status.replace('_', ' ');
      
      // Note: We use onClick="window.handleProblemView(...)" pattern or similar if we want interactivity
      // For now, let's keep it simple. The user can click the marker, see the popup. 
      // To get to the detail page, they can click the marker, then we trigger `onProblemClick`?
      // Actually, standard markers open popup. We need a button in popup.
      
      // We'll attach a unique ID to the button and listen on document body, or simpler:
      // Expose a global function for the popup button to call.
      
      (window as any)[`viewProblem_${problem.id}`] = () => {
          if (onProblemClick) onProblemClick(problem);
      };

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
                    <button 
                        onclick="window.viewProblem_${problem.id}()"
                        style="background:#4f46e5; color:white; font-size:10px; font-weight:bold; padding:6px 12px; border-radius:6px; border:none; cursor:pointer;"
                    >
                        VIEW
                    </button>
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
      {/* Map Container */}
      <div 
        ref={mapRef} 
        id="map" 
        className="w-full h-full z-0" 
        style={{ background: '#000' }}
      ></div>

      {!isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
              <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-indigo-500 tracking-widest animate-pulse">LOADING MAPPLS...</p>
              </div>
          </div>
      )}

      {/* Modern Status Badge */}
      <div className="absolute top-6 right-6 z-[400] bg-black/60 backdrop-blur-xl border border-white/10 rounded-full pl-3 pr-4 py-2 flex items-center gap-3 shadow-2xl">
        <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-semibold text-slate-200 tracking-wide">
           LIVE SYSTEM
        </span>
      </div>
      
      {/* Legend */}
       <div className="absolute bottom-8 left-8 z-[400] bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl hidden sm:block">
        <h4 className="text-[10px] font-bold text-slate-500 mb-3 uppercase tracking-widest">Status Legend</h4>
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></div>
                <span className="text-xs text-slate-300 font-medium">Critical / Pending</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                <span className="text-xs text-slate-300 font-medium">Resolved</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;