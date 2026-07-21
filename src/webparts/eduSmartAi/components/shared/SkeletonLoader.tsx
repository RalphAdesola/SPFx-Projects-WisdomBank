import * as React from 'react';
import styles from './SkeletonLoader.module.scss';

export interface ISkeletonLoaderProps {
  lines?: number;
}

const SkeletonLoader: React.FC<ISkeletonLoaderProps> = ({ lines = 3 }) => (
  <div className={styles.skeleton} aria-busy="true">
    {Array.from({ length: lines }).map((_, index) => (
      <div key={index} className={styles.line} />
    ))}
  </div>
);

export default SkeletonLoader;
