'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import movieApi, { Movie, Episode, ServerData } from '@/services/api/movieApi';

interface WatchProps {
  params: {
    id: string;
  };
}

export default function Watch({ params }: WatchProps) {
  const searchParams = useSearchParams();
  const episodeSlug = searchParams.get('tap') || 'tap-01';
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [episodes, setEpisodes] = useState<ServerData[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [currentServer, setCurrentServer] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const slug = params.id;
        const data = await movieApi.getMovieDetails(slug);
        
        setMovie(data.movie);
        setEpisodes(data.episodes || []);
        
        // Tìm tập phim hiện tại
        if (data.episodes && data.episodes.length > 0) {
          setCurrentServer(data.episodes[0].server_name);
          
          // Tìm tập phim theo slug từ URL
          const server = data.episodes[0];
          const episode = server.server_data.find(ep => ep.slug === episodeSlug) || server.server_data[0];
          setCurrentEpisode(episode);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching movie:', err);
        setError('Không thể tải thông tin phim. Vui lòng thử lại sau.');
        setIsLoading(false);
      }
    };
    
    fetchMovie();
  }, [params, episodeSlug]);
  
  // Hàm chọn server
  const handleServerChange = (serverName: string) => {
    const server = episodes.find(s => s.server_name === serverName);
    if (server) {
      setCurrentServer(serverName);
      
      // Tìm tập phim tương ứng trong server mới
      const episode = server.server_data.find(ep => ep.slug === episodeSlug) || server.server_data[0];
      setCurrentEpisode(episode);
    }
  };
  
  // Hàm chọn tập phim
  const handleEpisodeChange = (episode: Episode) => {
    setCurrentEpisode(episode);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
          <p className="mt-2">Đang tải phim...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center pt-16">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button 
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }
  
  if (!movie) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <p>Không tìm thấy thông tin phim.</p>
          <Link href="/" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 py-8 pt-24">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          {movie.name} {currentEpisode && `- ${currentEpisode.name}`}
        </h1>
        <h2 className="text-lg text-gray-400">{movie.origin_name}</h2>
      </div>
      
      {/* Player */}
      <div className="w-full aspect-video bg-black rounded-lg mb-6 overflow-hidden">
        {currentEpisode ? (
          <iframe
            src={currentEpisode.link_embed}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <p className="mb-4">Không tìm thấy nguồn phát.</p>
              <p className="text-sm">Vui lòng chọn một tập phim khác.</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Server Selection */}
      {episodes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Chọn Server</h3>
          <div className="flex flex-wrap gap-2">
            {episodes.map((server) => (
              <button
                key={server.server_name}
                onClick={() => handleServerChange(server.server_name)}
                className={`px-4 py-2 rounded ${
                  currentServer === server.server_name
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                {server.server_name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Episode Selection */}
      {episodes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Danh sách tập</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
            {episodes
              .find(server => server.server_name === currentServer)
              ?.server_data.map((episode) => (
                <Link
                  key={episode.slug}
                  href={`/watch/${params.id}?tap=${episode.slug}`}
                  className={`px-3 py-2 text-center rounded ${
                    currentEpisode?.slug === episode.slug
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }`}
                >
                  {episode.name}
                </Link>
              ))}
          </div>
        </div>
      )}
      
      {/* Movie Info */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Thông tin phim</h3>
            <ul className="space-y-2">
              <li className="flex">
                <span className="text-gray-400 w-32">Tên phim:</span>
                <span>{movie.name}</span>
              </li>
              <li className="flex">
                <span className="text-gray-400 w-32">Tên gốc:</span>
                <span>{movie.origin_name}</span>
              </li>
              <li className="flex">
                <span className="text-gray-400 w-32">Trạng thái:</span>
                <span>{movie.episode_current}</span>
              </li>
              <li className="flex">
                <span className="text-gray-400 w-32">Thời lượng:</span>
                <span>{movie.time}</span>
              </li>
              <li className="flex">
                <span className="text-gray-400 w-32">Năm phát hành:</span>
                <span>{movie.year}</span>
              </li>
              <li className="flex">
                <span className="text-gray-400 w-32">Chất lượng:</span>
                <span>{movie.quality}</span>
              </li>
              <li className="flex">
                <span className="text-gray-400 w-32">Ngôn ngữ:</span>
                <span>{movie.lang}</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Thể loại</h3>
            <div className="flex flex-wrap gap-2">
              {movie.category && movie.category.map((cat, index) => (
                <Link key={index} href={`/category/${cat.slug}`} className="px-3 py-1 bg-gray-700 text-white text-sm rounded-full hover:bg-gray-600">
                  {cat.name}
                </Link>
              ))}
            </div>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">Quốc gia</h3>
            <div className="flex flex-wrap gap-2">
              {movie.country && movie.country.map((country, index) => (
                <Link key={index} href={`/country/${country.slug}`} className="px-3 py-1 bg-gray-700 text-white text-sm rounded-full hover:bg-gray-600">
                  {country.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <Link href={`/movie/${movie.slug}`} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          Chi tiết phim
        </Link>
        <Link href="/" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition">
          Trang chủ
        </Link>
      </div>
    </div>
  );
} 