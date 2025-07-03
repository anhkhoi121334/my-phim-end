import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@fontsource/oswald';
import '@fontsource/montserrat';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MyPhim - Phim hay mỗi ngày',
  description: 'Trang xem phim trực tuyến chất lượng cao, đa dạng thể loại và cập nhật nhanh chóng',
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
}

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
          <Header />
        <div className="pt-16">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}
