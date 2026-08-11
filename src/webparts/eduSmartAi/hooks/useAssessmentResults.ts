import { useEffect, useState } from 'react';
import { SPFI } from '@pnp/sp';
import {
  AssessmentResultService,
  IAssessmentResultSummary
} from '../services/AssessmentResultService';

export interface IAssessmentResultData {
  data: IAssessmentResultSummary;
  isLoading: boolean;
  error?: Error;
}

const emptySummary: IAssessmentResultSummary = {
  completedCount: 0,
  averageScore: 0,
  passedCount: 0,
  improvementTrend: 0
};

export function useAssessmentResults(sp: SPFI, currentUserId: number): IAssessmentResultData {
  const [data, setData] = useState<IAssessmentResultSummary>(emptySummary);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    let isMounted = true;
    const service = new AssessmentResultService(sp);

    setIsLoading(true);
    setError(undefined);
    service.getSummary(currentUserId)
      .then((summary) => {
        if (isMounted) {
          setData(summary);
        }
      })
      .catch((reason: unknown) => {
        if (isMounted) {
          setData(emptySummary);
          setError(reason instanceof Error ? reason : new Error('Unable to load assessment results.'));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [sp, currentUserId]);

  return {
    data,
    isLoading,
    error
  };
}
