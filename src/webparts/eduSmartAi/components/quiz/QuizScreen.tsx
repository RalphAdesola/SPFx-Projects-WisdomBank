import * as React from 'react';
import { PrimaryButton } from '@fluentui/react';
import PageHeader from '../shared/PageHeader';
import SkeletonLoader from '../shared/SkeletonLoader';
import QuizQuestion from './QuizQuestion';
import QuizResults from './QuizResults';
import { useQuiz } from '../../hooks/useQuiz';
import styles from './QuizScreen.module.scss';

const sampleQuestions = [
  { text: 'Which action should be taken when a suspicious email is received?', options: ['Forward it to a colleague', 'Report it and do not click any links', 'Delete it without reporting', 'Reply with your password'], answer: 'Report it and do not click any links' },
  { text: 'What is the best way to handle confidential company information?', options: ['Store it in a public folder', 'Share it over personal email', 'Use approved tools and access controls', 'Leave it on a shared desk'], answer: 'Use approved tools and access controls' },
  { text: 'True or False: MFA adds an extra layer of protection to your account.', options: ['True', 'False'], answer: 'True' }
];

export interface IQuizScreenProps {
  theme: 'dark' | 'light';
}

const QuizScreen: React.FC<IQuizScreenProps> = ({ theme }) => {
  const { isLoading } = useQuiz();
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<number, string>>({});
  const [submitted, setSubmitted] = React.useState(false);

  const allAnswered = sampleQuestions.length === Object.keys(answers).length;
  const correctCount = Object.values(answers).filter((value, index) => value === sampleQuestions[index].answer).length;
  const score = Math.round((correctCount / sampleQuestions.length) * 100);
  const passed = score >= 70;

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: value }));
  };

  return (
    <div className={styles.container}>
      <PageHeader title="Assessment" subtitle="Complete the knowledge check and submit your responses when ready." theme={theme} />
      {isLoading ? (
        <SkeletonLoader lines={4} />
      ) : submitted ? (
        <QuizResults
          score={score}
          passed={passed}
          correctCount={correctCount}
          incorrectCount={sampleQuestions.length - correctCount}
          onRetake={() => {
            setAnswers({});
            setSubmitted(false);
            setCurrentQuestion(0);
          }}
        />
      ) : (
        <div className={styles.quizArea}>
          <div className={styles.navBar}>
            <span>
              Question {currentQuestion + 1} of {sampleQuestions.length}
            </span>
            <span>Time left: 12:00</span>
          </div>
          <QuizQuestion
            question={sampleQuestions[currentQuestion]}
            index={currentQuestion}
            selected={answers[currentQuestion]}
            onSelect={handleSelect}
          />
          <div className={styles.controls}>
            <PrimaryButton
              text="Previous"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            />
            <PrimaryButton
              text="Next"
              onClick={() => setCurrentQuestion(Math.min(sampleQuestions.length - 1, currentQuestion + 1))}
              disabled={currentQuestion === sampleQuestions.length - 1}
            />
            <PrimaryButton text="Submit Assessment" onClick={() => setSubmitted(true)} disabled={!allAnswered} />
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizScreen;
