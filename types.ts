
export type Subject = 'Physics' | 'Chemistry' | 'Biology' | 'General';

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export interface Question {
  id: number;
  type: QuestionType;
  question: string;
  options?: string[]; // Cho trắc nghiệm 4 phương án
  correctAnswer: string;
  difficulty: 'nhan_biet' | 'thong_hieu' | 'van_dung';
  explanation: string;
}

export interface UserProfile {
  name: string;
  id: string;
  class: string;
  school: string;
  gender: 'male' | 'female';
  avatar: string;
  joinDate: string;
  dateOfBirth: string;
  settings: {
    notifications: boolean;
  };
  stats: {
    solvedTasks: number;
    averageScore: number;
    streakDays: number;
    totalXP: number;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
  subject?: Subject;
}

export interface LessonProgress {
  subject: string;
  topic: string;
  progress: number;
  colorClass: string;
}