'use client';

import { QueryClient, QueryClientProvider as Provider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';

export default function QueryClientProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000,
          },
        },
      })
  );

  return <Provider client={queryClient}>{children}</Provider>;
}