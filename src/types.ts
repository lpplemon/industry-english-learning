export type ActiveTab = "home" | "learn" | "practice" | "library";
export type AppLanguage = "zh" | "en";

export interface ApiConfig {
  provider: "openai" | "deepseek";
  model: string;
  apiKey: string;
}

export interface AssessmentResult {
  score: number;
  level: string;
  englishLevel: number;
  tradeLevel: number;
  vocabularyEstimate: number;
  dailyWords: number;
  dailySentences: number;
  domainScores: Record<string, number>;
  strengths: string[];
  focusAreas: string[];
  completedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isListening?: boolean;
}

export interface Coach {
  id: string;
  name: string;
  avatar: string;
  description: string;
  tags: string[];
  difficulty: "Hard" | "Medium" | "Easy";
}

export interface Achievement {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  date: string;
  fill?: boolean;
}

export interface StudyStats {
  xp: number;
  studyTimeMinutes: number;
  todayMinutes: number;
  dailyGoalMinutes: number;
  lessonsCompleted: number;
  accuracy: number;
  streak: number;
}

export interface UserProfile {
  name: string;
  role: string;
  industry: string;
  product: string;
  market: string;
  learningGoal: string;
}

export interface LessonCard {
  id: string;
  title: string;
  category: string;
  description: string;
  time: string;
  level: "Advanced" | "Intermediate" | "Beginner";
  imageUrl: string;
  fullDefinition: string;
  fullDefinitionCn: string;
  phonetic: string;
  tag1: string;
  tag2: string;
  scenarios: {
    type: string;
    icon: string;
    title: string;
    english: string;
    translation: string;
  }[];
  quizDistractors: string[];
}

export interface IngestedDoc {
  id: string;
  title: string;
  fileType: "PDF" | "Word Doc" | "Image";
  summary: string;
  tags: string[];
  timeString: string;
  isProcessing?: boolean;
  progress?: number;
  previewUrl?: string;
  keyConcepts?: string[];
  tradePhrases?: string[];
  actionItems?: string[];
}
