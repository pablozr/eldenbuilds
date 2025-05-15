'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CsrfProvider } from './components/csrf-provider';

// Create a client
const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <CsrfProvider>
        {children}
      </CsrfProvider>
    </QueryClientProvider>
  );
}
