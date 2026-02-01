
import { Problem, ProblemStatus, ProblemCategory, DashboardStats } from '../types';

const INITIAL_PROBLEMS: Problem[] = [
  {
    id: 'mock_1',
    title: 'Major Pothole Cluster',
    description: 'A series of deep potholes have formed after the heavy rains. Dangerous for two-wheelers especially during the night.',
    category: ProblemCategory.ROADS,
    location: { lat: 28.6139, lng: 77.2090 }, // New Delhi
    address: 'Connaught Place, New Delhi, Delhi 110001',
    imageUrl: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=800',
    status: ProblemStatus.PENDING,
    reportedBy: 'Arjun K.',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    upvotes: 42
  },
  {
    id: 'mock_2',
    title: 'Streetlight Failure - Sector 15',
    description: 'Entire stretch of 200m has no working streetlights. Significant safety concern for evening commuters.',
    category: ProblemCategory.ELECTRICITY,
    location: { lat: 19.0760, lng: 72.8777 }, // Mumbai
    address: 'Bandra Kurla Complex, Mumbai, Maharashtra',
    imageUrl: 'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?q=80&w=800',
    status: ProblemStatus.IN_PROGRESS,
    reportedBy: 'Saira V.',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 1,
    upvotes: 128
  },
  {
    id: 'mock_3',
    title: 'Garbage Dump Overflow',
    description: 'Municipal collection hasn\'t occurred for 4 days. Waste is spilling onto the main road near the school.',
    category: ProblemCategory.GARBAGE,
    location: { lat: 12.9716, lng: 77.5946 }, // Bangalore
    address: 'Indiranagar 100 Feet Rd, Bengaluru, Karnataka',
    imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=800',
    status: ProblemStatus.RESOLVED,
    reportedBy: 'Rahul M.',
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 1,
    upvotes: 215
  }
];

class Store extends EventTarget {
  private problems: Problem[] = [...INITIAL_PROBLEMS];

  getProblems(): Problem[] {
    return [...this.problems];
  }

  getProblemById(id: string): Problem | undefined {
    return this.problems.find(p => p.id === id);
  }

  addProblem(problem: Problem) {
    this.problems.unshift(problem);
    this.dispatchEvent(new Event('updated'));
  }

  updateProblemStatus(id: string, status: ProblemStatus) {
    this.problems = this.problems.map(p => 
      p.id === id ? { ...p, status, updatedAt: Date.now() } : p
    );
    this.dispatchEvent(new Event('updated'));
  }

  getStats(): DashboardStats {
    const total = this.problems.length;
    const pending = this.problems.filter(p => p.status === ProblemStatus.PENDING).length;
    const resolved = this.problems.filter(p => p.status === ProblemStatus.RESOLVED).length;
    
    const byCategory: Record<string, number> = {};
    Object.values(ProblemCategory).forEach(cat => {
      byCategory[cat] = this.problems.filter(p => p.category === cat).length;
    });

    return { total, pending, resolved, byCategory };
  }
}

export const dataStore = new Store();
