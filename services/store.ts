import { Problem, ProblemStatus, ProblemCategory, DashboardStats } from '../types';

// Clean State - No Dummy Data
const INITIAL_PROBLEMS: Problem[] = [];

// Event Emitter for Real-time state management
class Store extends EventTarget {
  private problems: Problem[] = [...INITIAL_PROBLEMS];

  constructor() {
    super();
    // Simulation disabled for production-feel
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
}

export const dataStore = new Store();
