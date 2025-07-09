"use client";
import { useEffect, useState, useCallback } from 'react';
import movieApi, { Movie } from '@/services/api/movieApi';
import Link from 'next/link';
import Image from 'next/image';
import MovieCard from '@/components/MovieCard';
import { useAnime } from '@/hooks/useAnime';

export default function Home() {
  const [latestMovies, setLatestMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [tvSeries, setTvSeries] = useState<Movie[]>([]);
  const [koreanMovies, setKoreanMovies] = useState<Movie[]>([]);
  const [chineseMovies, setChineseMovies] = useState<Movie[]>([]);
  const [theaterMovies, setTheaterMovies] = useState<Movie[]>([]);

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
  }, [selectedFeatureIndex, isSliding]);

  // Lấy tất cả phim mới
  const { data: animeData } = useAnime(50);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Lấy tất cả phim mới
        const latestMoviesResponse = await movieApi.getLatestMovies(1, 50);
        if (latestMoviesResponse?.items) {
          setLatestMovies(latestMoviesResponse.items.slice(0, 12));
        }

        // Lấy phim xu hướng
        const trendingResponse = await movieApi.getTrendingMovies();
        if (trendingResponse?.items) {
          setTrendingMovies(trendingResponse.items.slice(0, 12));
        }

        // Lấy phim bộ mới
        const tvSeriesResponse = await movieApi.fetchTVSeries();
        if (tvSeriesResponse?.items) {
          setTvSeries(tvSeriesResponse.items.slice(0, 12));
        }

        // Lấy phim Hàn Quốc
        const koreanResponse = await movieApi.fetchMoviesByCountry('han-quoc');
        if (koreanResponse?.items) {
          setKoreanMovies(koreanResponse.items.slice(0, 12));
        }

        // Lấy phim Trung Quốc
        const chineseResponse = await movieApi.fetchMoviesByCountry('trung-quoc');
        if (chineseResponse?.items) {
          setChineseMovies(chineseResponse.items.slice(0, 12));
        }

        // Lấy phim chiếu rạp
        const theaterResponse = await movieApi.fetchTheaterMovies();
        if (theaterResponse?.items) {
          setTheaterMovies(theaterResponse.items.slice(0, 8));
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu phim:', err);
        setError('Đã xảy ra lỗi khi tải dữ liệu phim. Vui lòng thử lại sau.');
        setIsLoading(false);
      }
    };

    fetchData();
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
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em]" role="status">
            <span className="sr-only">Đang tải...</span>
          </div>
          <p className="mt-6 text-xl font-semibold text-gray-700">Đang tải dữ liệu phim...</p>
          <div className="mt-4 w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-loading-progress"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center glass-card p-8 max-w-lg">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Đã xảy ra lỗi</h2>
          <p className="text-lg mb-6 text-gray-600">{error}</p>
          <button 
            className="btn-primary btn-animate"
            onClick={() => window.location.reload()}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
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
      {/* Enhanced Hero Banner */}
      {featuredMovie && (
        <div className="relative">
          <section 
            className="hero-banner cursor-pointer group" 
            onClick={handleBannerClick}
          >
            {/* Enhanced Background Image */}
            <div className={`absolute inset-0 z-0 transition-all duration-700 ease-in-out ${isSliding ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`}>
              <Image
                src={getImageUrl(featuredMovie.thumb_url || featuredMovie.poster_url)}
                alt={featuredMovie.name}
                fill
                sizes="100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              {/* Enhanced Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            </div>

            {/* Enhanced Content */}
            <div className={`absolute inset-0 flex items-center md:items-start transition-all duration-500 ease-in-out ${isSliding ? 'slide-fade-out' : 'slide-fade-in'}`}>
              <div className="container mx-auto px-4 pt-10 md:pt-32">
                <div className="flex flex-col md:flex-row items-center">
                  {/* Enhanced Movie Info */}
                  <div className="w-full text-white z-10 max-w-4xl">
                    <div className="mb-6 md:mb-8">
                      <div className="movie-title-wrapper">
                        <h1 className="movie-title-line text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight">
                          {featuredMovie.name}
                        </h1>
                        {featuredMovie.origin_name && featuredMovie.origin_name !== featuredMovie.name && (
                          <p className="movie-title-second-line text-xl md:text-2xl lg:text-3xl mt-2 font-medium">
                            {featuredMovie.origin_name}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Enhanced Movie Details */}
                    <div className="flex flex-wrap gap-3 md:gap-4 my-4 md:my-6">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-full text-sm md:text-base font-bold shadow-lg">
                        {featuredMovie.quality}
                      </span>
                      {featuredMovie.category.map((cat, index) => (
                        <span key={index} className="category-pill text-sm md:text-base">
                          {cat.name}
                        </span>
                      )).slice(0, 3)}
                    </div>
                    
                    {/* Enhanced Movie Stats */}
                    <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-6 md:mb-8 text-sm md:text-base">
                      <div className="flex items-center bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
                        <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span className="font-semibold">{featuredMovie.year}</span>
                      </div>
                      <div className="flex items-center bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
                        <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span className="font-semibold">{featuredMovie.time}</span>
                      </div>
                      <div className="flex items-center bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
                        <svg className="w-5 h-5 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        <span className="font-semibold">
                          {featuredMovie.tmdb?.vote_average ? featuredMovie.tmdb.vote_average.toFixed(1) : 
                           featuredMovie.rating?.vote_average ? featuredMovie.rating.vote_average.toFixed(1) : "N/A"}
                        </span>
                      </div>
                    </div>                  
                    
                    {/* Enhanced Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-8 md:mt-10">
                      <Link 
                        href={`/watch/${featuredMovie.slug}`} 
                        className="watch-button btn-animate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Xem Phim
                      </Link>
                      <Link 
                        href={`/movie/${featuredMovie.slug}`} 
                        className="details-button btn-animate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Thumbnail Navigation */}
            <div className="thumbnail-nav">
              <div className="container mx-auto px-4">
                <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 md:pb-6 scrollbar-hide">
                  {trendingMovies.slice(0, 6).map((movie, index) => (
                    <button 
                      key={movie._id}
                      className={`thumbnail-button ${selectedFeatureIndex === index ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        changeSlide(index);
                      }}
                    >
                      <div className="relative w-24 h-16 md:w-32 md:h-20 rounded-xl overflow-hidden">
                        <Image 
                          src={getImageUrl(movie.thumb_url || movie.poster_url)} 
                          alt={movie.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3">
                          <p className="text-white text-xs md:text-sm font-medium line-clamp-1">{movie.name}</p>
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

      {/* Enhanced Main Content */}
      <div className="movie-content-page">
        {/* Enhanced Latest Movies Section */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="section-title">Phim mới cập nhật</h2>
            <Link href="/phim-moi" className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-semibold flex items-center group">
              Xem tất cả
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>
          <div className="movie-grid">
            {latestMovies.map(movie => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>

        {/* Enhanced Theater Movies Section */}
        {theaterMovies && theaterMovies.length > 0 && (
          <section className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="section-title">Phim chiếu rạp</h2>
              <Link href="/phim-chieu-rap" className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-semibold flex items-center group">
                Xem tất cả
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {theaterMovies.map(movie => (
                <div key={movie._id} className="relative aspect-video rounded-2xl overflow-hidden group card-hover-lift">
                  <Image
                    src={getImageUrl(movie.thumb_url || movie.poster_url)}
                    alt={movie.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300"></div>
                  <Link href={`/movie/${movie.slug}`} className="absolute inset-0 p-6 flex flex-col justify-end">
                    <h3 className="text-xl font-bold text-white line-clamp-2 mb-2">{movie.name}</h3>
                    {movie.origin_name && movie.origin_name !== movie.name && (
                      <p className="text-sm text-gray-200 mb-3 line-clamp-1">{movie.origin_name}</p>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                        {movie.quality || 'HD'}
                      </span>
                      <span className="text-gray-200 text-sm font-medium">{movie.year}</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Enhanced TV Series Section */}
        {tvSeries && tvSeries.length > 0 && (
          <section className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="section-title">Phim bộ mới</h2>
              <Link href="/phim-bo" className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-semibold flex items-center group">
                Xem tất cả
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>
            <div className="movie-grid">
              {tvSeries.map(movie => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {/* Enhanced Korean Movies Section */}
        {koreanMovies && koreanMovies.length > 0 && (
          <section className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="section-title">Phim Hàn Quốc</h2>
              <Link href="/quoc-gia/han-quoc" className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-semibold flex items-center group">
                Xem tất cả
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>
            <div className="movie-grid">
              {koreanMovies.map(movie => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {/* Enhanced Chinese Movies Section */}
        {chineseMovies && chineseMovies.length > 0 && (
          <section className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="section-title">Phim Trung Quốc</h2>
              <Link href="/quoc-gia/trung-quoc" className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-semibold flex items-center group">
                Xem tất cả
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>
            <div className="movie-grid">
              {chineseMovies.map(movie => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {/* Enhanced Anime Section */}
        {animeData?.popular && animeData.popular.length > 0 && (
          <section className="mb-16 relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 to-blue-50 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-transparent z-10"></div>
            <div className="absolute inset-0">
              {animeData.popular[0]?.poster_url && (
                <Image
                  src={animeData.popular[0].poster_url}
                  alt="Background"
                  fill
                  className="object-cover opacity-20"
                  priority={false}
                />
              )}
            </div>
            <div className="relative z-20 p-8 md:p-12">
              <div className="flex justify-between items-center mb-8">
                <h2 className="section-title">Anime Nổi Bật</h2>
                <Link href="/anime" className="text-purple-600 hover:text-purple-700 transition-colors text-sm font-semibold flex items-center group">
                  Xem tất cả
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
              <div className="movie-grid">
                {animeData.popular.slice(0, 6).map((anime, index) => (
                  <div key={index} className="card-movie card-hover-lift">
                    <div className="relative aspect-[2/3] rounded-2xl overflow-hidden">
                      <Image
                        src={anime.poster_url || '/placeholder.jpg'}
                        alt={anime.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-90"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-sm font-bold text-white line-clamp-2 mb-2">{anime.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                            Anime
                          </span>
                          {anime.rating && (
                            <span className="text-gray-200 text-xs font-medium">
                              ⭐ {anime.rating}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
