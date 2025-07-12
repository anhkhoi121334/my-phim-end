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
      return "bg-red-500/80"; // Semi-transparent red for CAM
    } else {
      return "bg-blue-500/80"; // Semi-transparent blue for HD/FHD
    }
  };

  return (
    <Link href={`/movie/${movie.slug}`} className="group">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#2a2d3d] shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        <Image
          src={formatImageUrl(movie.poster_url)}
          alt={movie.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          quality={80}
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4dHRsdHR4dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/2wBDAR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-90 group-hover:opacity-70 transition-opacity"></div>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-sm font-semibold text-gray-200 line-clamp-2 mb-1 group-hover:text-blue-400 transition-colors">
            {movie.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className={`${getBadgeColor()} text-white px-2 py-0.5 rounded text-xs font-medium shadow-sm backdrop-blur-sm`}>
              {movie.episode_current}
            </span>
            <span className="text-gray-400 text-xs font-medium">{getQualityBadge()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard; 