import { useEffect, useState } from 'react';
import { IUser } from '../types/IUser';

export interface IUserResult {
  data?: IUser;
  isLoading: boolean;
  error?: Error;
  refetch: () => void;
}

export function useCurrentUser(): IUserResult {
  const [data] = useState<IUser | undefined>({
    id: 'emp-1024',
    loginName: 'demo.employee@contoso.com',
    displayName: 'Jordan Lee',
    email: 'jordan.lee@contoso.com'
  });
  const [isLoading] = useState(false);
  const [error] = useState<Error | undefined>(undefined);

  const refetch = () => undefined;

  useEffect(() => {
    return undefined;
  }, []);

  return { data, isLoading, error, refetch };
}
