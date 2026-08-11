import * as React from 'react';
import { MessageBar, MessageBarType, PrimaryButton } from '@fluentui/react';
import { SPFI } from '@pnp/sp';
import PageHeader from '../shared/PageHeader';
import SkeletonLoader from '../shared/SkeletonLoader';
import QuizQuestion, { IAssessmentQuestion } from './QuizQuestion';
import QuizResults from './QuizResults';
import { useQuiz } from '../../hooks/useQuiz';
import { IUser } from '../../types/IUser';
import { ICourse } from '../../types/ICourse';
import { getCourseAssessment } from './assessmentQuestionBanks';
import styles from './QuizScreen.module.scss';

export interface IQuizScreenProps {
  theme: 'dark' | 'light';
  sp: SPFI;
  currentUser: IUser;
  currentUserId: number;
  course?: ICourse;
  onViewCertificates: () => void;
}

const QuizScreen: React.FC<IQuizScreenProps> = ({
  theme,
  sp,
  currentUser,
  currentUserId,
  course,
  onViewCertificates
}) => {
  const { isLoading, isSubmitting, error, submitQuiz, resetSubmission } = useQuiz(sp);
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<number, string>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const assessment = getCourseAssessment(course?.title);
  const questions: IAssessmentQuestion[] = assessment.questions;

  const allAnswered = questions.length === Object.keys(answers).length;
  const correctCount = questions.reduce(
    (total, question, index) => total + (answers[index] === question.answer ? 1 : 0),
    0
  );
  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= assessment.passingScore;

  const handleSelect = (value: string): void => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: value }));
  };

  const handleSubmit = async (): Promise<void> => {
    const saved = await submitQuiz({
      assessmentTitle: assessment.title,
      courseTitle: course?.title || 'Workplace Cybersecurity Awareness',
      relatedMaterialTitle: course?.title || 'Workplace Cybersecurity Awareness',
      passingScore: assessment.passingScore,
      timeLimitMinutes: assessment.timeLimitMinutes,
      questions: questions.map((question, index) => ({
        title: `Question ${index + 1}`,
        questionText: question.text,
        questionType: question.options.length === 2 ? 'True/False' : 'Multiple Choice',
        options: question.options,
        correctAnswer: question.answer,
        points: 1
      })),
      userId: currentUserId,
      userDisplayName: currentUser.displayName,
      userEmail: currentUser.email || currentUser.loginName,
      score,
      passed,
      correctAnswers: correctCount,
      incorrectAnswers: questions.length - correctCount,
      totalQuestions: questions.length,
      answersJSON: JSON.stringify(
        questions.map((question, index) => ({
          question: question.text,
          selectedAnswer: answers[index],
          isCorrect: answers[index] === question.answer
        }))
      ),
      submittedAt: new Date().toISOString()
    });

    if (saved) {
      setSubmitted(true);
    }
  };

  return (
    <div className={styles.container}>
      <PageHeader title="Assessment" subtitle="Complete the knowledge check and submit your responses when ready." theme={theme} />
      {isLoading ? (
        <SkeletonLoader lines={4} />
      ) : submitted ? (
        <>
          <MessageBar messageBarType={MessageBarType.success}>
            Assessment completed and scored. Your result has been saved. Proceed to view/download your certificate.
          </MessageBar>
          <QuizResults
            score={score}
            passed={passed}
            correctCount={correctCount}
            incorrectCount={questions.length - correctCount}
            onViewCertificates={onViewCertificates}
            onRetake={() => {
              setAnswers({});
              setSubmitted(false);
              setCurrentQuestion(0);
              resetSubmission();
            }}
          />
        </>
      ) : (
        <div className={styles.quizArea}>
          {error ? (
            <MessageBar messageBarType={MessageBarType.error}>
              Assessment could not be saved: {error.message}
            </MessageBar>
          ) : null}
          <div className={styles.navBar}>
            <span>
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span>Time left: {assessment.timeLimitMinutes}:00</span>
          </div>
          <QuizQuestion
            question={questions[currentQuestion]}
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
              onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
              disabled={currentQuestion === questions.length - 1}
            />
            <PrimaryButton
              text={isSubmitting ? 'Submitting...' : 'Submit Assessment'}
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizScreen;
