"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import movieApi, { Movie } from '@/services/api/movieApi';
import MovieCard from '@/components/MovieCard';

interface CountryPageProps {
  params: {
    slug: string;
  };
}

export default function CountryMoviesPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [countryName, setCountryName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Country name mapping
  const countryNames: Record<string, string> = {
    'viet-nam': 'Việt Nam',
    'trung-quoc': 'Trung Quốc',
    'han-quoc': 'Hàn Quốc',
    'nhat-ban': 'Nhật Bản',
    'thai-lan': 'Thái Lan',
    'au-my': 'Âu Mỹ',
    'hong-kong': 'Hồng Kông',
    'dai-loan': 'Đài Loan',
    'an-do': 'Ấn Độ',
    'philippines': 'Philippines',
    'malaysia': 'Malaysia',
    'indonesia': 'Indonesia',
    'singapore': 'Singapore',
    'anh': 'Anh',
    'phap': 'Pháp',
    'canada': 'Canada',
    'duc': 'Đức',
    'tay-ban-nha': 'Tây Ban Nha',
    'uc': 'Úc',
    'y': 'Ý',
    'nga': 'Nga',
    'khac': 'Quốc gia khác',
  };

  useEffect(() => {
    const fetchMoviesByCountry = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get country name
        const name = countryNames[slug] || 'Quốc gia không xác định';
        setCountryName(name);
        
        // Get movies by country
        const response = await movieApi.fetchMoviesByCountry(slug, currentPage);
        
        if (response.status && response.items.length > 0) {
          setMovies(response.items);
          setTotalPages(response.pagination?.totalPages || 1);
        } else {
          setError(`Không tìm thấy phim từ ${name}`);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error(`Lỗi khi tải phim từ quốc gia ${slug}:`, err);
        setError(`Đã xảy ra lỗi khi tải phim. Vui lòng thử lại sau.`);
        setIsLoading(false);
      }
    };

    fetchMoviesByCountry();
  }, [slug, currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md ${
          currentPage === 1
            ? 'text-gray-500 cursor-not-allowed'
            : 'text-blue-400 hover:bg-blue-500/20'
        }`}
      >
        &laquo;
      </button>
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key="1"
          onClick={() => handlePageChange(1)}
          className="px-3 py-1 rounded-md text-blue-400 hover:bg-blue-500/20"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-2">
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md ${
            i === currentPage
              ? 'bg-blue-500 text-white'
              : 'text-blue-400 hover:bg-blue-500/20'
          }`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-2">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-1 rounded-md text-blue-400 hover:bg-blue-500/20"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md ${
          currentPage === totalPages
            ? 'text-gray-500 cursor-not-allowed'
            : 'text-blue-400 hover:bg-blue-500/20'
        }`}
      >
        &raquo;
      </button>
    );

    return (
      <div className="flex justify-center items-center space-x-1 mt-8">
        {pages}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Đang tải...
            </span>
          </div>
          <p className="mt-4 text-lg">Đang tải danh sách phim...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center glass-card p-8 max-w-lg">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-xl mb-4">{error}</p>
          <div className="flex justify-center gap-4">
            <button 
              className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
              onClick={() => window.location.reload()}
            >
              Thử lại
            </button>
            <Link 
              href="/quoc-gia" 
              className="mt-4 bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
            >
              Quay lại
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/quoc-gia" className="text-blue-400 hover:text-blue-300">
              Quốc gia
            </Link>
            <span className="text-gray-500">/</span>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{countryName}</h1>
          </div>
          <p className="text-gray-400 mt-1">Danh sách phim {countryName}</p>
        </div>
      </div>
      
      {movies.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {movies.map(movie => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
          
          {renderPagination()}
        </>
      ) : (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
          <p className="text-xl text-gray-400">Không tìm thấy phim nào từ {countryName}</p>
        </div>
      )}
    </main>
  );
} 