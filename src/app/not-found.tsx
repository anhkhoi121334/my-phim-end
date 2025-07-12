'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';

export default function NotFound() {
  // Thêm hiệu ứng nền khi trang được tải
  useEffect(() => {
    document.body.classList.add('error-page');
    return () => {
      document.body.classList.remove('error-page');
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-[#0d1117] to-[#161b22] text-white">
      <div className="text-center max-w-md mx-auto">
        <Image
          src="/myphim-logo.svg"
          alt="MyPhim Logo"
          width={80}
          height={80}
          className="mx-auto mb-6"
        />
        
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">Trang Không Tồn Tại</h2>
        
        <p className="text-gray-400 mb-8">
          Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          Vui lòng quay lại trang chủ để tiếp tục.
        </p>
        
        <Link href="/" className="inline-flex items-center px-6 py-3 text-base font-medium rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors duration-300">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Về Trang Chủ
        </Link>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/phim-moi" className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-300">
            Phim Mới
          </Link>
          <Link href="/phim-le" className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-300">
            Phim Lẻ
          </Link>
          <Link href="/phim-bo" className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-300">
            Phim Bộ
          </Link>
          <Link href="/hoat-hinh" className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-300">
            Hoạt Hình
          </Link>
        </div>
      </div>
    </div>
  );
} 