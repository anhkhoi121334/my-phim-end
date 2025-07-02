'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import movieApi, { Movie } from '@/services/api/movieApi';
import { useParams } from 'next/navigation';

interface MovieDetailProps {
  params: {
    id: string;
  };
}

export default function MovieDetail({ params }: MovieDetailProps) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Sử dụng useParams hook thay vì truy cập params trực tiếp
  const routeParams = useParams();
  const slug = routeParams.id as string; // Tham số URL là id nhưng thực tế là slug
  
  useEffect(() => {
    const fetchMovieDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Sử dụng getMovieDetails thay vì fetchMovieById vì tham số là slug
        const data = await movieApi.getMovieDetails(slug);
        if (!data.status) {
          // API trả về status=false, hiển thị thông báo từ API
          setError(data.msg || 'Không tìm thấy thông tin phim.');
          setIsLoading(false);
          return;
        }
        // API status=true
        const movieData = data.movie;
        const processedData = {
          ...movieData,
          category: Array.isArray(movieData.category) ? movieData.category : [],
          country: Array.isArray(movieData.country) ? movieData.country : []
        };
        setMovie(processedData);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching movie detail:', err);
        setError('Không thể tải thông tin phim. Vui lòng thử lại sau.');
        setIsLoading(false);
      }
    };
    
    fetchMovieDetail();
  }, [slug]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center movie-content-page">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
          <p className="mt-2">Đang tải thông tin phim...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center movie-content-page">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button 
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }
  
  if (!movie) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center movie-content-page">
        <div className="text-center">
          <p>Không tìm thấy thông tin phim.</p>
          <Link href="/" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }
  
  // Hàm xử lý URL hình ảnh
  const getImageUrl = (url: string) => {
    if (!url) return '/placeholder.jpg';
    if (url.startsWith('http')) return url;
    return `https://img.phimapi.com/${url}`;
  };
  
  return (
    <div className="movie-content-page container mx-auto p-4 py-8">
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Movie Poster */}
            <div className="w-full md:w-1/3 lg:w-1/4">
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
                <Image 
                  src={getImageUrl(movie.poster_url)} 
                  alt={movie.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 30vw, 25vw"
                  className="object-cover"
                />
              </div>
              
              {/* Watch button */}
              <Link 
                href={`/watch/${movie.slug}`}
                className="watch-button mt-4 block w-full py-3 px-4 text-white rounded-lg text-center font-semibold"
              >
                Xem Phim
              </Link>
            </div>
            
            {/* Movie Info */}
            <div className="w-full md:w-2/3 lg:w-3/4">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                {movie.name}
              </h1>
              <h2 className="text-xl text-gray-400 mb-4">{movie.origin_name}</h2>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.quality && (
                  <span className="px-3 py-1 bg-red-600 text-white text-sm rounded-full">
                    {movie.quality}
                  </span>
                )}
                {movie.lang && (
                  <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                    {movie.lang}
                  </span>
                )}
                {movie.category && movie.category.map((cat, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-600 text-white text-sm rounded-full">
                    {cat.name}
                  </span>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-6">
                <div className="movie-info-item">
                  <span className="movie-info-label">Năm phát hành:</span>
                  <span className="movie-info-value">{movie.year}</span>
                </div>
                {movie.time && (
                  <div className="movie-info-item">
                    <span className="movie-info-label">Thời lượng:</span>
                    <span className="movie-info-value">{movie.time}</span>
                  </div>
                )}
                {movie.episode_current && (
                  <div className="movie-info-item">
                    <span className="movie-info-label">Trạng thái:</span>
                    <span className="movie-info-value">{movie.episode_current}</span>
                  </div>
                )}
                {movie.country && movie.country.length > 0 && (
                  <div className="movie-info-item">
                    <span className="movie-info-label">Quốc gia:</span>
                    <span className="movie-info-value">
                      {movie.country.map(c => c.name).join(', ')}
                    </span>
                  </div>
                )}
                {movie.category && movie.category.length > 0 && (
                  <div className="movie-info-item">
                    <span className="movie-info-label">Thể loại:</span>
                    <span className="movie-info-value">
                      {movie.category.map(c => c.name).join(', ')}
                    </span>
                  </div>
                )}
                <div className="movie-info-item">
                  <span className="movie-info-label">Đánh giá:</span>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <span className="movie-info-value">
                      {movie.tmdb?.vote_average ? (movie.tmdb.vote_average).toFixed(1) : 
                       movie.rating?.vote_average ? (movie.rating.vote_average).toFixed(1) : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Nội dung phim</h3>
                <p className="text-gray-300">
                  {movie.content || "Đang cập nhật nội dung phim. Vui lòng quay lại sau."}
                </p>
              </div>
              
              {/* Keywords/Tags */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Từ khóa</h3>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/search?keyword=${encodeURIComponent(movie.name)}`} className="px-3 py-1 bg-gray-700 text-white text-sm rounded-full hover:bg-gray-600">
                    {movie.name}
                  </Link>
                  <Link href={`/search?keyword=${encodeURIComponent(movie.origin_name)}`} className="px-3 py-1 bg-gray-700 text-white text-sm rounded-full hover:bg-gray-600">
                    {movie.origin_name}
                  </Link>
                  {movie.category && movie.category.map((cat, index) => (
                    <Link key={index} href={`/category/${cat.slug}`} className="px-3 py-1 bg-gray-700 text-white text-sm rounded-full hover:bg-gray-600">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 