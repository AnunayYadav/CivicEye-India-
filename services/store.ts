import { Problem, ProblemStatus, ProblemCategory, DashboardStats } from '../types';

// Initial Mock Data (Distributed across India)
const MOCK_PROBLEMS: Problem[] = [
  {
    id: '1',
    title: 'Huge Pothole on NH44',
    description: 'Deep pothole causing traffic slowdown near the junction.',
    category: ProblemCategory.ROADS,
    location: { lat: 28.6139, lng: 77.2090 }, // Delhi
    address: 'Connaught Place, New Delhi',
    imageUrl: 'https://picsum.photos/400/300?random=1',
    status: ProblemStatus.PENDING,
    reportedBy: 'user_1',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now(),
    upvotes: 12
  },
  {
    id: '2',
    title: 'Overflowing Garbage Bin',
    description: 'Garbage has not been collected for 3 days.',
    category: ProblemCategory.GARBAGE,
    location: { lat: 19.0760, lng: 72.8777 }, // Mumbai
    address: 'Andheri West, Mumbai',
    imageUrl: 'https://picsum.photos/400/300?random=2',
    status: ProblemStatus.IN_PROGRESS,
    reportedBy: 'user_2',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
    upvotes: 5
  },
  {
    id: '3',
    title: 'Streetlight Broken',
    description: 'Entire street is dark at night, safety concern.',
    category: ProblemCategory.ELECTRICITY,
    location: { lat: 12.9716, lng: 77.5946 }, // Bangalore
    address: 'Indiranagar, Bangalore',
    imageUrl: 'https://picsum.photos/400/300?random=3',
    status: ProblemStatus.PENDING,
    reportedBy: 'user_3',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now(),
    upvotes: 8
  },
  // Adding more close points to demo clustering
  {
    id: '4',
    title: 'Water Leakage',
    description: 'Pipeline burst.',
    category: ProblemCategory.WATER,
    location: { lat: 28.6200, lng: 77.2100 }, // Delhi nearby
    address: 'Barakhamba Road, New Delhi',
    imageUrl: 'https://picsum.photos/400/300?random=4',
    status: ProblemStatus.PENDING,
    reportedBy: 'user_4',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    upvotes: 2
  },
   {
    id: '5',
    title: 'Traffic Signal Malfunction',
    description: 'Signal stuck on red.',
    category: ProblemCategory.TRAFFIC,
    location: { lat: 13.0827, lng: 80.2707 }, // Chennai
    address: 'Marina Beach Road, Chennai',
    imageUrl: 'https://picsum.photos/400/300?random=5',
    status: ProblemStatus.RESOLVED,
    reportedBy: 'user_5',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now(),
    upvotes: 20
  }
];

// Event Emitter for "Real-time" simulation
class Store extends EventTarget {
  private problems: Problem[] = [...MOCK_PROBLEMS];

  constructor() {
    super();
    // Simulate incoming reports randomly every 30-60 seconds
    setInterval(() => {
      this.simulateRandomIncomingReport();
    }, 45000);
  }

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

  private simulateRandomIncomingReport() {
    // Generate a random problem around major Indian cities
    const cities = [
      { lat: 28.6139, lng: 77.2090 }, // Delhi
      { lat: 19.0760, lng: 72.8777 }, // Mumbai
      { lat: 12.9716, lng: 77.5946 }, // Bangalore
      { lat: 22.5726, lng: 88.3639 }, // Kolkata
    ];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const randomOffset = () => (Math.random() - 0.5) * 0.1; // roughly 10km radius

    const newProblem: Problem = {
      id: `sim_${Date.now()}`,
      title: 'Real-time Report: Public Nuisance',
      description: 'Simulated real-time incoming report from citizens.',
      category: ProblemCategory.OTHER,
      location: { lat: city.lat + randomOffset(), lng: city.lng + randomOffset() },
      imageUrl: `https://picsum.photos/400/300?random=${Date.now()}`,
      status: ProblemStatus.PENDING,
      reportedBy: 'system_simulation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      upvotes: 0
    };

    console.log("Simulating new incoming report:", newProblem.id);
    this.addProblem(newProblem);
  }
}

export const dataStore = new Store();
