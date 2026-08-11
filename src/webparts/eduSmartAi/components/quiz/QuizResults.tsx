import * as React from 'react';
import { DefaultButton, PrimaryButton } from '@fluentui/react';
import styles from './QuizResults.module.scss';

export interface IQuizResultsProps {
  score: number;
  passed: boolean;
  correctCount: number;
  incorrectCount: number;
  onRetake: () => void;
  onViewCertificates: () => void;
}

const QuizResults: React.FC<IQuizResultsProps> = ({
  score,
  passed,
  correctCount,
  incorrectCount,
  onRetake,
  onViewCertificates
}) => (
  <div className={styles.resultsCard}>
    <div className={styles.header}>
      <div>
        <h2>{score}%</h2>
        <p>{passed ? 'Pass' : 'Fail'}</p>
      </div>
    </div>
    <div className={styles.breakdown}>
      <div>
        <span>Correct</span>
        <strong>{correctCount}</strong>
      </div>
      <div>
        <span>Incorrect</span>
        <strong>{incorrectCount}</strong>
      </div>
    </div>
    <div className={styles.actions}>
      <DefaultButton text="Retake Quiz" onClick={onRetake} />
      <PrimaryButton
        text="View Certificate"
        iconProps={{ iconName: 'Certificate' }}
        onClick={onViewCertificates}
      />
    </div>
  </div>
);

export default QuizResults;
