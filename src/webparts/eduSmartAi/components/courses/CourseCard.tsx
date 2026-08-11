import * as React from 'react';
import { DefaultButton, PrimaryButton } from '@fluentui/react';
import { ICourse } from '../../types/ICourse';
import ProgressBar from '../shared/ProgressBar';
import StatusBadge from '../shared/StatusBadge';
import styles from './CourseCard.module.scss';

export interface ICourseCardProps {
  course: ICourse;
  onOpen: (course: ICourse) => void;
  onTakeQuiz: (course: ICourse) => void;
}

const CourseCard: React.FC<ICourseCardProps> = ({ course, onOpen, onTakeQuiz }) => {
  const progressValue = course.progress ?? 0;
  const badgeVariant =
    course.status === 'Completed' || course.status === 'Published'
      ? 'success'
      : course.status === 'Active'
        ? 'info'
        : 'neutral';

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader} style={{ background: course.gradient || '#eef2ff' }}>
        <div>
          <div className={styles.subject}>{course.subject}</div>
          <h3>{course.title}</h3>
        </div>
        <div className={styles.headerMeta}>
          {course.highlight ? <span className={styles.highlight}>{course.highlight}</span> : null}
          <StatusBadge label={course.status} variant={badgeVariant} />
        </div>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardContent}>
          <p>{course.description}</p>
          <div className={styles.progressRow}>
            <span>Current Progress</span>
            <strong>{progressValue}%</strong>
          </div>
          <ProgressBar value={progressValue} />
          {course.focusArea ? <div className={styles.focusArea}>Focus Area: {course.focusArea}</div> : null}
          <div className={styles.actionRow}>
            <PrimaryButton
              className={styles.primaryAction}
              text="Open Material"
              onClick={() => onOpen(course)}
            />
            <DefaultButton
              className={styles.tertiaryAction}
              text="Take Quiz"
              onClick={() => onTakeQuiz(course)}
            />
          </div>
        </div>

        <div className={styles.cardMeta}>
          <div className={styles.metaItem}>{course.lessons ?? 0} Lessons</div>
          <div className={styles.metaItem}>{course.quizAttempts ?? 0} Quiz Attempts</div>
        </div>
      </div>
    </article>
  );
};

export default CourseCard;
