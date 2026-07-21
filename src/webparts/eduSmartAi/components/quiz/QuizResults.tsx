import * as React from 'react';
import { PrimaryButton } from '@fluentui/react';
import styles from './QuizResults.module.scss';

export interface IQuizResultsProps {
  score: number;
  passed: boolean;
  correctCount: number;
  incorrectCount: number;
  onRetake: () => void;
}

const QuizResults: React.FC<IQuizResultsProps> = ({ score, passed, correctCount, incorrectCount, onRetake }) => (
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
    <PrimaryButton text="Retake Quiz" onClick={onRetake} />
  </div>
);

export default QuizResults;
