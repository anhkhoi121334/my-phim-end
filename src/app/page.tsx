"use client";
import { useEffect, useState, useCallback } from 'react';
import movieApi, { Movie, MovieResponse } from '@/services/api/movieApi';
import Link from 'next/link';
import Image from 'next/image';

interface MovieCardProps {
  movie: Movie;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  // Đảm bảo URL hình ảnh là URL đầy đủ
  const getImageUrl = (url: string) => {
    if (!url) return '/placeholder.jpg';
    if (url.startsWith('http')) return url;
    return `https://img.phimapi.com/${url}`;
  };

  return (
    <div className="movie-card group">
      <Link href={`/movie/${movie.slug}`}>
        <div className="relative h-[300px] w-full overflow-hidden rounded-xl">
          <Image
            src={getImageUrl(movie.poster_url)}
            alt={movie.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
          
          {movie.quality && (
            <span className="absolute top-2 right-2 bg-sky-500 text-white text-xs px-2 py-1 rounded-md font-medium">
              {movie.quality}
            </span>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <h3 className="text-lg font-semibold text-white">{movie.name}</h3>
            <p className="text-sm text-gray-300">{movie.origin_name}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs bg-sky-500/30 text-sky-300 px-2 py-1 rounded-full">
                {movie.year}
              </span>
              {movie.time && (
                <span className="text-xs text-gray-300">{movie.time}</span>
              )}
            </div>
            {(movie.tmdb?.vote_average || movie.rating?.vote_average) && (
              <div className="flex items-center mt-2">
                <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span className="text-xs text-yellow-400">
                  {movie.tmdb?.vote_average ? movie.tmdb.vote_average.toFixed(1) : 
                   movie.rating?.vote_average ? movie.rating.vote_average.toFixed(1) : "N/A"}
                </span>
              </div>
            )}
          </div>
          
          <div className="play-button">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default function Home() {
  const [latestMovies, setLatestMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  
  // Callback để chuyển đổi slider
  const changeSlide = useCallback((index: number) => {
    if (isSliding) return; // Ngăn chặn nhiều lần click liên tiếp
    if (index === selectedFeatureIndex) return; // Không làm gì nếu click vào slide hiện tại
    
    setIsSliding(true);
    
    // Cập nhật index và kết thúc animation sau 500ms
    setSelectedFeatureIndex(index);
    
    // Đặt lại trạng thái sliding sau khi animation hoàn tất
    setTimeout(() => {
      setIsSliding(false);
    }, 500);
  }, [selectedFeatureIndex, isSliding, trendingMovies.length]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Lấy danh sách phim mới nhất
        const latestResponse = await movieApi.getLatestMovies();
        setLatestMovies(latestResponse.items.slice(0, 12));

        // Lấy danh sách phim xu hướng
        const trendingResponse = await movieApi.getTrendingMovies();
        setTrendingMovies(trendingResponse.items.slice(0, 12));

        setIsLoading(false);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu phim:', err);
        setError('Đã xảy ra lỗi khi tải dữ liệu phim. Vui lòng thử lại sau.');
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Hàm xử lý URL hình ảnh
  const getImageUrl = (url: string) => {
    if (!url) return '/placeholder.jpg';
    if (url.startsWith('http')) return url;
    return `https://img.phimapi.com/${url}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-sky-500 border-r-transparent align-[-0.125em]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Đang tải...
            </span>
          </div>
          <p className="mt-4 text-lg">Đang tải dữ liệu phim...</p>
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
          <button 
            className="mt-4 bg-sky-500 text-white px-6 py-3 rounded-lg hover:bg-sky-600 transition"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Lấy phim nổi bật cho banner
  const featuredMovie = trendingMovies[selectedFeatureIndex] || trendingMovies[0];

  const handleBannerClick = () => {
    if (featuredMovie) {
      window.location.href = `/movie/${featuredMovie.slug}`;
    }
  };

  return (
    <main>
      {/* Phần Banner Hero */}
      {featuredMovie && (
        <div className="relative">
          {/* Banner */}
          <section 
            className="hero-banner cursor-pointer" 
            onClick={handleBannerClick}
          >
            {/* Ảnh nền với lớp phủ Gradient */}
            <div className={`absolute inset-0 z-0 transition-opacity duration-700 ease-in-out ${isSliding ? 'opacity-0' : 'opacity-100'}`}>
              <Image
                src={getImageUrl(featuredMovie.thumb_url || featuredMovie.poster_url)}
                alt={featuredMovie.name}
                fill
                className="object-cover"
                style={{ transform: isSliding ? 'scale(1.1)' : 'scale(1)', transition: 'transform 700ms ease-in-out' }}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117] via-[#0d1117]/80 to-transparent"></div>
            </div>

            {/* Phần nội dung */}
            <div className={`absolute inset-0 flex items-start transition-all duration-500 ease-in-out ${isSliding ? 'slide-fade-out' : 'slide-fade-in'}`}>
              <div className="container mx-auto px-4 pt-32">
                <div className="flex flex-col md:flex-row items-center">
                  {/* Thông tin phim - Bên trái */}
                  <div className="md:w-1/2 text-white">
                    <div className="mb-4">
                      <div className="movie-title-wrapper">
                        <span className="movie-title-line">{featuredMovie.name}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 my-4">
                      <span className="bg-sky-500 px-3 py-1 rounded-full text-sm font-medium">{featuredMovie.quality}</span>
                      {featuredMovie.category.map((cat, index) => (
                        <span key={index} className="category-pill">{cat.name}</span>
                      )).slice(0, 3)}
                    </div>
                    
                    <div className="flex items-center gap-6 mb-4 text-sm">
                      <div className="flex items-center">
                        <span className="mr-2 text-sky-400">Năm:</span>
                        <span className="font-medium">{featuredMovie.year}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2 text-sky-400">Thời lượng:</span>
                        <span className="font-medium">{featuredMovie.time}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2 text-sky-400">Đánh giá:</span>
                        <span className="flex items-center font-medium">
                          <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                          {featuredMovie.tmdb?.vote_average ? featuredMovie.tmdb.vote_average.toFixed(1) : 
                           featuredMovie.rating?.vote_average ? featuredMovie.rating.vote_average.toFixed(1) : "N/A"}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-lg mb-6 max-w-2xl line-clamp-2">
                      {featuredMovie.content || "Đang cập nhật nội dung phim. Vui lòng quay lại sau."}
                    </p>
                    
                    <div className="flex gap-4 mt-6">
                      <Link 
                        href={`/watch/${featuredMovie.slug}`} 
                        className="watch-button px-6 py-3 text-white rounded-md font-medium flex items-center text-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Xem Phim
                      </Link>
                      <Link 
                        href={`/movie/${featuredMovie.slug}`} 
                        className="details-button px-6 py-3 text-white rounded-md font-medium text-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Chi Tiết
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Điều hướng Thumbnail */}
          <div className="thumbnail-nav">
            <div className="container mx-auto px-4">
              <div className="flex justify-center gap-4">
                {trendingMovies.slice(0, 5).map((movie, index) => {
                  const isSelected = index === selectedFeatureIndex;
                  return (
                    <div key={index} className="relative group">
                      <button 
                        className={`thumbnail-button w-28 h-16 rounded-lg overflow-hidden border-2 ${isSelected ? 'active' : 'border-transparent'}`}
                        onClick={() => changeSlide(index)}
                        disabled={isSliding}
                      >
                        <Image
                          src={getImageUrl(movie.thumb_url || movie.poster_url)}
                          alt={movie.name}
                          width={112}
                          height={64}
                          className="object-cover w-full h-full transition-transform duration-500"
                        />
                        <div className={`absolute inset-0 bg-black bg-opacity-40 transition-opacity duration-300 ${isSelected ? 'opacity-0' : 'opacity-60'}`}></div>
                      </button>
                      {/* Chi tiết phim - hiển thị khi hover */}
                      <Link 
                        href={`/movie/${movie.slug}`}
                        className="absolute right-1 top-1 w-6 h-6 bg-black bg-opacity-60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Chi tiết phim ${movie.name}`}
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Các phần nội dung */}
      <div className="container mx-auto px-4 py-12">
        {/* Phần Phim Mới Cập Nhật */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="section-title">Phim Mới Cập Nhật</h2>
            <Link href="/danh-sach/phim-moi" className="text-sky-400 hover:text-sky-300 transition-colors flex items-center group">
              <span>Xem tất cả</span>
              <svg className="w-5 h-5 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </Link>
          </div>
          <div className="movie-grid">
            {latestMovies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>

        {/* Phần Phim Đề Cử / Hot */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="section-title">Phim Đề Cử / Hot</h2>
            <Link href="/danh-sach/phim-de-cu" className="text-sky-400 hover:text-sky-300 transition-colors flex items-center group">
              <span>Xem tất cả</span>
              <svg className="w-5 h-5 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </Link>
          </div>
          <div className="movie-grid">
            {trendingMovies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
