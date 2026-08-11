import { useCallback, useEffect, useState } from 'react';
import { SPFI } from '@pnp/sp';
import {
  ICourseLearningState,
  LearningProgressService
} from '../services/LearningProgressService';

export interface ILearningProgressResult {
  data: ICourseLearningState[];
  isLoading: boolean;
  error?: Error;
  refresh: () => Promise<void>;
  markStarted: (userName: string, courseTitle: string, courseId?: number) => Promise<void>;
  markProgress: (userName: string, courseTitle: string, progressPercent: number, courseId?: number) => Promise<void>;
  markCompleted: (userName: string, courseTitle: string, courseId?: number) => Promise<void>;
}

export function useLearningProgress(sp: SPFI, userId: number): ILearningProgressResult {
  const [data, setData] = useState<ICourseLearningState[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | undefined>();

  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(undefined);
    try {
      setData(await new LearningProgressService(sp).getStates(userId));
    } catch (reason) {
      setError(reason instanceof Error ? reason : new Error('Unable to load learning progress.'));
    } finally {
      setIsLoading(false);
    }
  }, [sp, userId]);

  useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh]);

  const markStarted = useCallback(async (userName: string, courseTitle: string, courseId?: number): Promise<void> => {
    await new LearningProgressService(sp).markStarted(userId, userName, courseTitle, courseId);
    await refresh();
  }, [sp, userId, refresh]);

  const markProgress = useCallback(async (
    userName: string,
    courseTitle: string,
    progressPercent: number,
    courseId?: number
  ): Promise<void> => {
    await new LearningProgressService(sp).markProgress(userId, userName, courseTitle, progressPercent, courseId);
    await refresh();
  }, [sp, userId, refresh]);

  const markCompleted = useCallback(async (userName: string, courseTitle: string, courseId?: number): Promise<void> => {
    await new LearningProgressService(sp).markCompleted(userId, userName, courseTitle, courseId);
    await refresh();
  }, [sp, userId, refresh]);

  return {
    data,
    isLoading,
    error,
    refresh,
    markStarted,
    markProgress,
    markCompleted
  };
}
