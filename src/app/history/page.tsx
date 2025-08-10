"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useSession } from 'next-auth/react';
import Loading from '@/components/Loading';

interface MovieView {
  id: string;
  movieId: string;
  viewedAt: string;
  movie: {
    id: string;
    name: string;
    origin_name: string;
    thumb_url: string;
    year: number;
    categories: { id: string; name: string; slug: string }[];
  } | null;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<MovieView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Hàm xử lý URL hình ảnh
  const getImageUrl = (url: string) => {
    if (!url) return '/placeholder.jpg';
    if (url.startsWith('http')) return url;
    return `https://img.phimapi.com/${url}`;
  };
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/history');
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/history?page=${page}&limit=12`);
        const data = await response.json();
        
        if (data.success) {
          setHistory(data.history || []);
          setTotalPages(data.pagination?.totalPages || 1);
        } else {
          setError('Không thể tải lịch sử xem');
        }
      } catch (err) {
        setError('Đã xảy ra lỗi khi tải lịch sử xem');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' || user) {
      fetchHistory();
    }
  }, [status, user, router, page]);

  const handleChangePage = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  if (authLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" showLogo />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] py-8 px-4">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Lịch sử xem phim</h1>
          <p className="text-gray-400">Danh sách các phim bạn đã xem gần đây</p>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <Loading size="lg" />
          </div>
        ) : error ? (
          <div className="bg-[#181818] rounded-lg p-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => setPage(1)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-[#181818] rounded-lg p-8 text-center">
            <Image
              src="/placeholder.jpg"
              alt="Empty history"
              width={120}
              height={120}
              className="mx-auto mb-4 rounded-lg opacity-60"
            />
            <h3 className="text-xl font-semibold text-white mb-4">
              Bạn chưa xem phim nào
            </h3>
            <Link
              href="/"
              className="px-6 py-3 bg-red-600 text-white rounded-lg inline-block hover:bg-red-700 transition-colors"
            >
              Khám phá phim ngay
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {history.map((item) => (
                item.movie && (
                  <div key={item.id} className="bg-[#181818] rounded-lg overflow-hidden">
                    <Link href={`/movie/${item.movieId}`}>
                      <div className="relative aspect-[2/3]">
                        <Image
                          src={getImageUrl(item.movie.thumb_url || '')}
                          alt={item.movie.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                        
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h3 className="text-white font-medium text-sm line-clamp-2 mb-1">
                            {item.movie.name}
                          </h3>
                          <div className="flex justify-between items-center text-xs text-gray-300">
                            <span>{item.movie.year}</span>
                            <span>
                              {item.movie.categories && item.movie.categories[0]?.name}
                            </span>
                          </div>
                        </div>
                        
                        <div className="absolute top-2 right-2">
                          <span className="bg-red-600/80 text-white text-xs px-2 py-1 rounded">
                            Đã xem
                          </span>
                        </div>
                      </div>
                    </Link>
                    <div className="p-2">
                      <div className="text-xs text-gray-400">
                        Xem lần cuối: {formatDate(item.viewedAt)}
                      </div>
                      <div className="mt-2">
                        <Link
                          href={`/watch/${item.movieId}`}
                          className="flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded py-1.5 w-full transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                          </svg>
                          Tiếp tục xem
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleChangePage(page - 1)}
                    disabled={page === 1}
                    className={`w-10 h-10 flex items-center justify-center rounded ${
                      page === 1
                        ? 'bg-zinc-800 text-gray-500 cursor-not-allowed'
                        : 'bg-zinc-800 text-white hover:bg-zinc-700'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Hiển thị 5 trang quanh trang hiện tại
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={i}
                        onClick={() => handleChangePage(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center rounded ${
                          page === pageNum
                            ? 'bg-red-600 text-white'
                            : 'bg-zinc-800 text-white hover:bg-zinc-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handleChangePage(page + 1)}
                    disabled={page === totalPages}
                    className={`w-10 h-10 flex items-center justify-center rounded ${
                      page === totalPages
                        ? 'bg-zinc-800 text-gray-500 cursor-not-allowed'
                        : 'bg-zinc-800 text-white hover:bg-zinc-700'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 