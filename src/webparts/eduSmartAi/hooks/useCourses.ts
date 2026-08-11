import { useEffect, useState } from 'react';
import { SPFI } from '@pnp/sp';
import { ICourse } from '../types/ICourse';
import { CourseService } from '../services/CourseService';

export interface IDataResult<T> {
  data: T;
  isLoading: boolean;
  error?: Error;
}

export function useCourses(sp: SPFI): IDataResult<ICourse[]> {
  const [data, setData] = useState<ICourse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    let isMounted = true;
    const service = new CourseService(sp);

    setIsLoading(true);
    setError(undefined);
    service.getCourses()
      .then((courses) => {
        if (isMounted) {
          setData(courses);
        }
      })
      .catch((reason: unknown) => {
        if (isMounted) {
          setData([]);
          setError(reason instanceof Error ? reason : new Error('Unable to load Learning Materials from SharePoint.'));
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
  }, [sp]);

  return {
    data,
    isLoading,
    error
  };
}
