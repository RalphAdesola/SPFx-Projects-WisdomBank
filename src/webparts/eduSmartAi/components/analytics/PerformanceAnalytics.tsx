import * as React from 'react';
import PageHeader from '../shared/PageHeader';
import WeakAreaCard from './WeakAreaCard';
import PerformanceChart from './PerformanceChart';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import styles from './Analytics.module.scss';

export interface IPerformanceAnalyticsProps {
  theme: 'dark' | 'light';
}

const PerformanceAnalytics: React.FC<IPerformanceAnalyticsProps> = ({ theme }) => {
  const { data: user } = useCurrentUser();

  const seriesData = [
    { label: 'Math', values: [70, 75, 80, 82] },
    { label: 'English', values: [65, 70, 72, 78] },
    { label: 'Science', values: [60, 68, 70, 74] }
  ];

  const weakAreas = [
    { id: '1', studentId: user?.loginName || '', subjectName: 'Mathematics', topicName: 'Equations', weaknessScore: 58, recommendedAction: 'Review equations and practice with step-by-step examples.', isResolved: false },
    { id: '2', studentId: user?.loginName || '', subjectName: 'Physics', topicName: 'Forces', weaknessScore: 72, recommendedAction: 'Study free body diagrams and motion problems.', isResolved: false }
  ];

  return (
    <div className={styles.container}>
      <PageHeader title="Knowledge Analytics" subtitle="Review engagement, completion trends, and the next best learning actions." theme={theme} />
      <div className={styles.overviewGrid}>
        <div className={styles.statCard}>
          <span>Overall Completion</span>
          <strong>68%</strong>
        </div>
        <div className={styles.statCard}>
          <span>Total learning time this week</span>
          <strong>7h 20m</strong>
        </div>
        <div className={styles.statCard}>
          <span>Assessments completed</span>
          <strong>12</strong>
        </div>
        <div className={styles.statCard}>
          <span>Improvement trend</span>
          <strong>+8%</strong>
        </div>
      </div>
      <PerformanceChart data={seriesData} />
      <div className={styles.weakAreasSection}>
        <div>
          <h3>Priority Focus Areas</h3>
          <p>Topics that would benefit from a quick review.</p>
        </div>
        <div className={styles.weakAreaGrid}>
          {weakAreas.map((weakArea) => (
            <WeakAreaCard key={weakArea.id} weakArea={weakArea} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
