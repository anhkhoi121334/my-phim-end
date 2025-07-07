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
    <div className="relative">
      <section className="hero-banner cursor-pointer" onClick={onBannerClick}>
        {/* Fixed dark background to prevent gray showing during transitions */}
        <div className="absolute inset-0 bg-[#0d1117] z-0"></div>
        
        {/* Ảnh nền với lớp phủ Gradient */}
        <div className={`absolute inset-0 z-1 transition-opacity duration-700 ease-in-out bg-[#0d1117] ${isSliding ? 'opacity-0' : 'opacity-100'}`}>
          <Image
            src={getImageUrl(movie.thumb_url || movie.poster_url)}
            alt={movie.name}
            fill
            sizes="100vw"
            className="object-cover"
            style={{ transform: isSliding ? 'scale(1.05)' : 'scale(1)', transition: 'transform 700ms ease-in-out' }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117] via-[#0d1117]/80 to-transparent z-10"></div>
        </div>

        {/* Phần nội dung */}
        <div className={`absolute inset-0 flex items-center md:items-start z-20 transition-all duration-700 ease-in-out ${isSliding ? 'slide-fade-out' : 'slide-fade-in'}`}>
          <div className="container mx-auto px-4 pt-6 md:pt-20">
            <div className="flex flex-col md:flex-row items-center">
              {/* Thông tin phim - Bên trái */}
              <div className="w-full text-white">
                {/* Latest movies label */}
                <div className="mb-1 md:mb-2 latest-movies-label">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 px-2 py-0.5 rounded-full text-xs font-bold tracking-wider">
                    PHIM MỚI CẬP NHẬT
                  </span>
                </div>
                
                <div className="mb-2 md:mb-3">
                  <h1 className="movie-title text-xl md:text-2xl lg:text-3xl font-bold">{movie.name}</h1>
                  {movie.origin_name && movie.origin_name !== movie.name && (
                    <p className="text-xs md:text-sm text-gray-300 mt-0.5">{movie.origin_name}</p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1.5 md:gap-2 my-2 md:my-3">
                  <span className="bg-blue-600 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-xs font-medium">{movie.quality}</span>
                  {movie.category.map((cat, index) => (
                    <span key={index} className="category-pill text-xs">{cat.name}</span>
                  )).slice(0, 3)}
                </div>
                
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2 md:mb-3 text-xs">
                  <div className="flex items-center">
                    <span className="mr-1 md:mr-2 text-blue-400">Năm:</span>
                    <span className="font-medium">{movie.year}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1 md:mr-2 text-blue-400">Thời lượng:</span>
                    <span className="font-medium">{movie.time}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1 md:mr-2 text-blue-400">Đánh giá:</span>
                    <span className="flex items-center font-medium">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      <span className="mr-2">{ratingDisplay.toFixed(1)}</span>
                      <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400"
                          style={{ width: `${(ratingDisplay/10)*100}%` }}
                        ></div>
                      </div>
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 md:gap-3 mt-3 md:mt-4">
                  <Link 
                    href={`/watch/${movie.slug}`} 
                    className="watch-button px-3 py-1.5 md:px-4 md:py-2 text-white rounded-md font-medium flex items-center text-xs md:text-base"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-3 h-3 md:w-4 md:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Xem Phim
                  </Link>
                  <Link 
                    href={`/movie/${movie.slug}`} 
                    className="details-button px-3 py-1.5 md:px-4 md:py-2 text-white rounded-md font-medium text-xs md:text-base"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-3 h-3 md:w-4 md:h-4 mr-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Chi tiết
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail navigation */}
        {allMovies.length > 0 && onThumbnailClick && (
          <div className="thumbnail-nav">
            <div className="container mx-auto px-4">
              <div className="flex justify-center gap-1 md:gap-3">
                {allMovies.slice(0, 5).map((thumbnailMovie, idx) => (
                  <button 
                    key={thumbnailMovie._id || idx}
                    className={`thumbnail-button ${currentIndex === idx ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onThumbnailClick(idx);
                    }}
                  >
                    <div className="relative w-14 h-18 md:w-20 md:h-24 overflow-hidden rounded-lg">
                      <Image
                        src={getImageUrl(thumbnailMovie.poster_url || thumbnailMovie.thumb_url)}
                        alt={thumbnailMovie.name}
                        fill
                        sizes="(max-width: 768px) 64px, 96px"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>
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