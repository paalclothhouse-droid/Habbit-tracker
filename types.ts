
export enum Frequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

export interface HabitLog {
  date: string;
  completed: boolean;
  notes?: string;
}

export interface Reminder {
  id: string;
  time: string; // HH:mm format
  days: number[]; // 0-6 for Sun-Sat
  enabled: boolean;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: Frequency;
  streak: number;
  logs: HabitLog[];
  reminders: Reminder[];
  createdAt: string;
  color: string;
}

export interface UserProfile {
  id: string;
  name: string;
  xp: number;
  level: number;
  joinedAt: string;
  streakFreezes: number;
}

export interface AIInsight {
  title: string;
  advice: string;
  confidence: number;
  tags: string[];
}

export interface AIPrediction {
  projectedLevel: number;
  successProbability: number; // 0-100
  nextMilestoneEstimate: string;
  summary: string;
}
