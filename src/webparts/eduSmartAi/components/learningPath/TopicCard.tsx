import * as React from 'react';
import { DefaultButton } from '@fluentui/react';
import { ILearningPathItem } from '../../utils/learningPathEngine';
import StatusBadge from '../shared/StatusBadge';
import styles from './TopicCard.module.scss';

export interface ITopicCardProps {
  topic: ILearningPathItem;
}

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  completed: 'success',
  inProgress: 'info',
  recommended: 'warning',
  locked: 'neutral'
};

const TopicCard: React.FC<ITopicCardProps> = ({ topic }) => (
  <div className={styles.topicCard}>
    <div className={styles.topRow}>
      <div>
        <div className={styles.courseLabel}>
          {topic.courseTitle || topic.courseId}
        </div>
        <h3>{topic.title}</h3>
      </div>

      <StatusBadge
        label={topic.status.replace(/([A-Z])/g, ' $1')}
        variant={statusVariant[topic.status] || 'neutral'}
      />
    </div>

    <div className={styles.details}>
      <span>{topic.difficultyLevel}</span>
      <span>{topic.estimatedMinutes} min</span>
    </div>

    <DefaultButton text="Study Now" />
  </div>
);

export default TopicCard;