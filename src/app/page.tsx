"use client";
import { useEffect, useState, useCallback } from 'react';
import movieApi, { Movie } from '@/services/api/movieApi';
import Link from 'next/link';
import Image from 'next/image';
import MovieCard from '@/components/MovieCard';

export default function Home() {
  const [latestMovies, setLatestMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
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

        // Lấy danh sách phim xu hướng cho banner
        const trendingResponse = await movieApi.getTrendingMovies();
        setTrendingMovies(trendingResponse.items.slice(0, 12));
        
        // Lấy danh sách phim đề xuất
        const recommendedResponse = await movieApi.getRecommendedMovies();
        setRecommendedMovies(recommendedResponse.items.slice(0, 12));

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
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em]" role="status">
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
            className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
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
    <main className="page-transition main-content">
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
                sizes="100vw"
                className="object-cover"
                style={{ transform: isSliding ? 'scale(1.1)' : 'scale(1)', transition: 'transform 700ms ease-in-out' }}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117] via-[#0d1117]/80 to-transparent"></div>
            </div>

            {/* Phần nội dung */}
            <div className={`absolute inset-0 flex items-center md:items-start transition-all duration-500 ease-in-out ${isSliding ? 'slide-fade-out' : 'slide-fade-in'}`}>
              <div className="container mx-auto px-4 pt-10 md:pt-32">
                <div className="flex flex-col md:flex-row items-center">
                  {/* Thông tin phim - Bên trái */}
                  <div className="w-full text-white z-10">
                    <div className="mb-3 md:mb-4">
                      <div className="movie-title-wrapper">
                        <span className="movie-title-line text-2xl md:text-3xl lg:text-4xl">{featuredMovie.name}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 md:gap-3 my-3 md:my-4">
                      <span className="bg-blue-500 px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium">{featuredMovie.quality}</span>
                      {featuredMovie.category.map((cat, index) => (
                        <span key={index} className="category-pill text-xs md:text-sm">{cat.name}</span>
                      )).slice(0, 3)}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 md:gap-6 mb-3 md:mb-4 text-xs md:text-sm">
                      <div className="flex items-center">
                        <span className="mr-1 md:mr-2 text-blue-400">Năm:</span>
                        <span className="font-medium">{featuredMovie.year}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-1 md:mr-2 text-blue-400">Thời lượng:</span>
                        <span className="font-medium">{featuredMovie.time}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-1 md:mr-2 text-blue-400">Đánh giá:</span>
                        <span className="flex items-center font-medium">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                          {featuredMovie.tmdb?.vote_average ? featuredMovie.tmdb.vote_average.toFixed(1) : 
                           featuredMovie.rating?.vote_average ? featuredMovie.rating.vote_average.toFixed(1) : "N/A"}
                        </span>
                      </div>
                    </div>                  
                    <div className="flex gap-3 md:gap-4 mt-4 md:mt-6">
                      <Link 
                        href={`/watch/${featuredMovie.slug}`} 
                        className="watch-button px-4 py-2 md:px-6 md:py-3 text-white rounded-md font-medium flex items-center text-sm md:text-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-4 h-4 md:w-6 md:h-6 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Xem Phim
                      </Link>
                      <Link 
                        href={`/movie/${featuredMovie.slug}`} 
                        className="details-button px-4 py-2 md:px-6 md:py-3 text-white rounded-md font-medium text-sm md:text-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-4 h-4 md:w-6 md:h-6 mr-1 md:mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Điều hướng thumbnail - Hiển thị nhỏ trên mobile */}
            <div className="thumbnail-nav absolute bottom-0 left-0 right-0">
              <div className="container mx-auto px-4">
                <div className="flex gap-2 md:gap-3 overflow-x-auto pb-3 md:pb-4 scrollbar-hide">
                  {trendingMovies.slice(0, 6).map((movie, index) => (
                    <button 
                      key={movie._id}
                      className={`thumbnail-button ${selectedFeatureIndex === index ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        changeSlide(index);
                      }}
                    >
                      <div className="relative w-20 h-12 md:w-40 md:h-24 rounded-lg overflow-hidden">
                        <Image 
                          src={getImageUrl(movie.thumb_url || movie.poster_url)} 
                          alt={movie.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-1 md:p-2">
                          <p className="text-white text-xs line-clamp-1">{movie.name}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Phần nội dung chính */}
      <div className="movie-content-page container mx-auto px-4 py-8">
        {/* Phim mới cập nhật */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="section-title">Phim mới cập nhật</h2>
            <Link href="/phim-moi" className="text-blue-400 hover:text-blue-300 transition-colors text-sm">
              Xem tất cả
              <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {latestMovies.map(movie => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>

        {/* Phim đề xuất */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="section-title">Phim đề xuất cho bạn</h2>
            <Link href="/phim-de-xuat" className="text-blue-400 hover:text-blue-300 transition-colors text-sm">
              Xem tất cả
              <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {recommendedMovies.map(movie => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
