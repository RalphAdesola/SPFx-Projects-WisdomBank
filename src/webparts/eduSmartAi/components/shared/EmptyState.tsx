import * as React from 'react';
import styles from './EmptyState.module.scss';

export interface IEmptyStateProps {
  title: string;
  description: string;
}

const EmptyState: React.FC<IEmptyStateProps> = ({ title, description }) => (
  <div className={styles.emptyState} role="status">
    <div className={styles.ilustration} />
    <h2>{title}</h2>
    <p>{description}</p>
  </div>
);

export default EmptyState;
