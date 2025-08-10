import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'MyPhim - Phim hay mỗi ngày',
    template: '%s | MyPhim'
  },
  description: 'Trang web xem phim trực tuyến với đa dạng thể loại, cập nhật nhanh chóng và chất lượng cao.',
  icons: {
    icon: '/myphim-icon.svg',
    apple: '/myphim-icon.svg',
  },
  openGraph: {
    title: {
      default: 'MyPhim - Phim hay mỗi ngày',
      template: '%s | MyPhim'
    },
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
}; 