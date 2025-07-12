import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '@/services/api/movieApi';

interface HeroBannerProps {
  movie: Movie;
  isSliding: boolean;
  onBannerClick: () => void;
  allMovies: Movie[];
  currentIndex: number;
  onThumbnailClick: (index: number) => void;
}

const HeroBanner = ({ movie, isSliding, onBannerClick, allMovies, currentIndex, onThumbnailClick }: HeroBannerProps) => {
  const getImageUrl = (url: string) => {
    if (!url) return '/placeholder.jpg';
    if (url.startsWith('http')) return url;
    return `https://img.phimapi.com/${url}`;
  };

  // Create animated rating display
  const [ratingDisplay, setRatingDisplay] = useState(0);
  
  useEffect(() => {
    // Reset to 0 when movie changes or during slide
    setRatingDisplay(0);
    
    if (!isSliding) {
      const rating = movie.tmdb?.vote_average || movie.rating?.vote_average || 0;
      let current = 0;
      const interval = setInterval(() => {
        current += 0.1;
        setRatingDisplay(Math.min(current, rating));
        if (current >= rating) clearInterval(interval);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [movie, isSliding]);

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px] overflow-hidden">
      <section 
        className="relative w-full h-full cursor-pointer" 
        onClick={onBannerClick}
      >
        {/* Fixed dark background */}
        <div className="absolute inset-0 bg-[#0d1117] z-0"></div>
        
        {/* Background image with gradient overlay */}
        <div className={`absolute inset-0 z-1 ${isSliding ? 'opacity-0' : 'opacity-100'} transition-opacity duration-700 ease-out`}>
          <div className="relative w-full h-full">
            <Image
              src={getImageUrl(movie.thumb_url)}
              alt={movie.name}
              fill
              sizes="100vw"
              className="object-cover object-top"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117] via-[#0d1117]/90 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/70 to-transparent"></div>
          </div>
        </div>

        {/* Content */}
        <div className={`absolute inset-0 z-20 ${isSliding ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'} transition-all duration-700 ease-out`}>
          <div className="container mx-auto px-4 h-full flex items-end md:items-center pb-30 md:pb-0">
            <div className="w-full max-w-3xl">
              {/* Latest movies label */}
              <div className="mb-3 md:mb-5">
                <span className="inline-block bg-blue-600 px-3 py-1 md:px-4 md:py-1.5 rounded text-[10px] md:text-sm font-bold tracking-wider text-white uppercase">
                  Phim Mới Cập Nhật
                </span>
              </div>
              
              {/* Movie title */}
              <h1 className="text-xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-1.5 md:mb-3 line-clamp-2">
                {movie.name}
              </h1>
              {movie.origin_name && movie.origin_name !== movie.name && (
                <p className="text-xs md:text-lg lg:text-xl text-gray-400 mb-3 md:mb-6 line-clamp-1 italic">
                  {movie.origin_name}
                </p>
              )}
              
              {/* Categories */}
              <div className="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6">
                <span className="bg-blue-600 px-2.5 py-1 md:px-3.5 md:py-1.5 rounded text-[10px] md:text-sm text-white font-medium">
                  {movie.quality}
                </span>
                {movie.category.slice(0, 3).map((cat, index) => (
                  <span 
                    key={index} 
                    className="bg-white/5 px-2.5 py-1 md:px-3.5 md:py-1.5 rounded text-[10px] md:text-sm text-white font-medium"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
              
              {/* Movie info */}
              <div className="grid grid-cols-2 gap-y-2 md:grid-cols-4 md:gap-6 mb-4 md:mb-8 text-xs md:text-sm">
                <div className="flex items-center">
                  <span className="text-blue-500 mr-2">Năm:</span>
                  <span className="text-white">{movie.year}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-blue-500 mr-2">Thời lượng:</span>
                  <span className="text-white">
                    {movie.episode_total ? `${movie.episode_current}/${movie.episode_total} tập` : movie.time}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-blue-500 mr-2">Ngôn ngữ:</span>
                  <span className="text-white capitalize">{movie.lang}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-blue-500 mr-2">Đánh giá:</span>
                  <div className="flex items-center">
                    <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <span className="text-white">{ratingDisplay.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Description - Hide on mobile */}
              {movie.content && (
                <p className="hidden md:block text-sm md:text-base text-gray-400 mb-5 md:mb-8 line-clamp-3">
                  {movie.content}
                </p>
              )}
              
              {/* Action buttons */}
              <div className="flex gap-3 md:gap-4">
                <Link 
                  href={`/watch/${movie.slug}`} 
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 md:px-6 md:py-2.5 rounded text-white font-medium flex items-center text-xs md:text-sm transition-colors duration-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Xem Phim
                </Link>
                <Link 
                  href={`/movie/${movie.slug}`} 
                  className="bg-[#ffffff14] hover:bg-[#ffffff1f] px-4 py-2 md:px-6 md:py-2.5 rounded text-white font-medium flex items-center text-xs md:text-sm transition-colors duration-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Chi tiết
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail navigation */}
        {allMovies.length > 0 && onThumbnailClick && (
          <div className="absolute bottom-4 md:bottom-6 left-0 right-0 z-30">
            <div className="container mx-auto px-4">
              <div className="flex justify-center gap-2 md:gap-3">
                {allMovies.slice(0, 5).map((thumbnailMovie, idx) => (
                  <button 
                    key={thumbnailMovie._id || idx}
                    className={`group relative overflow-hidden rounded ${
                      currentIndex === idx 
                        ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-[#0d1117]' 
                        : 'opacity-50 hover:opacity-75'
                    } transition-all duration-300`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onThumbnailClick(idx);
                    }}
                  >
                    <div className="relative w-14 h-20 md:w-20 md:h-28">
                      <Image
                        src={getImageUrl(thumbnailMovie.poster_url || thumbnailMovie.thumb_url)}
                        alt={thumbnailMovie.name}
                        fill
                        sizes="(max-width: 768px) 56px, 80px"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default HeroBanner; 