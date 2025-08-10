import { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đăng ký tài khoản | MyPhim',
  description: 'Đăng ký tài khoản MyPhim để trải nghiệm đầy đủ các tính năng xem phim trực tuyến và lưu trữ danh sách phim yêu thích.',
  keywords: 'đăng ký, register, tạo tài khoản myphim, xem phim trực tuyến',
  openGraph: {
    title: 'Đăng ký tài khoản | MyPhim',
    description: 'Đăng ký tài khoản MyPhim để trải nghiệm đầy đủ các tính năng xem phim trực tuyến và lưu trữ danh sách phim yêu thích.',
    url: 'https://myphim.com/register',
    siteName: 'MyPhim',
    images: [
      {
        url: 'https://myphim.com/images/register-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Đăng ký - MyPhim',
      }
    ],
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
} 