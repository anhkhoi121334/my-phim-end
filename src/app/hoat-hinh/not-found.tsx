'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
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
          Nội dung hoạt hình bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors duration-300">
            Về Trang Chủ
          </Link>
          <Link href="/hoat-hinh" className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-300">
            Xem Phim Hoạt Hình
          </Link>
        </div>
      </div>
    </div>
  );
} 