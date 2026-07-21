import { useState } from 'react';

export function useQuiz() {
  const [isLoading] = useState<boolean>(false);

  return {
    data: null,
    isLoading,
    submitQuiz: async (): Promise<boolean> => {
      return true;
    }
  };
}