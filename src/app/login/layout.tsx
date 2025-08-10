import { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đăng nhập | MyPhim',
  description: 'Đăng nhập vào tài khoản MyPhim để trải nghiệm đầy đủ các tính năng xem phim trực tuyến.',
  keywords: 'đăng nhập, login, tài khoản myphim, xem phim trực tuyến',
  openGraph: {
    title: 'Đăng nhập | MyPhim',
    description: 'Đăng nhập vào tài khoản MyPhim để trải nghiệm đầy đủ các tính năng xem phim trực tuyến.',
    url: 'https://myphim.com/login',
    siteName: 'MyPhim',
    images: [
      {
        url: 'https://myphim.com/images/login-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Đăng nhập - MyPhim',
      }
    ],
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
} 