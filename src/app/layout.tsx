'use client';

import './globals.css'
import { Inter } from 'next/font/google'
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@fontsource/oswald';
import '@fontsource/montserrat';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { metadata } from './metadata';

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
        {/* SEO Meta Tags */}
        <title>{metadata.title as string}</title>
        <meta name="description" content={metadata.description as string} />
        {/* Open Graph */}
        <meta property="og:title" content={metadata.openGraph?.title as string} />
        <meta property="og:description" content={metadata.openGraph?.description as string} />
        <meta property="og:url" content={metadata.openGraph?.url as string} />
        {/* 
          Sửa lỗi TypeScript liên quan đến thuộc tính không tồn tại và kiểu dữ liệu không xác định.
          - 'type' không tồn tại trong OpenGraphMetadata, nên cần loại bỏ hoặc kiểm tra kỹ.
          - 'images' có thể là một object hoặc một mảng, nên cần kiểm tra kiểu trước khi truy cập phần tử [0].
        */}
        <meta property="og:site_name" content={metadata.openGraph?.siteName as string} />
        <meta property="og:locale" content={metadata.openGraph?.locale as string} />
        {/* <meta property="og:type" content={metadata.openGraph?.type as string} /> */}
        {(() => {
          // Kiểm tra kiểu của images: nếu là mảng thì lấy phần tử đầu, nếu là object thì dùng trực tiếp
          const images = metadata.openGraph?.images;
          let imageObj: any = undefined;
          if (Array.isArray(images)) {
            imageObj = images[0];
          } else if (images && typeof images === 'object') {
            imageObj = images;
          }
          return (
            <>
              <meta property="og:image" content={imageObj?.url || ''} />
              <meta property="og:image:width" content={String(imageObj?.width || '')} />
              <meta property="og:image:height" content={String(imageObj?.height || '')} />
              <meta property="og:image:alt" content={imageObj?.alt || ''} />
            </>
          );
        })()}
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
