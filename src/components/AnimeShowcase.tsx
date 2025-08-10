import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '@/types';

interface AnimeShowcaseProps {
  animeMovies: Movie[];
}

const AnimeShowcase = ({ animeMovies }: AnimeShowcaseProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const featuredAnime = animeMovies && animeMovies.length > selectedIndex ? animeMovies[selectedIndex] : null;
  const carouselAnimes = animeMovies || [];

  const getImageUrl = (url: string) => {
    if (!url) return '/placeholder.jpg';
    if (url.startsWith('http')) return url;
    return `https://img.phimapi.com/${url}`;
  };

  if (!featuredAnime) return null;

  return (
    <section className="relative py-4 md:py-8 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center">
            <h2 className="text-lg md:text-2xl font-bold text-white">
              Kho Tàng Anime Mới Nhất
            </h2>
            <Link href="/hoat-hinh" className="ml-2">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>
          <Link 
            href="/hoat-hinh" 
            className="text-sm text-blue-500 hover:text-blue-400 font-medium transition-colors"
          >
            Xem tất cả
          </Link>
        </div>

        {/* Phần nội dung chính */}
        <div className="relative">
          {/* Banner phim nổi bật */}
          <div className="relative aspect-video rounded-lg overflow-hidden group">
            <Image
              src={getImageUrl(featuredAnime.thumb_url || featuredAnime.poster_url)}
              alt={featuredAnime.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
              <h3 className="text-xl md:text-3xl font-bold text-white mb-2 md:mb-3 line-clamp-2">
                {featuredAnime.name}
              </h3>
              {featuredAnime.origin_name && featuredAnime.origin_name !== featuredAnime.name && (
                <p className="text-sm text-gray-300 mb-2 md:mb-3 line-clamp-1 italic">
                  {featuredAnime.origin_name}
                </p>
              )}
              
              {/* Thông tin phim - IMDb, năm, tập... */}
              <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-4">
                <span className="bg-blue-600 px-1.5 md:px-2 py-0.5 rounded text-[10px] md:text-xs text-white font-medium">
                  IMDb {featuredAnime.tmdb?.vote_average?.toFixed(1) || featuredAnime.rating?.vote_average?.toFixed(1) || '7.0'}
                </span>
                <span className="bg-white/10 px-1.5 md:px-2 py-0.5 rounded text-[10px] md:text-xs text-white font-medium">
                  T{featuredAnime.lang === 'vi' ? '16' : '18'}
                </span>
                <span className="bg-white/10 px-1.5 md:px-2 py-0.5 rounded text-[10px] md:text-xs text-white font-medium">
                  {featuredAnime.year || '2023'}
                </span>
                <span className="bg-white/10 px-1.5 md:px-2 py-0.5 rounded text-[10px] md:text-xs text-white font-medium">
                  {featuredAnime.type === 'series' ? 'Phần 1' : 'Movie'}
                </span>
                {featuredAnime.episode_current && (
                  <span className="bg-white/10 px-1.5 md:px-2 py-0.5 rounded text-[10px] md:text-xs text-white font-medium">
                    Tập {featuredAnime.episode_current}
                  </span>
                )}
              </div>
              
              {/* Thể loại phim */}
              <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-4">
                {featuredAnime.category?.slice(0, 4).map((cat, idx) => (
                  <span key={idx} className="bg-white/10 px-1.5 md:px-2 py-0.5 rounded text-[10px] md:text-xs text-white font-medium">
                    {cat.name}
                  </span>
                )) || (
                  <>
                    <span className="bg-white/10 px-1.5 md:px-2 py-0.5 rounded text-[10px] md:text-xs text-white font-medium">
                      Anime
                    </span>
                    <span className="bg-white/10 px-1.5 md:px-2 py-0.5 rounded text-[10px] md:text-xs text-white font-medium">
                      Hoạt Hình
                    </span>
                  </>
                )}
              </div>
              
              {featuredAnime.content && (
                <p className="text-xs md:text-sm text-gray-300 mb-4 md:mb-5 line-clamp-2 md:line-clamp-3 max-w-3xl">
                  {featuredAnime.content}
                </p>
              )}
              
              {/* Các nút điều khiển */}
              <div className="flex items-center gap-2 md:gap-3">
                <Link 
                  href={`/watch/${featuredAnime.slug}`} 
                  className="bg-amber-200 hover:bg-amber-300 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 transform group-hover:scale-110"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-slate-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5.14v14l11-7-11-7z" />
                  </svg>
                </Link>
                <div className="flex gap-2">
                  <button className="bg-white/10 hover:bg-white/20 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                    <svg className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                    <svg className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Carousel phim phía dưới */}
        <div className="mt-4 md:mt-6 overflow-hidden">
          <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {carouselAnimes.map((anime, index) => (
              <button 
                key={anime._id}
                onClick={() => setSelectedIndex(index)}
                className={`flex-shrink-0 w-[100px] md:w-[140px] cursor-pointer focus:outline-none ${index === selectedIndex ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2 md:mb-3 group">
                  <Image
                    src={getImageUrl(anime.poster_url || anime.thumb_url)}
                    alt={anime.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {anime.quality && (
                    <span className="absolute top-1 md:top-2 left-1 md:left-2 bg-blue-600 px-1 md:px-1.5 py-0.5 rounded text-[8px] md:text-[10px] text-white font-medium">
                      {anime.quality}
                    </span>
                  )}
                  {anime.episode_current && (
                    <span className="absolute top-1 md:top-2 right-1 md:right-2 bg-black/70 px-1 md:px-1.5 py-0.5 rounded text-[8px] md:text-[10px] text-white font-medium">
                      Tập {anime.episode_current}
                    </span>
                  )}
                </div>
                <h4 className="text-white text-xs md:text-sm font-medium line-clamp-2 group-hover:text-white-400 transition-colors">
                  {anime.name}
                </h4>
                {anime.origin_name && anime.origin_name !== anime.name && (
                  <p className="text-gray-400 text-[10px] md:text-xs line-clamp-1 mt-0.5 md:mt-1">
                    {anime.origin_name}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnimeShowcase; 