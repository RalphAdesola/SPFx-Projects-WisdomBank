import * as React from 'react';
import PageHeader from '../shared/PageHeader';
import SkeletonLoader from '../shared/SkeletonLoader';
import TopicCard from './TopicCard';
import { buildLearningPath } from '../../utils/learningPathEngine';
import { useCourses } from '../../hooks/useCourses';
import { useStudentProgress } from '../../hooks/useStudentProgress';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import styles from './LearningPath.module.scss';

export interface IPersonalizedLearningPathProps {
  theme: 'dark' | 'light';
}

const PersonalizedLearningPath: React.FC<IPersonalizedLearningPathProps> = ({ theme }) => {
  const { data: user } = useCurrentUser();
  const { data: courses, isLoading: coursesLoading } = useCourses();
    const { data: progress, isLoading: progressLoading } = useStudentProgress();

  const loading = coursesLoading || progressLoading;
  const topics = (courses || []).flatMap(() => []);
  const pathItems = buildLearningPath(topics, progress || []);

  return (
    <div className={styles.container}>
      <PageHeader
        title="Recommended Learning Path"
        subtitle="Suggested knowledge topics based on your role, recent activity, and the next best step."
        theme={theme}
      />
      {loading ? (
        <SkeletonLoader lines={4} />
      ) : (
        <div className={styles.timeline}>
          {pathItems.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PersonalizedLearningPath;
