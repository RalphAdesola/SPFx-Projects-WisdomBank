import * as React from 'react';
import { TextField, DefaultButton } from '@fluentui/react';
import { useCourses } from '../../hooks/useCourses';
import { SPFI } from '@pnp/sp';
import { ICourse } from '../../types/ICourse';
import { IUser } from '../../types/IUser';
import CourseCard from './CourseCard';
import SkeletonLoader from '../shared/SkeletonLoader';
import styles from './MyCourses.module.scss';
import { useLearningProgress } from '../../hooks/useLearningProgress';
import { useAssessmentResults } from '../../hooks/useAssessmentResults';

export interface IMyCoursesProps {
  sp: SPFI;
  onOpenCourse: (course: ICourse) => void;
  onTakeQuiz: (course: ICourse) => void;
  currentUser: IUser;
  currentUserId: number;
}

const MyCourses: React.FC<IMyCoursesProps> = ({
  sp,
  onOpenCourse,
  onTakeQuiz,
  currentUser,
  currentUserId
}) => {
  const { data: courses, isLoading, error } = useCourses(sp);
  const {
    data: progressStates,
    isLoading: progressLoading,
    markStarted
  } = useLearningProgress(sp, currentUserId);
  const {
    data: assessmentSummary,
    isLoading: assessmentResultsLoading
  } = useAssessmentResults(sp, currentUserId);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'All' | 'Active' | 'Completed' | 'Draft'>('All');
  const [subjectFilter, setSubjectFilter] = React.useState<string>('All');
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
  const activeCourses = coursesWithProgress.filter((course) => (course.progress || 0) > 0 || course.status === 'Completed');
  const subjectOptions = ['All'].concat(
    Array.from(new Set(activeCourses.map((course) => course.subject).filter(Boolean)))
  );
  const overallCompletion = activeCourses.length
    ? Math.round(
        activeCourses.reduce((total, course) => total + (course.progress || 0), 0) /
          activeCourses.length
      )
    : 0;
  const learningMinutes = Math.round(
    activeCourses.reduce((total, course) => {
      const duration = course.estimatedMinutes || (course.estimatedHours || 0) * 60;
      return total + duration * ((course.progress || 0) / 100);
    }, 0)
  );
  const learningTime = `${Math.floor(learningMinutes / 60)}h ${learningMinutes % 60}m`;

  const filteredCourses = activeCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || course.status === statusFilter;
    const matchesSubject = subjectFilter === 'All' || course.subject === subjectFilter;
    return matchesSearch && matchesStatus && matchesSubject;
  });

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div>
          <div className={styles.brandHeader}>
            <div className={styles.brandLogo}>WB</div>
            <div>
              <div className={styles.brandTitle}>WisdomBank</div>
              <div className={styles.brandSubtitle}>Personalized Learning Assistant</div>
            </div>
          </div>
          <h1>My Learning</h1>
          <p className={styles.pageSubtitle}>Stay current with assigned company documents, policy updates, and required learning materials.</p>
        </div>

        <div className={styles.summaryGrid} aria-label="Learning summary">
          <div className={styles.summaryCard}>
            <span>Overall Completion</span>
            <strong>{overallCompletion}%</strong>
          </div>
          <div className={styles.summaryCard}>
            <span>Total Learning Hours This Week</span>
            <strong>{learningTime}</strong>
          </div>
          <div className={styles.summaryCard}>
            <span>Assessments Completed</span>
            <strong>{assessmentResultsLoading ? '...' : assessmentSummary.completedCount}</strong>
          </div>
          <div className={styles.summaryCard}>
            <span>Improvement Trend</span>
            <strong>
              {assessmentResultsLoading
                ? '...'
                : `${assessmentSummary.improvementTrend > 0 ? '+' : ''}${assessmentSummary.improvementTrend}%`}
            </strong>
          </div>
        </div>
      </div>

      <header className={styles.headerBar}>
        <div className={styles.searchContainer}>
          <TextField
            className={styles.searchField}
            placeholder="Search learning materials..."
            value={search}
            onChange={(_, value) => setSearch(value || '')}
          />
        </div>
        <div className={styles.searchActions}>
          <DefaultButton className={styles.filterButton} text="Filter" />
        </div>
      </header>

      <div className={styles.tabBar}>
        {subjectOptions.map((option) => (
          <button
            key={option}
            type="button"
            className={`${styles.tabButton} ${subjectFilter === option ? styles.tabActive : ''}`}
            onClick={() => setSubjectFilter(option)}
          >
            {option}
          </button>
        ))}
      </div>

      {isLoading || progressLoading ? (
        <SkeletonLoader lines={4} />
      ) : error ? (
        <div className={styles.empty}>Unable to load Learning Materials: {error.message}</div>
      ) : (
        <div className={styles.courseGrid}>
          {filteredCourses.length === 0 ? (
            <div className={styles.empty}>No matching courses found.</div>
          ) : (
            filteredCourses.map((course) => (
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

export default MyCourses;
