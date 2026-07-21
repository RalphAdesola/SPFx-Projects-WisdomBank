export interface ICourse {
  id: string;
  title: string;
  description: string;
  subject: string;
  level: string;
  status: string;
  thumbnailURL?: string;
  totalTopics: number;
  estimatedHours: number;
  progress?: number;
  focusArea?: string;
  lessons?: number;
  quizzes?: number;
  highlight?: string;
  gradient?: string;
}
