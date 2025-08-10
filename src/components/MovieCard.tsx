"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Movie {
  slug: string;
  name: string;
  origin_name?: string;
  thumb_url?: string;
  poster_url: string;
  year?: number;
  category?: Array<{ name: string; slug: string }>;
  lang?: string;
  quality?: string;
}

interface MovieCardProps {
  movie: Movie;
  aspectRatio?: 'portrait' | 'landscape'; // 2/3 (portrait) hoặc 16/9 (landscape)
  size?: 'sm' | 'md' | 'lg';
  showInfo?: boolean;
}

const ensureValidImageUrl = (url: string): string => {
  if (!url) return '/placeholder.jpg';

  // Nếu URL bắt đầu bằng "upload/", thêm domain
  if (url.startsWith('upload/')) {
    return `https://img.phimapi.com/${url}`;
  }

  // Đảm bảo URL bắt đầu bằng http hoặc https
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    // Nếu URL không có protocol, thêm domain
    return `https://img.phimapi.com/${url}`;
  }

  return url;
};

export function MovieCard({ 
  movie, 
  aspectRatio = 'portrait',
  size = 'md',
  showInfo = true 
}: MovieCardProps) {
  const router = useRouter();
  const imageUrl = ensureValidImageUrl(movie.thumb_url || movie.poster_url || '');

  useEffect(() => {
    // Prefetch movie detail page
    router.prefetch(`/watch/${movie.slug}`);
  }, [movie.slug, router]);

  // Xác định lớp aspect ratio
  const aspectClass = aspectRatio === 'portrait' ? 'aspect-[2/3]' : 'aspect-video';
  
  // Xác định kích thước phông chữ dựa trên size
  const titleClass = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';
  const infoClass = size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-xs' : 'text-sm';
  
  return (
    <Link href={`/watch/${movie.slug}`} className="group block">
      <div className={`relative ${aspectClass} overflow-hidden rounded-lg bg-zinc-800 shadow-md hover:shadow-lg transition-all duration-300`}>
        {/* Thumbnail */}
        <div className="absolute inset-0">
          <Image
            src={imageUrl}
            alt={movie.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 20vw, 16vw"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        {/* Quality badge */}
        {movie.quality && (
          <div className="absolute top-2 left-2">
            <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded shadow-sm">
              {movie.quality}
            </span>
          </div>
        )}

        {/* Language badge */}
        {movie.lang && (
          <div className="absolute top-2 right-2">
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded shadow-sm">
              {movie.lang}
            </span>
          </div>
        )}

        {/* Movie info */}
        {showInfo && (
          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
            <h3 className={`text-white font-medium ${titleClass} line-clamp-2 mb-0.5 sm:mb-1`}>
              {movie.name}
            </h3>
            <div className={`flex justify-between items-center ${infoClass} text-gray-300`}>
              {movie.year && <span>{movie.year}</span>}
              {movie.category && movie.category[0] && <span className="truncate max-w-[60%]">{movie.category[0].name}</span>}
            </div>
          </div>
        )}

        {/* Play button overlay (visible on hover) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-600/80 flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Export default MovieCard để tương thích ngược
export default MovieCard;