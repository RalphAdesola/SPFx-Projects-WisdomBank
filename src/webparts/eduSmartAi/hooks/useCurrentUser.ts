import { IUser } from '../types/IUser';

export interface IUserResult {
  data?: IUser;
  isLoading: boolean;
  error?: Error;
  refetch: () => void;
}

export function useCurrentUser(currentUser?: IUser): IUserResult {
  const refetch = () => undefined;

  return {
    data: currentUser,
    isLoading: false,
    error: undefined,
    refetch
  };
}
