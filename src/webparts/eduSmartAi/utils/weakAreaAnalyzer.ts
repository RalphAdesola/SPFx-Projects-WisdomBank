import { IStudentProgress } from '../types/IStudentProgress';
import { IWeakArea } from '../types/IWeakArea';

/**
 * Generate weak area summaries from student progress records.
 * @param progress Records evaluated for quiz performance.
 * @returns Weak area cards for analytics and recommendation.
 */
export function analyzeWeakAreas(progress: IStudentProgress[]): IWeakArea[] {
  return progress
    .filter((item) => item.quizScore !== undefined && item.quizScore < 80)
    .map((item) => ({
      id: `${item.topicId}-${item.studentId}`,
      studentId: item.studentId,
      subjectName: item.courseId,
      topicName: item.topicId,
      weaknessScore: 100 - (item.quizScore || 0),
      recommendedAction: 'Review the topic and practice the next quiz questions with step-by-step reasoning.',
      isResolved: false,
      identifiedDate: item.lastAccessedDate
    }));
}
