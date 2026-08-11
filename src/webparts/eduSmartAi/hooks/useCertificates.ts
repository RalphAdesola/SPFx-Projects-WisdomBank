import { useEffect, useState } from 'react';
import { SPFI } from '@pnp/sp';
import {
  AssessmentResultService,
  IAssessmentCertificate
} from '../services/AssessmentResultService';

export function useCertificates(sp: SPFI, currentUserId: number, learnerName: string) {
  const [data, setData] = useState<IAssessmentCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(undefined);

    new AssessmentResultService(sp).getCertificates(currentUserId, learnerName)
      .then((certificates) => {
        if (isMounted) {
          setData(certificates);
        }
      })
      .catch((reason: unknown) => {
        if (isMounted) {
          setData([]);
          setError(reason instanceof Error ? reason : new Error('Unable to load certificates.'));
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
  }, [sp, currentUserId, learnerName]);

  return { data, isLoading, error };
}
