
import { Problem, ProblemStatus, ProblemCategory, DashboardStats, User, UserRole, Department, TimelineEvent } from '../types';

const INITIAL_PROBLEMS: Problem[] = [
  {
    id: 'mock_1',
    title: 'Major Pothole Cluster',
    description: 'A series of deep potholes have formed after the heavy rains. Dangerous for two-wheelers especially during the night.',
    category: ProblemCategory.ROADS,
    location: { lat: 28.6139, lng: 77.2090 },
    address: 'Connaught Place, New Delhi, Delhi 110001',
    imageUrl: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=800',
    status: ProblemStatus.SUBMITTED,
    reportedBy: 'Arjun K.',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    upvotes: 42,
    urgency: 'HIGH',
    timeline: [
      { id: 'ev_1', status: ProblemStatus.SUBMITTED, user: 'Arjun K.', note: 'Initial report submitted via mobile app.', timestamp: Date.now() - 86400000 * 2 }
    ]
  },
  {
    id: 'mock_2',
    title: 'Streetlight Failure - Sector 15',
    description: 'Entire stretch of 200m has no working streetlights. Significant safety concern for evening commuters.',
    category: ProblemCategory.STREET_LIGHT,
    location: { lat: 19.0760, lng: 72.8777 },
    address: 'Bandra Kurla Complex, Mumbai, Maharashtra',
    imageUrl: 'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?q=80&w=800',
    status: ProblemStatus.IN_PROGRESS,
    reportedBy: 'Saira V.',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 1,
    upvotes: 128,
    urgency: 'MEDIUM',
    department: Department.ELECTRICITY,
    assignedTo: 'Officer Ramesh',
    timeline: [
      { id: 'ev_2', status: ProblemStatus.SUBMITTED, user: 'Saira V.', note: 'Reported.', timestamp: Date.now() - 86400000 * 5 },
      { id: 'ev_3', status: ProblemStatus.ASSIGNED, user: 'Admin', note: 'Assigned to Electric Dept.', timestamp: Date.now() - 86400000 * 3 },
      { id: 'ev_4', status: ProblemStatus.IN_PROGRESS, user: 'Officer Ramesh', note: 'Technician on site.', timestamp: Date.now() - 86400000 * 1 }
    ]
  },
  {
    id: 'mock_3',
    title: 'Garbage Dump Overflow',
    description: "Municipal collection hasn't occurred for 4 days. Waste is spilling onto the main road near the school.",
    category: ProblemCategory.GARBAGE,
    location: { lat: 12.9716, lng: 77.5946 },
    address: 'Indiranagar 100 Feet Rd, Bengaluru, Karnataka',
    imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=800',
    status: ProblemStatus.RESOLVED,
    reportedBy: 'Rahul M.',
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 1,
    upvotes: 215,
    urgency: 'MEDIUM',
    department: Department.SANITATION,
    timeline: [
      { id: 'ev_5', status: ProblemStatus.SUBMITTED, user: 'Rahul M.', note: 'Spilling onto road.', timestamp: Date.now() - 86400000 * 10 },
      { id: 'ev_6', status: ProblemStatus.RESOLVED, user: 'Sanitation Dept', note: 'Cleanup completed. Image verified.', timestamp: Date.now() - 86400000 * 1 }
    ],
    feedback: {
      rating: 5,
      comment: 'Cleaned up very efficiently. Thank you!'
    }
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

  updateProblem(id: string, updates: Partial<Problem>, user: string, note: string) {
    const problem = this.problems.find(p => p.id === id);
    if (!problem) return;

    const newStatus = updates.status || problem.status;
    const timelineEvent: TimelineEvent = {
      id: `ev_${Date.now()}`,
      status: newStatus,
      user: user,
      note: note,
      timestamp: Date.now()
    };

    this.problems = this.problems.map(p =>
      p.id === id ? {
        ...p,
        ...updates,
        updatedAt: Date.now(),
        timeline: [...p.timeline, timelineEvent]
      } : p
    );
    this.dispatchEvent(new Event('updated'));
  }

  getStats(): DashboardStats {
    const total = this.problems.length;
    const pendingCount = this.problems.filter(p => ![ProblemStatus.RESOLVED, ProblemStatus.CLOSED, ProblemStatus.REJECTED].includes(p.status)).length;
    const resolved = this.problems.filter(p => p.status === ProblemStatus.RESOLVED || p.status === ProblemStatus.CLOSED).length;

    const byCategory: Record<string, number> = {};
    Object.values(ProblemCategory).forEach(cat => {
      byCategory[cat] = this.problems.filter(p => p.category === cat).length;
    });

    return {
      total,
      pending: pendingCount,
      resolved,
      byCategory,
      avgResolutionTime: '2.4 Days',
      satisfactionRate: 88
    };
  }
}

class UserStore extends EventTarget {
  private currentUser: User = {
    id: 'user_anunay',
    name: 'Anunay Yadav',
    role: UserRole.CITIZEN,
    email: 'anunay@example.com',
    profilePic: 'https://i.pravatar.cc/150?u=anunay',
    city: 'New Delhi'
  };

  getCurrentUser(): User {
    return this.currentUser;
  }

  setRole(role: UserRole) {
    this.currentUser = { ...this.currentUser, role };
    this.dispatchEvent(new Event('user_updated'));
  }
}

export const dataStore = new Store();
export const userStore = new UserStore();
