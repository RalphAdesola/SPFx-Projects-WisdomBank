import * as React from 'react';
import styles from './ProgressBar.module.scss';

export interface IProgressBarProps {
  value: number;
  max?: number;
}

const ProgressBar: React.FC<IProgressBarProps> = ({ value, max = 100 }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={styles.track} aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100} role="progressbar">
      <div className={styles.fill} style={{ width: `${percentage}%` }} />
    </div>
  );
};

export default ProgressBar;
