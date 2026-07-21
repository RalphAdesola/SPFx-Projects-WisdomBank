import { ITopic } from '../types/ITopic';
import { IStudentProgress } from '../types/IStudentProgress';

export interface ILearningPathItem extends ITopic {
  status: 'completed' | 'inProgress' | 'recommended' | 'locked';
  scorePriority: number;
}

/**
 * Compute the learning path order for a student by combining topics and progress.
 * @param topics All available topics in enrolled courses.
 * @param progress Progress records for the student.
 * @returns Ranked topic items for learning path presentation.
 */
export function buildLearningPath(
  topics: ITopic[],
  progress: IStudentProgress[]
): ILearningPathItem[] {
  const progressMap = new Map(progress.map((item) => [item.topicId, item]));

  return topics
    .map((topic) => {
      const item = progressMap.get(topic.id);
      const status = item ? item.status.toLowerCase() as ILearningPathItem['status'] : 'recommended';
      const scorePriority = item?.quizScore ? 100 - item.quizScore : 100;

      return {
        ...topic,
        status,
        scorePriority
      };
    })
    .sort((a, b) => {
      if (a.status === b.status) {
        return b.scorePriority - a.scorePriority || a.orderIndex - b.orderIndex;
      }
      const order = ['recommended', 'inProgress', 'completed', 'locked'];
      return order.indexOf(a.status) - order.indexOf(b.status);
    });
}
