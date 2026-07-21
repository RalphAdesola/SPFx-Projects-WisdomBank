import * as React from 'react';
import { IQuiz } from '../../types/IQuiz';
import styles from './QuizQuestion.module.scss';

export interface IQuizQuestionProps {
  question: any;
  index: number;
  selected?: string;
  onSelect: (value: string) => void;
}

const QuizQuestion: React.FC<IQuizQuestionProps> = ({ question, index, selected, onSelect }) => (
  <div className={styles.questionCard}>
    <div className={styles.questionHeader}>
      <span>Question {index + 1}</span>
      <p>{question.text}</p>
    </div>
    <div className={styles.options}>
      {question.options.map((option: string) => (
        <button
          key={option}
          type="button"
          className={`${styles.optionButton} ${selected === option ? styles.selected : ''}`}
          onClick={() => onSelect(option)}
          aria-pressed={selected === option}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);

export default QuizQuestion;
