export interface ITopic {
  id: string;
  title: string;
  courseId: string;
  courseTitle?: string;
  content: string;
  videoURL?: string;
  orderIndex: number;
  difficultyLevel: string;
  estimatedMinutes: number;
}
