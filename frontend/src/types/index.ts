// Hand landmark from MediaPipe
export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

// Grip analysis result
export interface AnalysisResult {
  isCorrectGrip: boolean;
  confidence: number;
  reconstructionError: number;
  landmarks: HandLandmark[];
  timestamp: number;
}

// User profile
export interface UserProfile {
  id?: number;
  studentId: string;
  name: string;
  phone: string;
  role?: 'student' | 'admin' | 'root';
}

// Feedback from admin
export interface FeedbackItem {
  id: number;
  adminId: number;
  studentId: number;
  content: string;
  weekLabel?: string;
  adminName: string;
  createdAt: string;
}

// Practice session record
export interface PracticeRecord {
  id?: number;
  userId?: number;
  isCorrect: boolean;
  mseScore: number;
  confidence: number;
  durationSeconds: number;
  correctRate: number;
  memo?: string;
  createdAt: string;
}

// Root admin user listing
export interface RootUser {
  userId: number;
  studentId: string;
  name: string;
  phone: string;
  role: 'student' | 'admin' | 'root';
  totalSessions: number;
  totalMinutes: number;
  correctRate: number;
  createdAt: string;
}

// Practice session (ongoing)
export interface PracticeSession {
  startTime: number;
  elapsedSeconds: number;
  correctFrames: number;
  totalFrames: number;
  isActive: boolean;
}

// Daily practice stat
export interface DailyStat {
  date: string;
  totalMinutes: number;
  sessions: number;
  correctRate: number;
}

// User stats aggregate
export interface UserStats {
  totalSessions: number;
  totalMinutes: number;
  correctRate: number;
  weeklyDays: number;
  dailyStats: DailyStat[];
}

// Model metadata
export interface ModelMeta {
  arch: number[];
  threshold_train95: number;
  coverage_val: number;
  coverage_test: number;
  seed: number;
  epochs: number;
  batch_size: number;
  lr: number;
}
