import * as React from 'react';
import { SPFI } from '@pnp/sp';
import PageHeader from '../shared/PageHeader';
import SkeletonLoader from '../shared/SkeletonLoader';
import { useCourses } from '../../hooks/useCourses';
import { useLearningProgress } from '../../hooks/useLearningProgress';
import { ICourse } from '../../types/ICourse';
import { IUser } from '../../types/IUser';
import CourseCard from '../courses/CourseCard';
import styles from './LearningPath.module.scss';

export interface IPersonalizedLearningPathProps {
  theme: 'dark' | 'light';
  sp: SPFI;
  currentUser: IUser;
  currentUserId: number;
  onOpenCourse: (course: ICourse) => void;
  onTakeQuiz: (course: ICourse) => void;
}

const PersonalizedLearningPath: React.FC<IPersonalizedLearningPathProps> = ({
  theme,
  sp,
  currentUser,
  currentUserId,
  onOpenCourse,
  onTakeQuiz
}) => {
  const { data: courses, isLoading: coursesLoading, error } = useCourses(sp);
  const {
    data: progressStates,
    isLoading: progressLoading,
    markStarted
  } = useLearningProgress(sp, currentUserId);

  const coursesWithProgress = (courses || []).map((course) => {
    const state = progressStates.find(
      (item) =>
        item.courseId === Number(course.id) ||
        item.courseTitle.trim().toLowerCase() === course.title.trim().toLowerCase()
    );
    const progress = state?.progressPercent || 0;

    return {
      ...course,
      progress,
      status: progress >= 100 ? 'Completed' : course.status,
      quizzes: 1,
      quizAttempts: state?.quizAttempts || 0
    };
  });

  return (
    <div className={styles.container}>
      <PageHeader
        title="Recommended Learning"
        subtitle="Courses Assigned based on your Department/Team"
        theme={theme}
      />

      {coursesLoading || progressLoading ? (
        <SkeletonLoader lines={4} />
      ) : error ? (
        <div className={styles.empty}>Unable to load recommended learning: {error.message}</div>
      ) : (
        <div className={styles.courseGrid}>
          {coursesWithProgress.length === 0 ? (
            <div className={styles.empty}>No assigned courses are available yet.</div>
          ) : (
            coursesWithProgress.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onOpen={(selectedCourse) => {
                  markStarted(
                    currentUser.displayName || 'Learner',
                    selectedCourse.title,
                    Number(selectedCourse.id)
                  ).catch(() => undefined);
                  onOpenCourse(selectedCourse);
                }}
                onTakeQuiz={onTakeQuiz}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PersonalizedLearningPath;
