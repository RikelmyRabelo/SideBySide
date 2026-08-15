export interface SessionHistoryItem {
  id: string;
  partner: string;
  partnerAvatar?: string;
  date: string;
  duration: number; // em minutos
  topic: string;
  rating: number;
  userNote?: string;
  vocabLearned: string[];
}

export interface MinutesHistoryItem {
  day: string;
  min: number;
}

export interface WeeklyGoalDay {
  day: string;
  completed: boolean;
}

export interface WeeklyGoal {
  target: number;
  completed: number;
  days: WeeklyGoalDay[];
}

export interface LastSessionFeedback {
  date: string;
  duration: string;
  partnerName: string;
  partnerAvatar: string;
  topic: string;
  userNote: string;
  vocabLearned: string[];
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  level: string;
  reputation: number;
  avatar: string;
  streak: number;
  maxStreak?: number;
  hasPracticedToday: boolean;
  totalMinutes: number;
  totalSessions: number;
  sessionsHistory?: SessionHistoryItem[];
  minutesHistory?: MinutesHistoryItem[];
  weeklyGoal?: WeeklyGoal;
  lastSession?: LastSessionFeedback | null;
}

export interface MatchCandidate {
  id: string;
  name: string;
  score: number;
  sharedInterests: string[];
}

export interface NotificationItem {
  id: string;
  type: 'reminder' | 'goal' | 'friend' | 'badge';
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

export interface TopicItemType {
  id: string;
  category: string;
  title: string;
  icebreaker: string;
  vocabPreview: string[];
}