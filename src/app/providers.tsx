'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '@/hooks';
import { SessionProvider } from "next-auth/react";
import { SettingsProvider } from '@/contexts/SettingsContext';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SettingsProvider>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
          </SettingsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
} 