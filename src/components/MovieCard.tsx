import Link from 'next/link';
import Image from 'next/image';
import { Movie } from '@/services/api/movieApi';

interface MovieCardProps {
  movie: Movie;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  // Đảm bảo URL hình ảnh là URL đầy đủ
  const getImageUrl = (url: string) => {
    if (!url) return '/placeholder.jpg';
    if (url.startsWith('http')) return url;
    return `https://img.phimapi.com/${url}`;
  };

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
      return "bg-red-600"; // Red for CAM
    } else {
      return "bg-blue-600"; // Blue for HD/FHD
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-lg transform transition-all duration-500 hover:-translate-y-2">
      <Link href={`/movie/${movie.slug}`} className="block">
        {/* Card container with border effect */}
        <div className="relative overflow-hidden rounded-lg shadow-lg border border-transparent group-hover:border-blue-500/30 transition-all duration-300 bg-[#151f32]">
          {/* Main poster image */}
          <div className="relative w-full aspect-[2/3] overflow-hidden">
            <Image
              src={getImageUrl(movie.poster_url || movie.thumb_url)}
              alt={movie.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              priority={false}
              loading="lazy"
            />
            
            {/* Shimmering effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Dark overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80"></div>
            
            {/* Quality badge with glow */}
            <div className="absolute top-2 right-2">
              <span className={`${getBadgeColor()} text-white text-xs font-medium px-2 py-0.5 rounded shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300`}>
                {getQualityBadge()}
              </span>
            </div>
            
            {/* Play button on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
              <div className="bg-blue-500/90 rounded-full p-3 transform scale-50 group-hover:scale-100 transition-all duration-500 shadow-lg shadow-blue-500/50">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            
            {/* Bottom info section */}
            <div className="absolute bottom-0 left-0 right-0 px-3 py-3 backdrop-blur-sm bg-black/40 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
              {/* Episode status */}
              <div className="flex justify-between items-center mb-1">
                <span className="text-yellow-400 text-xs font-medium">
                  {movie.year || '2025'}
                </span>
                
                {movie.episode_current && (
                  <span className="text-blue-400 text-xs font-medium">
                    Hoàn Tất ({movie.episode_total ? `${movie.episode_current}/${movie.episode_total}` : movie.episode_current})
                  </span>
                )}
              </div>
              
              {/* Duration and rating */}
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <svg className="w-3.5 h-3.5 mr-1 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-gray-300">
                    {movie.time || '125 phút'}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-3.5 h-3.5 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <span className="text-xs text-yellow-400 font-medium">
                    {movie.tmdb?.vote_average ? movie.tmdb.vote_average.toFixed(1) : 
                    movie.rating?.vote_average ? movie.rating.vote_average.toFixed(1) : "7.9"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Title below image with blue glow on hover */}
      <div className="mt-3 px-1">
        <h3 className="font-bold text-white text-sm line-clamp-2 group-hover:text-blue-400 transition-all duration-300 group-hover:text-shadow-sm">
          {movie.name}
        </h3>
        
        {movie.origin_name && movie.origin_name !== movie.name && (
          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
            {movie.origin_name}
          </p>
        )}
      </div>
    </div>
  );
};

export default MovieCard; 