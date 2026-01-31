import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { Problem, ProblemStatus } from '../types';
import { dataStore } from '../services/store';
import { INDIA_CENTER, DEFAULT_ZOOM, TILE_LAYER_URL, TILE_ATTRIBUTION } from '../constants';
import { MapPin, Navigation, Clock, CheckCircle, AlertCircle } from 'lucide-react';

// --- Helper Functions for Icons ---

// We use L.divIcon to render custom HTML markers with Tailwind classes
const createClusterCustomIcon = function (cluster: any) {
  return L.divIcon({
    html: `<span class="custom-cluster-icon w-10 h-10 flex items-center justify-center bg-red-500/90 text-white rounded-full border-2 border-red-200 font-bold shadow-lg text-sm">${cluster.getChildCount()}</span>`,
    className: 'custom-marker-cluster',
    iconSize: L.point(40, 40, true),
  });
};

const createProblemIcon = (status: ProblemStatus) => {
  // Use a simple div with CSS animation for the pulse effect
  return L.divIcon({
    html: `<div class="marker-pulse"></div>`,
    className: '', // classes handled in html
    iconSize: L.point(14, 14, true),
  });
};

// --- Sub-components ---

// Controls map position when a new report is added or clicked
const MapController: React.FC<{ center: [number, number] | null }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

// --- Main Map Component ---

interface MapViewProps {
  onProblemClick?: (problem: Problem) => void;
  focusedLocation?: [number, number] | null;
}

const MapView: React.FC<MapViewProps> = ({ onProblemClick, focusedLocation }) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  // Subscribe to store updates
  useEffect(() => {
    const fetchProblems = () => {
      setProblems(dataStore.getProblems());
      setLastUpdated(Date.now());
    };

    fetchProblems();

    const handleUpdate = () => {
      console.log("Map received real-time update signal");
      fetchProblems();
    };

    dataStore.addEventListener('updated', handleUpdate);
    return () => {
      dataStore.removeEventListener('updated', handleUpdate);
    };
  }, []);

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={INDIA_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution={TILE_ATTRIBUTION}
          url={TILE_LAYER_URL}
        />

        <MapController center={focusedLocation} />

        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterCustomIcon}
          maxClusterRadius={60} // Tweak this for zoom logic: smaller = breaks apart sooner
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
        >
          {problems.map((problem) => (
            <Marker
              key={problem.id}
              position={[problem.location.lat, problem.location.lng]}
              icon={createProblemIcon(problem.status)}
            >
              <Popup className="custom-popup">
                <div className="min-w-[200px] p-1">
                  <div className="relative h-32 w-full mb-2 overflow-hidden rounded-md bg-slate-200">
                     <img 
                        src={problem.imageUrl} 
                        alt={problem.title} 
                        className="object-cover w-full h-full"
                      />
                     <div className="absolute top-1 right-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white uppercase opacity-80">
                        {problem.status}
                     </div>
                  </div>
                  <h3 className="font-bold text-slate-900 leading-tight">{problem.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-2 line-clamp-2">{problem.description}</p>
                  
                  <div className="flex items-center justify-between mt-3">
                     <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock size={10} /> {new Date(problem.createdAt).toLocaleDateString()}
                     </span>
                     <button
                        onClick={() => onProblemClick && onProblemClick(problem)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded transition-colors"
                     >
                        Details
                     </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Real-time indicator overlay */}
      <div className="absolute top-4 right-4 z-[400] bg-slate-800/90 backdrop-blur border border-slate-700 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-xl">
        <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <span className="text-xs font-medium text-slate-200">
           Live Updates Active
        </span>
      </div>
      
      {/* Legend Overlay */}
       <div className="absolute bottom-6 left-6 z-[400] bg-slate-800/90 backdrop-blur border border-slate-700 rounded-lg p-3 shadow-xl hidden sm:block">
        <h4 className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Map Legend</h4>
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                <span className="text-xs text-slate-400">Active Issue</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border-2 border-red-200 bg-red-500 flex items-center justify-center text-[8px] font-bold text-white">5</div>
                <span className="text-xs text-slate-400">Cluster (Click to expand)</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
