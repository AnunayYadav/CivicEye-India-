import { ProblemCategory } from './types';

// Map Configuration
export const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 }; // India center
export const DEFAULT_ZOOM = 5;

// Category Colors for UI
export const CATEGORY_COLORS: Record<ProblemCategory, string> = {
  [ProblemCategory.ROADS]: 'bg-orange-500',
  [ProblemCategory.STREET_LIGHT]: 'bg-yellow-500',
  [ProblemCategory.GARBAGE]: 'bg-zinc-500',
  [ProblemCategory.WATER_LEAK]: 'bg-blue-500',
  [ProblemCategory.DRAINAGE]: 'bg-indigo-500',
  [ProblemCategory.PUBLIC_TOILET]: 'bg-pink-500',
  [ProblemCategory.CONSTRUCTION]: 'bg-red-500',
  [ProblemCategory.NOISE]: 'bg-purple-500',
  [ProblemCategory.ANIMAL]: 'bg-emerald-500',
  [ProblemCategory.OTHER]: 'bg-slate-500',
};
