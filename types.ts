
export enum Frequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

export interface HabitLog {
  date: string;
  completed: boolean;
  value?: number; // For sleep hours or study hours
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
  isMetric?: boolean; // If true, it tracks numbers like hours
  minValue?: number; // Logic for "increase but not decrease"
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
  successProbability: number;
  nextMilestoneEstimate: string;
  summary: string;
}
