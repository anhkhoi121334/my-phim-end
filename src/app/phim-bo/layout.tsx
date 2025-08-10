import { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Phim Bộ | Kho phim bộ đa dạng và cập nhật mới nhất',
  description: 'Khám phá kho phim bộ đa dạng tại MyPhim với nhiều thể loại từ Hàn Quốc, Trung Quốc, Mỹ đến Thái Lan. Cập nhật nhanh chóng các tập mới nhất với chất lượng cao.',
  keywords: 'phim bộ, phim truyền hình, phim dài tập, phim hàn quốc, phim trung quốc, phim mỹ, phim thái lan, myphim',
  openGraph: {
    title: 'Phim Bộ | MyPhim - Kho phim bộ đa dạng và cập nhật mới nhất',
    description: 'Khám phá kho phim bộ đa dạng tại MyPhim với nhiều thể loại từ Hàn Quốc, Trung Quốc, Mỹ đến Thái Lan. Cập nhật nhanh chóng các tập mới nhất với chất lượng cao.',
    url: 'https://myphim.com/phim-bo',
    siteName: 'MyPhim',
    images: [
      {
        url: 'https://myphim.com/images/tvseries-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Phim Bộ - MyPhim',
      }
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Phim Bộ | MyPhim - Kho phim bộ đa dạng và cập nhật mới nhất',
    description: 'Khám phá kho phim bộ đa dạng tại MyPhim với nhiều thể loại từ Hàn Quốc, Trung Quốc, Mỹ đến Thái Lan. Cập nhật nhanh chóng các tập mới nhất với chất lượng cao.',
    images: ['https://myphim.com/images/tvseries-twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://myphim.com/phim-bo',
  },
};

export default function PhimBoLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
} 