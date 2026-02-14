
import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import Supercluster from 'supercluster';
import { Problem, ProblemStatus, MapplsSuggestion, ProblemCategory } from '../types';
import { dataStore } from '../services/store';
import { INDIA_CENTER, DEFAULT_ZOOM } from '../constants';
import { Search, X, Locate, Flame, Target, Filter, ChevronRight, Brain, Zap } from 'lucide-react';
import { searchPlaces } from '../services/mapUtils';
import { generatePredictiveData, PredictionNode } from '../services/aiPrediction';
import { motion, AnimatePresence } from 'framer-motion';
import ProblemDrawer from './ProblemDrawer';

interface MapViewProps {
  onProblemClick?: (problem: Problem) => void;
  focusedLocation?: { lat: number; lng: number } | null;
}

const SEVERITY_COLORS = {
  HIGH: '#ef4444', // Red
  MEDIUM: '#f59e0b', // Yellow
  LOW: '#3b82f6', // Blue
  RESOLVED: '#22c55e' // Green
};

const MapView: React.FC<MapViewProps> = ({ focusedLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerLayer = useRef<L.LayerGroup | null>(null);
  const heatLayer = useRef<any>(null);

  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [predictions, setPredictions] = useState<PredictionNode[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null);

  const index = useMemo(() => {
    const sc = new Supercluster({
      radius: 40,
      maxZoom: 16
    });
    sc.load(problems
      .filter(p => p.status !== ProblemStatus.REJECTED && p.status !== ProblemStatus.UNDER_REVIEW)
      .map(p => ({
        type: 'Feature',
        properties: { cluster: false, problemId: p.id, category: p.category, urgency: p.urgency, status: p.status },
        geometry: { type: 'Point', coordinates: [p.location.lng, p.location.lat] }
      })));
    return sc;
  }, [problems]);

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

    mapInstance.current.on('moveend', () => {
      const b = mapInstance.current!.getBounds();
      setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
      setZoom(mapInstance.current!.getZoom());
    });

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
    if (showPredictions) {
      setPredictions(generatePredictiveData(problems));
    } else {
      setPredictions([]);
    }
  }, [showPredictions, problems]);

  useEffect(() => {
    if (!mapInstance.current || !markerLayer.current || !bounds) return;

    markerLayer.current.clearLayers();
    if (heatLayer.current) mapInstance.current.removeLayer(heatLayer.current);

    if (showHeatmap) {
      const heatPoints = problems.map(p => [p.location.lat, p.location.lng, 0.6]);
      // @ts-ignore
      heatLayer.current = L.heatLayer(heatPoints, { radius: 25, blur: 15, maxZoom: 17 }).addTo(mapInstance.current);
    } else {
      const clusters = index.getClusters(bounds, zoom);

      clusters.forEach(cluster => {
        const [lng, lat] = cluster.geometry.coordinates;
        const { cluster: isCluster, point_count: pointCount, problemId, urgency, status } = cluster.properties;

        if (isCluster) {
          const size = 30 + (pointCount / problems.length) * 40;
          const icon = L.divIcon({
            html: `<div class="w-full h-full rounded-full bg-zinc-950/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white text-[10px] font-bold shadow-2xl">
                    ${pointCount}
                  </div>`,
            className: '',
            iconSize: [size, size]
          });

          L.marker([lat, lng], { icon }).addTo(markerLayer.current!)
            .on('click', () => {
              const expansionZoom = Math.min(index.getClusterExpansionZoom(cluster.id as number), 20);
              mapInstance.current!.flyTo([lat, lng], expansionZoom);
            });
        } else {
          const p = problems.find(pr => pr.id === problemId);
          if (!p) return;

          const color = p.status === ProblemStatus.RESOLVED ? SEVERITY_COLORS.RESOLVED : SEVERITY_COLORS[p.urgency as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.MEDIUM;
          const size = p.urgency === 'HIGH' ? 28 : 20;

          const icon = L.divIcon({
            html: `<div class="relative flex items-center justify-center">
                    ${p.urgency === 'HIGH' ? `<div class="absolute w-full h-full rounded-full animate-ping opacity-20" style="background: ${color}"></div>` : ''}
                    <div class="rounded-lg bg-zinc-950 border-2 flex items-center justify-center shadow-2xl transition-transform hover:scale-110" 
                         style="border-color: ${color}; color: ${color}; width: ${size}px; height: ${size}px;">
                      <div class="w-1.5 h-1.5 rounded-full" style="background: ${color}"></div>
                    </div>
                  </div>`,
            className: '',
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
          });

          L.marker([lat, lng], { icon }).addTo(markerLayer.current!)
            .on('click', () => {
              setSelectedProblem(p);
              mapInstance.current!.flyTo([lat, lng], 17);
            });
        }
      });

      // Render Predictive AI Markers
      if (showPredictions) {
        predictions.forEach(pred => {
          const size = 32;
          const icon = L.divIcon({
            html: `<div class="relative flex items-center justify-center group">
                    <div class="absolute w-12 h-12 bg-purple-500/10 rounded-full blur-md animate-pulse"></div>
                    <div class="w-8 h-8 rounded-xl bg-zinc-950 border-2 border-purple-500 border-dashed flex items-center justify-center shadow-2xl">
                      <div class="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                    </div>
                  </div>`,
            className: '',
            iconSize: [size, size]
          });

          L.marker([pred.location.lat, pred.location.lng], { icon })
            .addTo(markerLayer.current!)
            .bindPopup(`
              <div class="p-4 bg-zinc-950 text-white rounded-2xl border border-purple-500/20 shadow-2xl min-w-[200px] font-sans">
                <div class="flex items-center gap-2 mb-3">
                  <div class="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path><path d="M12 6v6l4 2"></path></svg>
                  </div>
                  <span class="text-[9px] font-black uppercase tracking-widest text-purple-400">AI Forecasting Layer</span>
                </div>
                <h4 class="text-xs font-black uppercase italic mb-1">Expected: ${pred.category}</h4>
                <p class="text-[10px] text-white/40 leading-relaxed mb-3">${pred.reasoning}</p>
                <div class="flex items-center justify-between pt-3 border-t border-white/5">
                  <span class="text-[8px] font-black uppercase text-white/20">Confidence</span>
                  <span class="text-[10px] font-black text-purple-400 italic">${Math.round(pred.confidence * 100)}%</span>
                </div>
              </div>
            `);
        });
      }
    }
  }, [bounds, zoom, index, showHeatmap, showPredictions, predictions]);

  useEffect(() => {
    if (mapInstance.current && focusedLocation) {
      mapInstance.current.flyTo([focusedLocation.lat, focusedLocation.lng], 16);
    }
  }, [focusedLocation]);

  return (
    <div className="w-full h-full relative bg-black overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />

      {/* Side Drawer */}
      <ProblemDrawer problem={selectedProblem} onClose={() => setSelectedProblem(null)} />

      {/* Floating UI Elements */}
      <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-[1000] space-y-3">
        <div className="bg-zinc-950/80 backdrop-blur-xl border border-white/5 rounded-2xl flex items-center px-4 py-3 shadow-2xl transition-all border-glow focus-within:border-indigo-500/50">
          <Search size={16} className="text-white/20 mr-3" />
          <input
            type="text"
            placeholder="EXPLORE SPATIAL ANALYTICS..."
            className="bg-transparent border-none outline-none text-[10px] font-bold text-white w-full placeholder-white/10 uppercase tracking-[0.2em]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex items-center gap-1 border-l border-white/5 ml-2 pl-2">
            <button
              onClick={() => { setShowHeatmap(!showHeatmap); setShowPredictions(false); }}
              className={`p-2 rounded-xl transition-all ${showHeatmap ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-white/20 hover:text-white/40'}`}
              title="Heatmap Layer"
            >
              <Flame size={16} />
            </button>
            <button
              onClick={() => { setShowPredictions(!showPredictions); setShowHeatmap(false); }}
              className={`p-2 rounded-xl transition-all ${showPredictions ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-white/20 hover:text-white/40'}`}
              title="AI Predictive Layer"
            >
              <Brain size={16} />
            </button>
          </div>
        </div>


        {/* Dynamic Legend */}
        {!selectedProblem && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:block bg-zinc-950/50 backdrop-blur-md border border-white/5 p-4 rounded-2xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Alerts</span>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full">{problems.length} Nodes</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(SEVERITY_COLORS).map(([key, color]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">{key}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Control Buttons (Bottom Right) */}
      <div className="absolute bottom-8 right-6 z-[1000] flex flex-col gap-3">
        <button
          onClick={() => { if (navigator.geolocation) navigator.geolocation.getCurrentPosition(p => mapInstance.current?.flyTo([p.coords.latitude, p.coords.longitude], 16)) }}
          className="w-12 h-12 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white/40 hover:text-white hover:border-indigo-500/50 transition-all shadow-2xl active:scale-95"
        >
          <Target size={20} />
        </button>
        <div className="w-12 h-24 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col items-center justify-around text-white/40 shadow-2xl">
          <button onClick={() => mapInstance.current?.zoomIn()} className="hover:text-white font-bold transition-all">+</button>
          <div className="h-[1px] w-4 bg-white/5" />
          <button onClick={() => mapInstance.current?.zoomOut()} className="hover:text-white font-bold transition-all">-</button>
        </div>
      </div>

      {!isLoaded && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-[2000]">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 border-2 border-white/5 border-t-indigo-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-indigo-500/20 rounded-full animate-pulse" />
              </div>
            </div>
            <p className="text-[10px] font-bold text-white uppercase tracking-[0.5em] animate-pulse">Synchronizing Neural Grid</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
