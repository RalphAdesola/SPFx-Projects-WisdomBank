import * as React from 'react';
import styles from './TypingIndicator.module.scss';

const TypingIndicator: React.FC = () => (
  <div className={styles.indicator} aria-live="polite">
    <span />
    <span />
    <span />
  </div>
);

export default TypingIndicator;
