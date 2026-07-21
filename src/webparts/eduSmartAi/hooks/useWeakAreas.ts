import { useCallback, useEffect, useState } from 'react';
import { WeakAreaService } from '../services/WeakAreaService';
import { IWeakArea } from '../types/IWeakArea';
import { IStudentProgress } from '../types/IStudentProgress';

export interface IDataResult<T> {
  data: T;
  isLoading: boolean;
  error?: Error;
  refetch: () => void;
}

export function useWeakAreas(progress?: IStudentProgress[]): IDataResult<IWeakArea[]> {
  const [data, setData] = useState<IWeakArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  const service = new WeakAreaService();

  const fetchWeakAreas = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);
    try {
      const weakAreas = progress ? await service.getWeakAreas(progress) : [];
      setData(weakAreas || []);
    } catch (err) {
      setError(err as Error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [progress, service]);

  useEffect(() => {
    void fetchWeakAreas();
  }, [fetchWeakAreas]);

  return { data, isLoading, error, refetch: fetchWeakAreas };
}