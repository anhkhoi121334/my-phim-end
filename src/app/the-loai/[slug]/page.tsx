'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MovieListPage from '@/components/MovieListPage';
import movieApi from '@/services/api/movieApi';

export default function GenrePage() {
  const { slug } = useParams();
  const [genreName, setGenreName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGenreName = async () => {
      try {
        setError(null);
        const genres = await movieApi.fetchGenres();
        const genre = genres.find(g => g.slug === slug);
        if (genre) {
          setGenreName(genre.name);
        } else {
          setError('Không tìm thấy thể loại này');
        }
      } catch (err) {
        console.error('Error fetching genre:', err);
        setError('Đã xảy ra lỗi khi tải thông tin thể loại');
      }
    };

    if (slug) {
      fetchGenreName();
    }
  }, [slug]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 bg-red-900/20 backdrop-blur-sm rounded-xl border border-red-900/50">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-300 mb-4 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-300 shadow-lg hover:shadow-blue-900/30"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <MovieListPage
      title={genreName ? `Phim ${genreName}` : 'Đang tải...'}
      fetchMovies={async (page, limit, sortBy) => {
        try {
          const response = await movieApi.fetchMoviesByGenre({
            genreSlug: slug as string,
            page,
            limit,
            sortBy
          });
          // Transform the response to match the expected pagination structure
          return {
            status: response.status,
            items: response.items,
            pagination: response.pagination ? {
              totalPages: response.pagination.totalPages,
              currentPage: response.pagination.currentPage,
              pageSize: limit, // Add the missing 'pageSize' from the limit parameter
              total: response.pagination.totalItems // Map 'totalItems' to 'total'
            } : undefined
          };
        } catch (error) {
          console.error('Error fetching movies:', error);
          throw error;
        }
      }}
      showFilters={true}
      showSortOptions={true}
      showPagination={true}
      initialSort="latest"
      pageSize={24}
    />
  );
}