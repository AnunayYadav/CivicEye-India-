
import {
  collection,
  query,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  orderBy,
  serverTimestamp,
  increment,
  arrayUnion,
  getDoc,
  setDoc,
  where
} from 'firebase/firestore';
import { db, auth } from './firebase';
import {
  Problem,
  ProblemStatus,
  ProblemCategory,
  DashboardStats,
  User,
  UserRole,
  Department,
  TimelineEvent,
  TrustLevel,
  CivicComment
} from '../types';

class Store extends EventTarget {
  private problems: Problem[] = [];

  constructor() {
    super();
    this.initListener();
  }

  private initListener() {
    const q = query(collection(db, 'problems'), orderBy('createdAt', 'desc'));
    onSnapshot(q, (snapshot) => {
      this.problems = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toMillis() || Date.now(),
          updatedAt: data.updatedAt?.toMillis() || Date.now(),
        } as Problem;
      });
      this.dispatchEvent(new Event('updated'));
    });
  }

  getProblems(): Problem[] {
    return [...this.problems];
  }

  getProblemById(id: string): Problem | undefined {
    return this.problems.find(p => p.id === id);
  }

  async addProblem(problem: Omit<Problem, 'id'>) {
    // AI Moderation Layer
    const spamKeywords = ['fake', 'test', 'spam', 'random'];
    const isSuspicious = spamKeywords.some(word =>
      problem.title.toLowerCase().includes(word) ||
      problem.description.toLowerCase().includes(word)
    );

    const initialStatus = isSuspicious ? ProblemStatus.UNDER_REVIEW : ProblemStatus.SUBMITTED;
    const timeline: TimelineEvent[] = [{
      id: `ev_${Date.now()}`,
      status: initialStatus,
      user: isSuspicious ? 'AI_MODERATOR' : 'SYSTEM',
      note: isSuspicious ? 'Flagged as suspicious content. Awaiting manual verification.' : 'Incident created.',
      timestamp: Date.now()
    }];

    await addDoc(collection(db, 'problems'), {
      ...problem,
      status: initialStatus,
      timeline,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      upvotes: 0,
      validationCount: 0,
      verifiedByGuardians: [],
      comments: []
    });

    // Update reporter stats
    const userRef = doc(db, 'users', problem.reportedBy);
    await updateDoc(userRef, {
      reportsCount: increment(1)
    });
  }

  async upvoteProblem(id: string) {
    const ref = doc(db, 'problems', id);
    await updateDoc(ref, {
      upvotes: increment(1)
    });
  }

  async validateProblem(id: string, userId: string, isGuardian: boolean) {
    const problem = this.problems.find(p => p.id === id);
    if (!problem || problem.verifiedByGuardians.includes(userId)) return;

    const ref = doc(db, 'problems', id);
    await updateDoc(ref, {
      validationCount: increment(1),
      verifiedByGuardians: isGuardian ? arrayUnion(userId) : problem.verifiedByGuardians
    });

    // Trust Score logic
    if (isGuardian) {
      await userStore.updateUserScore(problem.reportedBy, 2);
    } else if (problem.validationCount + 1 === 5) {
      await userStore.updateUserScore(problem.reportedBy, 1);
    }
  }

  async addComment(id: string, comment: CivicComment) {
    const ref = doc(db, 'problems', id);
    await updateDoc(ref, {
      comments: arrayUnion(comment)
    });
  }

  async updateProblem(id: string, updates: Partial<Problem>, user: string, note: string) {
    const ref = doc(db, 'problems', id);
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

    await updateDoc(ref, {
      ...updates,
      updatedAt: serverTimestamp(),
      timeline: arrayUnion(timelineEvent)
    });

    // If resolved, update user score
    if (updates.status === ProblemStatus.RESOLVED && problem.status !== ProblemStatus.RESOLVED) {
      const userRef = doc(db, 'users', problem.reportedBy);
      await updateDoc(userRef, {
        resolvedReportsCount: increment(1)
      });
      await userStore.updateUserScore(problem.reportedBy, 5); // Major boost for resolution
    }
  }

  getStats(): DashboardStats {
    const total = this.problems.length;
    const pendingCount = this.problems.filter(p => ![ProblemStatus.RESOLVED, ProblemStatus.CLOSED, ProblemStatus.REJECTED].includes(p.status)).length;
    const resolved = this.problems.filter(p => p.status === ProblemStatus.RESOLVED || p.status === ProblemStatus.CLOSED).length;

    const byCategory: Record<string, number> = {};
    Object.values(ProblemCategory).forEach(cat => {
      byCategory[cat] = this.problems.filter(p => p.category === cat).length;
    });

    const resRate = total > 0 ? (resolved / total) : 1;
    const cityScore = Math.round((resRate * 70) + 25);

    return {
      total,
      pending: pendingCount,
      resolved,
      byCategory,
      avgResolutionTime: total > 0 ? '2.1 Days' : '0 Days',
      satisfactionRate: total > 0 ? 92 : 100,
      cityScore
    };
  }
}

class UserStore extends EventTarget {
  private currentUser: User | null = null;
  private isInitializing: boolean = true;

  constructor() {
    super();
    this.initAuth();
  }

  private initAuth() {
    auth.onAuthStateChanged(async (firebaseUser) => {
      this.isInitializing = true;
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          this.currentUser = userDoc.data() as User;

          // Listen for profile updates
          onSnapshot(doc(db, 'users', firebaseUser.uid), (doc) => {
            if (doc.exists()) {
              this.currentUser = doc.data() as User;
              this.dispatchEvent(new Event('user_updated'));
            }
          });
        }
      } else {
        this.currentUser = null;
      }
      this.isInitializing = false;
      this.dispatchEvent(new Event('user_updated'));
    });
  }

  getCurrentUser(): User {
    // Return a structured guest if null to avoid crash, 
    // but the app should protect routes with this info
    return this.currentUser || {
      id: 'guest',
      name: 'Guest Citizen',
      role: UserRole.CITIZEN,
      email: '',
      trustScore: 0,
      trustLevel: TrustLevel.NEW_USER,
      reportsCount: 0,
      resolvedReportsCount: 0,
      isVerified: false
    };
  }

  getIsInitializing() {
    return this.isInitializing;
  }

  async logout() {
    await auth.signOut();
  }

  async updateUserScore(userId: string, points: number) {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      const newScore = Math.min(100, Math.max(0, (data.trustScore || 0) + points));
      await updateDoc(userRef, {
        trustScore: newScore,
        trustLevel: this.calculateTrustLevel(newScore)
      });
    }
  }

  private calculateTrustLevel(score: number): TrustLevel {
    if (score >= 81) return TrustLevel.CIVIC_GUARDIAN;
    if (score >= 61) return TrustLevel.TRUSTED_REPORTER;
    if (score >= 31) return TrustLevel.CONTRIBUTOR;
    return TrustLevel.NEW_USER;
  }
}

export const dataStore = new Store();
export const userStore = new UserStore();
