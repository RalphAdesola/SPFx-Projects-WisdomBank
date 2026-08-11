import { useState } from 'react';
import { SPFI } from '@pnp/sp';
import { IAssessmentAttempt, QuizService } from '../services/QuizService';

export interface IQuizResult {
  isLoading: boolean;
  isSubmitting: boolean;
  error?: Error;
  submitQuiz: (attempt: IAssessmentAttempt) => Promise<boolean>;
  resetSubmission: () => void;
}

export function useQuiz(sp: SPFI): IQuizResult {
  const [isLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>();

  return {
    isLoading,
    isSubmitting,
    error,
    submitQuiz: async (attempt: IAssessmentAttempt): Promise<boolean> => {
      setIsSubmitting(true);
      setError(undefined);

      try {
        await new QuizService(sp).submitAssessment(attempt);
        return true;
      } catch (reason) {
        setError(reason instanceof Error ? reason : new Error('Unable to save the assessment attempt.'));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    resetSubmission: (): void => {
      setError(undefined);
    }
  };
}
