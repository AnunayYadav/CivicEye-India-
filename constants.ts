import { ProblemCategory } from './types';

// Map Configuration
export const INDIA_CENTER: [number, number] = [20.5937, 78.9629];
export const DEFAULT_ZOOM = 5;

// Category Colors for UI
export const CATEGORY_COLORS: Record<ProblemCategory, string> = {
  [ProblemCategory.ROADS]: 'bg-orange-500',
  [ProblemCategory.GARBAGE]: 'bg-yellow-500',
  [ProblemCategory.ELECTRICITY]: 'bg-yellow-400',
  [ProblemCategory.WATER]: 'bg-blue-500',
  [ProblemCategory.TRAFFIC]: 'bg-red-500',
  [ProblemCategory.OTHER]: 'bg-gray-500',
};

// Map Tile Layer (OpenStreetMap)
export const TILE_LAYER_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Mock Initial Data Generation
export const MOCK_USER_ID = "user_123";
