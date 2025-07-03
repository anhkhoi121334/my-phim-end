'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import movieApi, { Movie, Genre, fetchGenres } from '@/services/api/movieApi';
import MovieCard from '@/components/MovieCard';

export default function GenreDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [genre, setGenre] = useState<Genre | null>(null);
  
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    // Get genre details and movies
    const loadGenreData = async () => {
      try {
        // First get genre details
        const allGenres = await fetchGenres();
        const foundGenre = allGenres.find(g => g.slug === slug);
        
        if (foundGenre) {
          setGenre(foundGenre);
          // Then fetch movies for this genre
          fetchMovies(1);
        } else {
          setError('Không tìm thấy thể loại phim này.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading genre data:', err);
        setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    
    loadGenreData();
  }, [slug]);
  
  const fetchMovies = async (page: number) => {
    setLoading(true);
    try {
      const response = await movieApi.fetchMoviesByGenre({
        genreSlug: slug,
        page: page,
        limit: 20,
      });
      
      if (response && response.data && Array.isArray(response.data.items)) {
        setMovies(response.data.items);
        setTotalPages(response.data.totalPages || 1);
        setCurrentPage(page);
      } else {
        setError('Không tìm thấy phim thuộc thể loại này.');
      }
    } catch (error) {
      console.error('Error fetching movies by genre:', error);
      setError('Đã có lỗi xảy ra khi tải phim. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePageChange = (page: number) => {
    fetchMovies(page);
  };
  
  return (
    <div className="pt-20 bg-[#101720] min-h-screen page-transition">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href="/the-loai" className="text-blue-400 hover:text-blue-300 mr-2">
            Thể loại
          </Link>
          <span className="text-gray-400 mx-2">/</span>
          <h1 className="text-2xl md:text-3xl font-bold text-white">{genre?.name || 'Đang tải...'}</h1>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => fetchMovies(1)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Không tìm thấy phim thuộc thể loại này.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                    className="px-4 py-2 rounded bg-gray-800 text-white disabled:opacity-50"
                  >
                    Trước
                  </button>
                  
                  <div className="px-4 py-2 rounded bg-blue-600 text-white">
                    {currentPage} / {totalPages}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                    className="px-4 py-2 rounded bg-gray-800 text-white disabled:opacity-50"
                  >
                    Sau
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