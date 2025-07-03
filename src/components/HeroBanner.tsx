import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '@/services/api/movieApi';

interface HeroBannerProps {
  movie: Movie;
  isSliding: boolean;
  onBannerClick: () => void;
}

const HeroBanner = ({ movie, isSliding, onBannerClick }: HeroBannerProps) => {
  const getImageUrl = (url: string) => {
    if (!url) return '/placeholder.jpg';
    if (url.startsWith('http')) return url;
    return `https://img.phimapi.com/${url}`;
  };

  return (
    <div className="relative">
      <section className="hero-banner cursor-pointer" onClick={onBannerClick}>
        {/* Ảnh nền với lớp phủ Gradient */}
        <div className={`absolute inset-0 z-0 transition-opacity duration-700 ease-in-out ${isSliding ? 'opacity-0' : 'opacity-100'}`}>
          <Image
            src={getImageUrl(movie.thumb_url || movie.poster_url)}
            alt={movie.name}
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
                    <span className="movie-title-line text-2xl md:text-3xl lg:text-4xl">{movie.name}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 md:gap-3 my-3 md:my-4">
                  <span className="bg-blue-600 px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium">{movie.quality}</span>
                  {movie.category.map((cat, index) => (
                    <span key={index} className="category-pill text-xs md:text-sm">{cat.name}</span>
                  )).slice(0, 3)}
                </div>
                
                <div className="flex flex-wrap items-center gap-3 md:gap-6 mb-3 md:mb-4 text-xs md:text-sm">
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
                      {movie.tmdb?.vote_average ? movie.tmdb.vote_average.toFixed(1) : 
                       movie.rating?.vote_average ? movie.rating.vote_average.toFixed(1) : "N/A"}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-3 md:gap-4 mt-4 md:mt-6">
                  <Link 
                    href={`/watch/${movie.slug}`} 
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
                    href={`/movie/${movie.slug}`} 
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
      </section>
    </div>
  );
};

export default HeroBanner; 