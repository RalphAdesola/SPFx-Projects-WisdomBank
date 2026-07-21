import { useEffect, useState } from 'react';

export function useNotifications() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(false);
    setData([]);
  }, []);

  return {
    data,
    isLoading
  };
}