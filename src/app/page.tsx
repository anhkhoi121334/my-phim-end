"use client";
import { useEffect, useState, useCallback } from 'react';
import movieApi, { Movie } from '@/services/api/movieApi';
import Link from 'next/link';
import Image from 'next/image';
import MovieCard from '@/components/MovieCard';
import { useAnime } from '@/hooks/useAnime';
import HeroBanner from '@/components/HeroBanner';

export default function Home() {
  const [latestMovies, setLatestMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [tvSeries, setTvSeries] = useState<Movie[]>([]);
  const [koreanMovies, setKoreanMovies] = useState<Movie[]>([]);
  const [chineseMovies, setChineseMovies] = useState<Movie[]>([]);
  const [theaterMovies, setTheaterMovies] = useState<Movie[]>([]);
  const [animeMovies, setAnimeMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  
  // Đảm bảo chỉ lấy phim không trùng lặp bằng cách kiểm tra slug
  const uniqueLatestMovies = latestMovies?.filter((movie, index, self) => 
    self.findIndex(m => m.slug === movie.slug) === index
  ).slice(0, 5) || [];
  
  // Callback để chuyển đổi slider
  const changeSlide = useCallback((index: number) => {
    if (isSliding) return; // Ngăn chặn nhiều lần click liên tiếp
    if (index === selectedFeatureIndex) return; // Không làm gì nếu click vào slide hiện tại
    
    setIsSliding(true);
    
    // Cập nhật index và kết thúc animation sau 1000ms
    setSelectedFeatureIndex(index);
    
    const timer = setTimeout(() => {
      setIsSliding(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [selectedFeatureIndex, isSliding]);

  // Auto-slide effect
useEffect(() => {
  // Only set up the interval if we have movies to display
  if (uniqueLatestMovies.length === 0) return;
  
  const autoSlideTimer = setInterval(() => {
    const nextIndex = (selectedFeatureIndex + 1) % uniqueLatestMovies.length;
    changeSlide(nextIndex);
  }, 10000);

  return () => clearInterval(autoSlideTimer);
}, [selectedFeatureIndex, changeSlide, uniqueLatestMovies.length]);

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
              Loading...
            </span>
          </div>
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
  const featuredMovie = uniqueLatestMovies?.length > 0 ? 
    uniqueLatestMovies[selectedFeatureIndex % uniqueLatestMovies.length] : null;

  const handleBannerClick = () => {
    if (featuredMovie?.slug) {
      window.location.href = `/movie/${featuredMovie.slug}`;
    }
  };

  return (
    <main className="page-transition main-content">
      {/* Phần Banner Hero */}
      {featuredMovie && (
        <HeroBanner 
          movie={featuredMovie}
          isSliding={isSliding}
          onBannerClick={handleBannerClick}
          allMovies={uniqueLatestMovies}
          currentIndex={selectedFeatureIndex}
          onThumbnailClick={(index) => {
            if (index !== selectedFeatureIndex) {
              changeSlide(index);
            }
          }}
        />
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
