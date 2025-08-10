import { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Phim Mới | Cập nhật phim mới nhất và hot nhất',
  description: 'Khám phá các bộ phim mới nhất và hot nhất tại MyPhim. Cập nhật liên tục phim chiếu rạp, phim bộ và anime mới nhất với chất lượng cao và hoàn toàn miễn phí.',
  keywords: 'phim mới, phim mới nhất, phim hot, phim chiếu rạp mới, phim bộ mới, anime mới, cập nhật phim, myphim',
  openGraph: {
    title: 'Phim Mới | MyPhim - Cập nhật phim mới nhất và hot nhất',
    description: 'Khám phá các bộ phim mới nhất và hot nhất tại MyPhim. Cập nhật liên tục phim chiếu rạp, phim bộ và anime mới nhất với chất lượng cao và hoàn toàn miễn phí.',
    url: 'https://myphim.com/phim-moi',
    siteName: 'MyPhim',
    images: [
      {
        url: 'https://myphim.com/images/latest-movies-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Phim Mới - MyPhim',
      }
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Phim Mới | MyPhim - Cập nhật phim mới nhất và hot nhất',
    description: 'Khám phá các bộ phim mới nhất và hot nhất tại MyPhim. Cập nhật liên tục phim chiếu rạp, phim bộ và anime mới nhất với chất lượng cao và hoàn toàn miễn phí.',
    images: ['https://myphim.com/images/latest-movies-twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://myphim.com/phim-moi',
  },
};

export default function PhimMoiLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
} 