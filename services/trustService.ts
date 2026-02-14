import { User, TrustLevel } from '../types';

export const TRUSt_CONSTANTS = {
    BASE_SCORE_ANON: 30,
    BASE_SCORE_VERIFIED: 50,
    POINTS_VERIFIED_REPORT: 2,
    POINTS_RESOLVED_REPORT: 5,
    PENALTY_FALSE_REPORT: -10,
    PENALTY_SPAM: -20,
};

export const calculateTrustLevel = (score: number): TrustLevel => {
    if (score >= 81) return TrustLevel.CIVIC_GUARDIAN;
    if (score >= 61) return TrustLevel.TRUSTED_REPORTER;
    if (score >= 31) return TrustLevel.CONTRIBUTOR;
    return TrustLevel.NEW_USER;
};

export const updateTrustScore = (user: User, deltaChange: number): User => {
    const newScore = Math.min(100, Math.max(0, user.trustScore + deltaChange));
    return {
        ...user,
        trustScore: newScore,
        trustLevel: calculateTrustLevel(newScore)
    };
};

export const getReportWeight = (trustScore: number): number => {
    // Linear weighting: score 0 -> 0.5 weight, score 100 -> 2.0 weight
    return 0.5 + (trustScore / 100) * 1.5;
};
