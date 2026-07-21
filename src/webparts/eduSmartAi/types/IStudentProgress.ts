export interface IStudentProgress {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  topicId: string;
  status: string;
  progressPercent: number;
  lastAccessedDate?: string;
  timeSpentMinutes: number;
  quizScore?: number;
  learningStreak: number;
}
