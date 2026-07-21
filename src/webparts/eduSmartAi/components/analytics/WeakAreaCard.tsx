import * as React from 'react';
import { IWeakArea } from '../../types/IWeakArea';
import ProgressBar from '../shared/ProgressBar';
import styles from './WeakAreaCard.module.scss';

export interface IWeakAreaCardProps {
  weakArea: IWeakArea;
}

const WeakAreaCard: React.FC<IWeakAreaCardProps> = ({ weakArea }) => (
  <div className={styles.card}>
    <div className={styles.header}>
      <div>
        <h3>{weakArea.topicName}</h3>
        <p>{weakArea.subjectName}</p>
      </div>
      <span className={styles.score}>{weakArea.weaknessScore}%</span>
    </div>
    <p>{weakArea.recommendedAction}</p>
    <ProgressBar value={weakArea.weaknessScore} />
    <button type="button" className={styles.actionButton}>Mark as Resolved</button>
  </div>
);

export default WeakAreaCard;
