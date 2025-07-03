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
      <div className="movie-content-page container mx-auto px-4 py-8 bg-gray-50">
        {/* Phim mới cập nhật */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="section-title">Phim mới cập nhật</h2>
            <Link href="/phim-moi" className="text-blue-600 hover:text-blue-700 transition-colors text-sm">
              Xem tất cả
              <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {latestMovies.map(movie => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>

        {/* Phim chiếu rạp */}
        {theaterMovies && theaterMovies.length > 0 && (
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="section-title">Phim chiếu rạp</h2>
              <Link href="/phim-chieu-rap" className="text-blue-600 hover:text-blue-700 transition-colors text-sm">
                Xem tất cả
                <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {theaterMovies.map(movie => (
                <div key={movie._id} className="relative aspect-video rounded-lg overflow-hidden group">
                  <Image
                    src={getImageUrl(movie.thumb_url || movie.poster_url)}
                    alt={movie.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-90"></div>
                  <Link href={`/movie/${movie.slug}`} className="absolute inset-0 p-4 flex flex-col justify-end">
                    <h3 className="text-lg font-medium text-white line-clamp-2">{movie.name}</h3>
                    {movie.origin_name && movie.origin_name !== movie.name && (
                      <p className="text-sm text-gray-100 mt-1 line-clamp-1">{movie.origin_name}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
                        {movie.quality || 'HD'}
                      </span>
                      <span className="text-gray-100 text-sm">{movie.year}</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Phim bộ mới */}
        {tvSeries && tvSeries.length > 0 && (
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="section-title">Phim bộ mới</h2>
              <Link href="/phim-bo" className="text-blue-600 hover:text-blue-700 transition-colors text-sm">
                Xem tất cả
                <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tvSeries.map(movie => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {/* Phim Hàn Quốc */}
        {koreanMovies && koreanMovies.length > 0 && (
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="section-title">Phim Hàn Quốc</h2>
              <Link href="/quoc-gia/han-quoc" className="text-blue-600 hover:text-blue-700 transition-colors text-sm">
                Xem tất cả
                <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {koreanMovies.map(movie => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {/* Phim Trung Quốc */}
        {chineseMovies && chineseMovies.length > 0 && (
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="section-title">Phim Trung Quốc</h2>
              <Link href="/quoc-gia/trung-quoc" className="text-blue-600 hover:text-blue-700 transition-colors text-sm">
                Xem tất cả
                <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {chineseMovies.map(movie => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {/* Anime */}
        {animeData?.popular && animeData.popular.length > 0 && (
          <section className="mb-12 relative overflow-hidden rounded-lg bg-white shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent z-10"></div>
            <div className="absolute inset-0">
              {animeData.popular[0]?.poster_url && (
                <Image
                  src={animeData.popular[0].poster_url}
                  alt="Background"
                  fill
                  className="object-cover opacity-30"
                  priority={false}
                />
              )}
            </div>
            
            <div className="relative z-20 p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Kho Tàng Anime Mới Nhất</h2>
                  <p className="text-gray-600 text-sm mt-1">Những bộ anime mới nhất và hấp dẫn nhất</p>
                </div>
                <Link href="/hoat-hinh" className="text-blue-600 hover:text-blue-700 transition-colors text-sm flex items-center">
                  Xem tất cả
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>

              {animeData.popular[0] && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="lg:col-span-2">
                    <Link href={`/movie/${animeData.popular[0].slug}`} className="block">
                      <div className="relative aspect-video rounded-lg overflow-hidden group">
                        <Image
                          src={animeData.popular[0].thumb_url}
                          alt={animeData.popular[0].name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          priority={true}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-xl font-bold text-white mb-2">{animeData.popular[0].name}</h3>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="bg-blue-600 text-white px-2 py-1 rounded">
                              {animeData.popular[0].episode_current}
                            </span>
                            <span className="text-gray-100">{animeData.popular[0].quality}</span>
                            <span className="text-gray-100">{animeData.popular[0].lang}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {animeData.popular.slice(1, 4).map((movie) => (
                      <Link key={movie._id} href={`/movie/${movie.slug}`} className="block group">
                        <div className="flex gap-4">
                          <div className="relative w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                            <Image
                              src={movie.thumb_url}
                              alt={movie.name}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                              {movie.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">{movie.origin_name}</p>
                            <div className="flex items-center gap-2 mt-2 text-sm">
                              <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">
                                {movie.episode_current}
                              </span>
                              <span className="text-gray-600 text-xs">{movie.quality}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {animeData.popular.slice(4, 16).map(movie => (
                  <MovieCard key={movie._id} movie={movie} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Anime mới cập nhật */}
        {animeData?.latest && animeData.latest.length > 0 && (
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-semibold">Anime mới cập nhật</h2>
                <p className="text-gray-400 text-sm mt-1">Tập mới nhất vừa ra mắt</p>
              </div>
              <Link href="/hoat-hinh?sort=latest" className="text-blue-600 hover:text-blue-700 transition-colors text-sm flex items-center">
                Xem tất cả
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {animeData.latest.slice(0, 12).map(movie => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
