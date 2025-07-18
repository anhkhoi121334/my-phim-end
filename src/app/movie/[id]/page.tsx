"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import movieApi, { Movie } from '@/services/api/movieApi';
import MovieCard from '@/components/MovieCard';

export default function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setError(null);
        const movieDetails = await movieApi.getMovieDetails(id as string);
        if (movieDetails.status && movieDetails.movie) {
          setMovie(movieDetails.movie);

          // Fetch related movies
          const relatedResponse = await movieApi.getLatestMovies(1, 12);
          if (relatedResponse.status && relatedResponse.items) {
            setRelatedMovies(relatedResponse.items);
          }
        } else {
          setError('Không tìm thấy phim');
        }
      } catch (err) {
        console.error('Error fetching movie data:', err);
        setError('Đã xảy ra lỗi khi tải thông tin phim');
      }
    };

    if (id) {
      fetchMovieData();
    }
  }, [id]);

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

  if (!movie) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Movie title and navigation */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/" className="hover:text-blue-500">Trang chủ</Link>
          <span>/</span>
          <span>{movie.name}</span>
        </div>
        <h1 className="text-2xl font-bold">{movie.name}</h1>
        {movie.origin_name && (
          <p className="text-gray-500">{movie.origin_name}</p>
        )}
      </div>

      {/* Movie info */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Poster */}
          <div className="w-full md:w-48 flex-shrink-0">
            <div className="aspect-[2/3] relative rounded-lg overflow-hidden">
              <Image
                src={movie.poster_url || movie.thumb_url}
                alt={movie.name}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex-grow">
            <h2 className="text-xl font-semibold mb-4">Thông tin phim</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="mb-2">
                  <span className="font-medium">Trạng thái:</span>{' '}
                  <span className="text-blue-600">{movie.episode_current}</span>
                </p>
                <p className="mb-2">
                  <span className="font-medium">Thời lượng:</span>{' '}
                  {movie.time}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Năm phát hành:</span>{' '}
                  {movie.year}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Chất lượng:</span>{' '}
                  {movie.quality}
                </p>
              </div>
              <div>
                <p className="mb-2">
                  <span className="font-medium">Quốc gia:</span>{' '}
                  {movie.country.map(c => (
                    <Link
                      key={c.slug}
                      href={`/quoc-gia/${c.slug}`}
                      className="text-blue-600 hover:underline"
                    >
                      {c.name}
                    </Link>
                  ))}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Thể loại:</span>{' '}
                  {movie.category.map((cat, index) => [
                    <Link
                      key={cat.slug}
                      href={`/the-loai/${cat.slug}`}
                      className="text-blue-600 hover:underline"
                    >
                      {cat.name}
                    </Link>,
                    index < movie.category.length - 1 ? ', ' : ''
                  ])}
                </p>
              </div>
            </div>

            {/* Description */}
            {movie.content && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Nội dung phim:</h3>
                <p className="text-gray-600 whitespace-pre-line">{movie.content}</p>
              </div>
            )}

            {/* Watch button */}
            <div className="mt-6">
              <Link
                href={`/watch/${movie.slug}`}
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Xem phim
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Related movies */}
      {relatedMovies.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Có thể bạn cũng thích</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {relatedMovies.map(movie => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 