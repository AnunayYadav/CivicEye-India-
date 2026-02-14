
export enum ProblemStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING' // Match legacy if needed, but PRD uses SUBMITTED
}

export enum ProblemCategory {
  ROADS = 'Road Damage',
  STREET_LIGHT = 'Street Light Issue',
  GARBAGE = 'Garbage Problem',
  WATER_LEAK = 'Water Leakage',
  DRAINAGE = 'Drainage Block',
  PUBLIC_TOILET = 'Public Toilet Damage',
  CONSTRUCTION = 'Illegal Construction',
  NOISE = 'Noise Complaint',
  ANIMAL = 'Animal Issue',
  OTHER = 'Other'
}

export enum UserRole {
  CITIZEN = 'CITIZEN',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum Department {
  ROADS_TRANSPORT = 'Road & Transport',
  ELECTRICITY = 'Electricity',
  SANITATION = 'Sanitation',
  WATER_SUPPLY = 'Water Supply',
  PUBLIC_SAFETY = 'Public Safety',
  OTHER = 'Other'
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface CivicComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

export interface TimelineEvent {
  id: string;
  status: ProblemStatus;
  user: string;
  note: string;
  timestamp: number;
}

export enum TrustLevel {
  NEW_USER = 'New User',
  CONTRIBUTOR = 'Contributor',
  TRUSTED_REPORTER = 'Trusted Reporter',
  CIVIC_GUARDIAN = 'Civic Guardian'
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  category: ProblemCategory;
  location: Coordinates;
  address?: string;
  imageUrl: string;
  status: ProblemStatus;
  reportedBy: string;
  reporterTrustScore?: number;
  createdAt: number;
  updatedAt: number;
  upvotes: number;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  department?: Department;
  assignedTo?: string;
  timeline: TimelineEvent[];
  resolutionImage?: string;
  validationCount: number;
  verifiedByGuardians: string[]; // User IDs
  comments: CivicComment[];
  feedback?: {
    rating: number;
    comment: string;
  };
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  profilePic?: string;
  city?: string;
  trustScore: number;
  trustLevel: TrustLevel;
  reportsCount: number;
  resolvedReportsCount: number;
  isVerified: boolean;
}

export interface DashboardStats {
  total: number;
  pending: number; // Sum of non-resolved/closed/rejected
  resolved: number;
  byCategory: Record<string, number>;
  avgResolutionTime: string;
  satisfactionRate: number;
  cityScore: number;
}

export interface MapplsSuggestion {
  eLoc: string;
  placeName: string;
  placeAddress: string;
  latitude?: number;
  longitude?: number;
}
