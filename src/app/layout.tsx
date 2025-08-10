'use client';

import './globals.css'
import { Inter } from 'next/font/google'
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@fontsource/oswald';
import '@fontsource/montserrat';
import { Providers } from './providers';
import { usePathname } from 'next/navigation';
import { GoogleAnalytics } from '@next/third-parties/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
   
  // Nếu là trang admin, không hiển thị Header và Footer
  if (isAdminPage) {
    return (
      <html lang="vi" className="scroll-smooth">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        </head>
        <body className={inter.className}>
          <Providers>
            {children}
          </Providers>
          <GoogleAnalytics gaId="G-XXXXXXXXXX" />
        </body>
      </html>
    );
  }

  // Layout cho các trang thông thường
  return (
    <html lang="vi" className="scroll-smooth dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-[#0d1117] text-white">
            <Header />
            <main className="pt-16 md:pt-20">{children}</main>
            <Footer />
          </div>
        </Providers>
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  )
}
