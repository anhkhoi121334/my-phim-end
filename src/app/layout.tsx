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
  description: 'Trang phim online chất lượng cao',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
          <Header />
        <div className="pt-16 md:pt-20">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}
