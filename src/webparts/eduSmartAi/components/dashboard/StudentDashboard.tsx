import * as React from 'react';
import { DefaultButton } from '@fluentui/react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useCourses } from '../../hooks/useCourses';
import { useStudentProgress } from '../../hooks/useStudentProgress';
import PageHeader from '../shared/PageHeader';
import SkeletonLoader from '../shared/SkeletonLoader';
import styles from './StudentDashboard.module.scss';
import { SPFI } from '@pnp/sp';
import { ICourse } from '../../types/ICourse';
import { IUser } from '../../types/IUser';

export interface IStudentDashboardProps {
  theme: 'dark' | 'light';
  sp: SPFI;
  onOpenCourse: (course: ICourse) => void;
  currentUser: IUser;
}

const StudentDashboard: React.FC<IStudentDashboardProps> = ({ theme, sp, onOpenCourse, currentUser }) => {
  const { data: user, isLoading: userLoading } = useCurrentUser(currentUser);
  const { data: courses, isLoading: coursesLoading } = useCourses(sp);
  const { data: progress, isLoading: progressLoading } = useStudentProgress();

  const loading = userLoading || coursesLoading || progressLoading;
  const completedTopics = progress ? progress.filter((item) => item.status === 'Completed').length : 0;
  const averageScore =
    progress && progress.length > 0
      ? Math.round(progress.reduce((sum, item) => sum + (item.quizScore || 0), 0) / progress.length)
      : 0;
  const streak = progress ? Math.max(...progress.map((item) => item.learningStreak), 0) : 0;
  const greetingName = user?.displayName ? `, ${user.displayName}` : '';

  const isDarkTheme = theme === 'dark';

  return (
    <section className={`${styles.dashboard} ${isDarkTheme ? styles.dashboardDark : styles.dashboardLight}`}>
      <PageHeader title={`Good morning${greetingName} 👋`} subtitle="Here is your enterprise knowledge and learning snapshot for today." theme={theme} />
      {loading ? (
        <SkeletonLoader lines={5} />
      ) : (
        <>
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span>Assigned Learning Materials</span>
              <strong>{courses?.length || 0}</strong>
            </div>
            <div className={styles.statCard}>
              <span>Completed Knowledge Sessions</span>
              <strong>{completedTopics}</strong>
            </div>
            <div className={styles.statCard}>
              <span>Weekly Learning Streak</span>
              <strong>{streak} days</strong>
            </div>
            <div className={styles.statCard}>
              <span>Average Assessment Score</span>
              <strong>{averageScore}%</strong>
            </div>
          </div>

          <div className={styles.courseGrid}>
            {(courses || []).map((course) => (
              <div key={course.id} className={styles.courseCard}>
                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.courseSubject}>{course.subject}</div>
                    <h3>{course.title}</h3>
                  </div>
                  <div className={styles.statusBadge}>{course.status}</div>
                </div>
                <div className={styles.cardBody}>
                  <p>{course.description}</p>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${Math.min(100, course.progress || 0)}%` }} />
                  </div>
                  <div className={styles.actionRow}>
                    <DefaultButton text="Open Material" onClick={() => onOpenCourse(course)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default StudentDashboard;
