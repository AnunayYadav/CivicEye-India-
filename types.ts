export enum ProblemStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED'
}

export enum ProblemCategory {
  ROADS = 'Roads & Potholes',
  GARBAGE = 'Garbage & Sanitation',
  ELECTRICITY = 'Electricity & Streetlights',
  WATER = 'Water Supply',
  TRAFFIC = 'Traffic & Parking',
  OTHER = 'Other'
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  category: ProblemCategory;
  location: Coordinates;
  address?: string; // Reverse geocoded address approximation
  imageUrl: string;
  status: ProblemStatus;
  reportedBy: string;
  createdAt: number; // Timestamp
  updatedAt: number;
  upvotes: number;
}

export interface User {
  id: string;
  name: string;
  role: 'CITIZEN' | 'ADMIN';
  email: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  resolved: number;
  byCategory: Record<string, number>;
}