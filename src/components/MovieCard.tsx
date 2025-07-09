import Link from 'next/link';
import Image from 'next/image';
import { Movie } from '@/services/api/movieApi';
import { formatImageUrl } from '@/utils/imageUtils';

interface MovieCardProps {
  movie: Movie;
  priority?: boolean;
}

const MovieCard = ({ movie, priority = false }: MovieCardProps) => {
  // Determine the quality badge to display
  const getQualityBadge = () => {
    if (!movie.quality) return "FHD";
    
    const quality = movie.quality.toLowerCase();
    if (quality.includes('cam') || quality === 'cam') {
      return "CAM";
    } else if (quality === 'hd') {
      return "FHD";
    } else {
      return movie.quality;
    }
  };

  // Determine badge color based on quality
  const getBadgeColor = () => {
    const quality = movie.quality?.toLowerCase() || '';
    if (quality.includes('cam') || quality === 'cam') {
      return "bg-gradient-to-r from-red-600 to-red-700"; // Red gradient for CAM
    } else {
      return "bg-gradient-to-r from-blue-600 to-purple-600"; // Blue-purple gradient for HD/FHD
    }
  };

  // Get episode display text
  const getEpisodeText = () => {
    if (movie.episode_current && movie.episode_total) {
      return `${movie.episode_current}/${movie.episode_total}`;
    } else if (movie.episode_current) {
      return `Tập ${movie.episode_current}`;
    } else {
      return "Full";
    }
  };

  return (
    <Link href={`/movie/${movie.slug}`} className="group block">
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] border border-gray-700/50 hover:border-blue-500/50">
        {/* Movie Poster */}
        <Image
          src={formatImageUrl(movie.thumb_url)}
          alt={movie.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          quality={85}
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4dHRsdHR4dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/2wBDAR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
        
        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300"></div>
        
        {/* Quality Badge */}
        <div className={`absolute top-3 right-3 ${getBadgeColor()} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm z-10`}>
          {getQualityBadge()}
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        {/* Movie Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          {/* Movie Title */}
          <h3 className="text-sm font-bold text-white line-clamp-2 mb-2 group-hover:text-blue-200 transition-colors duration-300 leading-tight">
            {movie.name}
          </h3>
          
          {/* Movie Details Row */}
          <div className="flex items-center justify-between gap-2">
            {/* Episode Badge */}
            <span className={`${getBadgeColor()} text-white px-2 py-1 rounded-full text-xs font-semibold shadow-md backdrop-blur-sm flex-shrink-0`}>
              {getEpisodeText()}
            </span>
            
            {/* Year */}
            {movie.year && (
              <span className="text-gray-300 text-xs font-medium bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                {movie.year}
              </span>
            )}
          </div>

          {/* Additional Info */}
          <div className="flex items-center gap-2 mt-2">
            {/* Rating */}
            {movie.tmdb?.vote_average && (
              <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
                <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span className="text-white text-xs font-medium">
                  {movie.tmdb.vote_average.toFixed(1)}
                </span>
              </div>
            )}
            
            {/* Duration */}
            {movie.time && (
              <span className="text-gray-300 text-xs font-medium bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
                {movie.time}
              </span>
            )}
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl"></div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard; 