import { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Giới thiệu về MyPhim | Nền tảng xem phim trực tuyến hàng đầu',
  description: 'MyPhim là nền tảng xem phim trực tuyến hàng đầu với kho phim đa dạng, chất lượng cao, cập nhật nhanh chóng và hoàn toàn miễn phí.',
  keywords: 'myphim, xem phim trực tuyến, phim lẻ, phim bộ, phim chiếu rạp, hoạt hình, miễn phí',
  openGraph: {
    title: 'Giới thiệu về MyPhim | Nền tảng xem phim trực tuyến hàng đầu',
    description: 'MyPhim là nền tảng xem phim trực tuyến hàng đầu với kho phim đa dạng, chất lượng cao, cập nhật nhanh chóng và hoàn toàn miễn phí.',
    url: 'https://myphim.com/about',
    siteName: 'MyPhim',
    images: [
      {
        url: 'https://myphim.com/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'MyPhim - Nền tảng xem phim trực tuyến',
      }
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Giới thiệu về MyPhim | Nền tảng xem phim trực tuyến hàng đầu',
    description: 'MyPhim là nền tảng xem phim trực tuyến hàng đầu với kho phim đa dạng, chất lượng cao, cập nhật nhanh chóng và hoàn toàn miễn phí.',
    images: ['https://myphim.com/images/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://myphim.com/about',
  },
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
} 