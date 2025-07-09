import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MyPhim - Phim hay mỗi ngày',
  description: 'Trang web xem phim trực tuyến với đa dạng thể loại, cập nhật nhanh chóng và chất lượng cao.',
  icons: {
    icon: '/myphim-icon.svg',
    apple: '/myphim-icon.svg',
  },
  openGraph: {
    title: 'MyPhim - Phim hay mỗi ngày',
    description: 'Trang xem phim trực tuyến chất lượng cao, đa dạng thể loại và cập nhật nhanh chóng',
    url: 'https://myphim.com',
    siteName: 'MyPhim',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: '/myphim-logo.svg',
        width: 200,
        height: 200,
        alt: 'MyPhim Logo',
      }
    ],
  },
};

'use client';

import './globals.css'
import { Inter } from 'next/font/google'
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@fontsource/oswald';
import '@fontsource/montserrat';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const inter = Inter({ subsets: ['latin'] })

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="/myphim-icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/myphim-icon.svg" />
      </head>
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen bg-gray-50 text-gray-900">
            <Header />
            <main className="pt-16">{children}</main>
            <Footer />
          </div>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  )
}
