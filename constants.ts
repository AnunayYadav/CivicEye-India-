import { ProblemCategory } from './types';

// Map Configuration
export const INDIA_CENTER = { lat: 22.5937, lng: 78.9629 }; // Slightly adjusted for India center
export const DEFAULT_ZOOM = 5;

// Category Colors for UI
export const CATEGORY_COLORS: Record<ProblemCategory, string> = {
  [ProblemCategory.ROADS]: 'bg-orange-500',
  [ProblemCategory.GARBAGE]: 'bg-yellow-500',
  [ProblemCategory.ELECTRICITY]: 'bg-purple-500',
  [ProblemCategory.WATER]: 'bg-blue-500',
  [ProblemCategory.TRAFFIC]: 'bg-red-500',
  [ProblemCategory.OTHER]: 'bg-gray-500',
};

// Mock Initial Data Generation
export const MOCK_USER_ID = "user_123";
