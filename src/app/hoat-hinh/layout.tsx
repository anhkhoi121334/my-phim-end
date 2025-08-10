import { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Phim Hoạt Hình | Kho phim hoạt hình đa dạng và chất lượng cao',
  description: 'Khám phá kho phim hoạt hình đa dạng và phong phú tại MyPhim với nhiều thể loại từ anime Nhật Bản đến hoạt hình 3D Hollywood, cập nhật liên tục và chất lượng cao.',
  keywords: 'phim hoạt hình, anime, hoạt hình 3D, phim hoạt hình Nhật Bản, phim hoạt hình cho trẻ em, myphim',
  openGraph: {
    title: 'Phim Hoạt Hình | MyPhim - Kho phim hoạt hình đa dạng và chất lượng cao',
    description: 'Khám phá kho phim hoạt hình đa dạng và phong phú tại MyPhim với nhiều thể loại từ anime Nhật Bản đến hoạt hình 3D Hollywood, cập nhật liên tục và chất lượng cao.',
    url: 'https://myphim.com/hoat-hinh',
    siteName: 'MyPhim',
    images: [
      {
        url: 'https://myphim.com/images/animation-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Phim Hoạt Hình - MyPhim',
      }
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Phim Hoạt Hình | MyPhim - Kho phim hoạt hình đa dạng và chất lượng cao',
    description: 'Khám phá kho phim hoạt hình đa dạng và phong phú tại MyPhim với nhiều thể loại từ anime Nhật Bản đến hoạt hình 3D Hollywood, cập nhật liên tục và chất lượng cao.',
    images: ['https://myphim.com/images/animation-twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://myphim.com/hoat-hinh',
  },
};

export default function HoatHinhLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
} 