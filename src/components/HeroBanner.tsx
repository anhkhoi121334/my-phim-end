import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '@/services/api/movieApi';

interface HeroBannerProps {
  movie: Movie;
  isSliding: boolean;
  onBannerClick: () => void;
  previewImages?: Movie[];
  onPreviewClick?: (index: number) => void;
  currentIndex?: number;
}

const HeroBanner = ({ 
  movie, 
  isSliding, 
  onBannerClick, 
  previewImages = [], 
  onPreviewClick,
  currentIndex = 0 
}: HeroBannerProps) => {
  const getImageUrl = (url: string) => {
    if (!url) return '/placeholder.jpg';
    if (url.startsWith('http')) return url;
    return `https://img.phimapi.com/${url}`;
  };

  const formatDuration = (time: string) => {
    if (!time) return 'N/A';
    return time.includes('phút') ? time : `${time} phút`;
  };

  const getDescription = (movie: Movie) => {
    return movie.content || 'Thông tin chi tiết sẽ được cập nhật sớm...';
  };

  return (
    <div className="relative">
      <section className="hero-banner cursor-pointer" onClick={onBannerClick}>
        {/* Ảnh nền với hiệu ứng parallax */}
        <div className={`absolute inset-0 z-0 transition-all duration-1000 ease-in-out ${
          isSliding ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
        }`}>
          <Image
            src={getImageUrl(movie.thumb_url || movie.poster_url)}
            alt={movie.name}
            fill
            sizes="100vw"
            className="object-cover"
            style={{ 
              transform: isSliding ? 'scale(1.2)' : 'scale(1)', 
              transition: 'transform 1000ms ease-in-out',
              filter: 'brightness(0.7)'
            }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117] via-[#0d1117]/90 to-[#0d1117]/60"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-transparent"></div>
        </div>

        {/* Phần nội dung */}
        <div className={`absolute inset-0 flex items-center transition-all duration-700 ease-out ${
          isSliding ? 'translate-x-8 opacity-0' : 'translate-x-0 opacity-100'
        }`}>
          <div className="container mx-auto px-4 pt-20 md:pt-32 pb-20">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              {/* Poster phim - Bên trái */}
              <div className="hidden lg:block flex-shrink-0">
                <div className="relative w-64 h-96 rounded-xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <Image
                    src={getImageUrl(movie.poster_url || movie.thumb_url)}
                    alt={movie.name}
                    fill
                    className="object-cover"
                    sizes="256px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  
                  {/* Badge chất lượng */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1 rounded-full text-sm font-bold text-white shadow-lg">
                      {movie.quality || 'HD'}
                    </span>
                  </div>
                  
                  {/* Badge trạng thái */}
                  {movie.episode_current && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-green-600 px-3 py-1 rounded-full text-sm font-bold text-white shadow-lg">
                        {movie.episode_current}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Thông tin phim - Bên phải */}
              <div className="flex-1 text-white z-10 max-w-3xl">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-4 text-sm text-blue-300">
                  <span>Trang chủ</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                  <span>Phim nổi bật</span>
                </div>
                
                {/* Tiêu đề phim */}
                <div className="mb-4">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent leading-tight mb-2">
                    {movie.name}
                  </h1>
                  {movie.origin_name && movie.origin_name !== movie.name && (
                    <h2 className="text-lg md:text-xl text-gray-300 font-medium">
                      {movie.origin_name}
                    </h2>
                  )}
                </div>
                
                {/* Thông tin meta */}
                <div className="flex flex-wrap gap-4 mb-6">
                  {/* Thể loại */}
                  <div className="flex flex-wrap gap-2">
                    {movie.category?.slice(0, 3).map((cat, index) => (
                      <span key={index} className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium border border-white/30">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Thông tin chi tiết */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                  <div className="flex flex-col">
                    <span className="text-blue-300 mb-1">Năm phát hành</span>
                    <span className="font-semibold text-lg">{movie.year || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-blue-300 mb-1">Thời lượng</span>
                    <span className="font-semibold text-lg">{formatDuration(movie.time || '')}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-blue-300 mb-1">Quốc gia</span>
                    <span className="font-semibold text-lg">{movie.country?.[0]?.name || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-blue-300 mb-1">Đánh giá</span>
                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      <span className="font-semibold text-lg">
                        {movie.tmdb?.vote_average ? movie.tmdb.vote_average.toFixed(1) : 
                         movie.rating?.vote_average ? movie.rating.vote_average.toFixed(1) : "8.5"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mô tả */}
                <div className="mb-8">
                  <p className="text-gray-300 leading-relaxed line-clamp-3 md:line-clamp-none max-w-2xl">
                    {getDescription(movie).replace(/<[^>]*>/g, '').substring(0, 200)}...
                  </p>
                </div>
                
                {/* Nút hành động */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href={`/watch/${movie.slug}`} 
                    className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 text-white rounded-xl font-bold flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Xem Ngay
                  </Link>
                  
                  <Link 
                    href={`/movie/${movie.slug}`} 
                    className="group bg-white/20 backdrop-blur-sm hover:bg-white/30 px-8 py-4 text-white rounded-xl font-bold flex items-center justify-center transition-all duration-300 border border-white/30 hover:border-white/50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Chi Tiết
                  </Link>

                  {/* Nút thêm vào danh sách */}
                  <button className="group bg-transparent hover:bg-white/10 p-4 text-white rounded-xl transition-all duration-300 border border-white/30 hover:border-white/50">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation dots và preview thumbnails */}
        {previewImages && previewImages.length > 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
            <div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/20">
              {previewImages.map((previewMovie, index) => (
                <button
                  key={previewMovie._id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreviewClick?.(index);
                  }}
                  className={`group relative overflow-hidden rounded-lg transition-all duration-300 ${
                    index === currentIndex 
                      ? 'w-16 h-12 ring-2 ring-blue-500 scale-110' 
                      : 'w-12 h-8 hover:w-14 hover:h-10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={getImageUrl(previewMovie.thumb_url || previewMovie.poster_url)}
                    alt={previewMovie.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300"></div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="bg-black/90 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
                      {previewMovie.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scroll indicator */}
        <div className="absolute bottom-4 right-4 z-30">
          <div className="flex flex-col items-center text-white/70 animate-pulse">
            <span className="text-sm mb-2">Cuộn xuống</span>
            <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroBanner; 