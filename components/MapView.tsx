
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import { Problem, ProblemStatus, MapplsSuggestion, ProblemCategory } from '../types';
import { dataStore } from '../services/store';
import { INDIA_CENTER, DEFAULT_ZOOM } from '../constants';
import { Search, X, Locate, Flame, Target } from 'lucide-react';
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
    default: return '#9ca3af';
  }
};

const MapView: React.FC<MapViewProps> = ({ focusedLocation }) => {
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
    mapInstance.current = L.map(mapRef.current, { center: [INDIA_CENTER.lat, INDIA_CENTER.lng], zoom: DEFAULT_ZOOM, zoomControl: false, attributionControl: false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);
    markerLayer.current = L.layerGroup().addTo(mapInstance.current);
    setIsLoaded(true);
    return () => { mapInstance.current?.remove(); mapInstance.current = null; };
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
    if (heatLayer.current) mapInstance.current.removeLayer(heatLayer.current);

    if (showHeatmap) {
      const heatPoints = problems.map(p => [p.location.lat, p.location.lng, 0.6]);
      // @ts-ignore
      heatLayer.current = L.heatLayer(heatPoints, { radius: 20, blur: 15, maxZoom: 17 }).addTo(mapInstance.current);
    } else {
      problems.forEach(p => {
        const color = getCategoryColor(p.category);
        const icon = L.divIcon({
          html: `<div class="w-6 h-6 rounded-lg bg-zinc-950 border-2 flex items-center justify-center shadow-lg" style="border-color: ${color}; color: ${color};">
                  <div class="w-1.5 h-1.5 rounded-full" style="background: ${color}"></div>
                 </div>`,
          className: 'custom-icon', iconSize: [24, 24]
        });
        L.marker([p.location.lat, p.location.lng], { icon }).addTo(markerLayer.current!);
      });
    }
  }, [problems, showHeatmap]);

  useEffect(() => {
    if (mapInstance.current && focusedLocation) mapInstance.current.flyTo([focusedLocation.lat, focusedLocation.lng], 16);
  }, [focusedLocation]);

  return (
    <div className="w-full h-full relative bg-black overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />

      {/* Tighter Search Hub */}
      <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-[1000] space-y-2">
        <div className="bg-zinc-950/80 backdrop-blur-xl border border-white/5 rounded-xl flex items-center px-4 py-2.5 shadow-2xl">
          <Search size={14} className="text-white/20 mr-3" />
          <input
            type="text"
            placeholder="SEARCH SPATIAL NODES..."
            className="bg-transparent border-none outline-none text-[10px] font-bold text-white w-full placeholder-white/10 uppercase tracking-widest"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={() => setShowHeatmap(!showHeatmap)} className={`ml-2 p-1.5 rounded-lg transition-all ${showHeatmap ? 'bg-orange-500 text-white' : 'text-white/20'}`}>
            <Flame size={14} />
          </button>
        </div>
      </div>

      <button onClick={() => { if (navigator.geolocation) navigator.geolocation.getCurrentPosition(p => mapInstance.current?.flyTo([p.coords.latitude, p.coords.longitude], 15)) }}
        className="absolute bottom-24 right-4 md:bottom-20 md:right-6 w-10 h-10 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center text-white/40 z-[1000]">
        <Target size={18} />
      </button>

      {!isLoaded && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-[2000]">
          <div className="w-10 h-10 border-2 border-white/5 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default MapView;
