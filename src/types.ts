export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  language?: 'en' | 'ta';
  age?: number;
  height?: number;
  weight?: number;
  YOGSHALALevel: 'Beginner' | 'Intermediate' | 'Advanced';
  fitnessGoal: 'Flexibility' | 'Weight Loss' | 'Stress Relief';
  dailyStreak: number;
  completedSessions: number;
  totalMeditationTime: number;
  caloriesBurned: number;
  dailyYOGSHALAGoal: number; // in minutes
  todayYOGSHALATime: number; // in minutes
  lastActive?: string;
  journeyStartAt?: number;
}

export interface YOGSHALAPose {
  id: string;
  name: string;
  sanskritName: string;
  description: string;
  benefits: string[];
  instructions: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  imageUrl: string;
  videoUrl?: string;
  duration: number; // in seconds
  category: 'Beginner' | 'Intermediate' | 'Advanced' | 'Meditation' | 'Stretching' | 'Back Pain Relief' | 'Weight Loss';
  breathing: string;
  commonMistakes: string[];
  safetyTips: string[];
}

export interface YOGSHALAStyle {
  id: string;
  name: string;
  description: string;
}

export interface YOGSHALALevel {
  id: "beginner" | "intermediate" | "advanced";
  level: 1 | 2 | 3;
  title: string;
  shortDescription: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  styles: YOGSHALAStyle[];
  poseIds: string[];
  focusAreas: string[];
  galleryImages?: string[];
}

export interface WorkoutSession {
  id: string;
  userId: string;
  date: string;
  duration: number;
  caloriesBurned: number;
  posesCompleted: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface WorkoutHistory {
  id: string;
  userId: string;
  title: string;
  date: string;
  duration: string;
  calories: string | number;
  type: string;
  timestamp: number;
  poses?: { poseId: string, name: string, duration: number }[];
}
