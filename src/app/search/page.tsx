'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { searchMovies } from '@/services/api/movieApi';
import type { Movie } from '@/services/api/movieApi';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!query) {
      setMovies([]);
      setLoading(false);
      return;
    }

    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        const response = await searchMovies(query, page);
        setMovies(response.data.items);
        setTotalPages(response.data.totalPages);
        setLoading(false);
      } catch (err) {
        console.error('Error searching movies:', err);
        setError('Không thể tìm kiếm phim. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {query ? `Kết quả tìm kiếm cho: "${query}"` : 'Tìm kiếm phim'}
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-10">
          {query ? (
            <p className="text-gray-500">Không tìm thấy phim nào phù hợp với từ khóa "{query}"</p>
          ) : (
            <p className="text-gray-500">Nhập từ khóa để tìm kiếm phim</p>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((movie) => (
              <div key={movie._id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
                <Link href={`/movie/${movie._id}`}>
                  <div className="relative pb-[140%]">
                    <img 
                      src={movie.thumb_url || '/placeholder.jpg'} 
                      alt={movie.name}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-fuchsia-600 text-white text-xs px-2 py-1 rounded">
                      {movie.quality}
                    </div>
                    {movie.lang && (
                      <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        {movie.lang}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-white font-semibold line-clamp-2 h-12">{movie.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">{movie.origin_name}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-400 text-sm">{movie.year}</span>
                      <span className="text-fuchsia-400 text-sm">{movie.episode_current}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded ${
                    page === 1 ? 'bg-gray-700 text-gray-400' : 'bg-fuchsia-600 text-white hover:bg-fuchsia-700'
                  }`}
                >
                  Trước
                </button>
                <span className="px-4 py-2 bg-gray-800 text-white rounded">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded ${
                    page === totalPages ? 'bg-gray-700 text-gray-400' : 'bg-fuchsia-600 text-white hover:bg-fuchsia-700'
                  }`}
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 