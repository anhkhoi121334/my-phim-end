'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import movieApi, { Movie, Episode, ServerData } from '@/services/api/movieApi';
// @ts-ignore
import Hls from 'hls.js';

interface WatchProps {
  params: {
    id: string;
  };
}

export default function Watch({ params }: WatchProps) {
  const searchParams = useSearchParams();
  // Get episode from URL, handle both tap and ep parameters
  const episodeParam = searchParams.get('tap') || searchParams.get('ep') || 'tap-01';
  // If it's a number without "tap-" prefix, add the prefix for API compatibility
  const episodeSlug = /^\d+$/.test(episodeParam) ? 
    `tap-${episodeParam.length === 1 ? '0' : ''}${episodeParam}` : 
    episodeParam;
  
  // Sử dụng useParams hook thay vì truy cập params trực tiếp
  const routeParams = useParams();
  const id = routeParams.id as string;
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [episodes, setEpisodes] = useState<ServerData[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [currentServer, setCurrentServer] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeError, setIframeError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // HLS support for m3u8 streams
  useEffect(() => {
    if (currentEpisode && videoRef.current) {
      const embed = currentEpisode.link_embed || '';
      let m3u8 = currentEpisode.link_m3u8 || '';
      if (embed.includes('player.phimapi.com')) {
        try {
          m3u8 = new URL(embed).searchParams.get('url') || m3u8;
        } catch {}
      }
      if (m3u8) {
        const video = videoRef.current;
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(m3u8);
          hls.attachMedia(video);
          return () => { hls.destroy(); };
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = m3u8;
        }
      }
    }
  }, [currentEpisode]);
  
  // Xử lý lỗi iframe
  useEffect(() => {
    const handleIframeError = () => {
      console.log("Iframe failed to load properly");
      setIframeError(true);
    };

    // Reset trạng thái lỗi khi thay đổi episode
    if (currentEpisode) {
      setIframeError(false);
    }

    const iframe = iframeRef.current;
    if (iframe) {
      // Lắng nghe sự kiện error
      iframe.addEventListener('error', handleIframeError);
      return () => {
        iframe.removeEventListener('error', handleIframeError);
      };
    }
  }, [currentEpisode]);
  
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const slug = id;
        const data = await movieApi.getMovieDetails(slug);
        
        setMovie(data.movie);
        
        // Tìm tập phim hiện tại
        if (data.episodes && data.episodes.length > 0) {
          setEpisodes(data.episodes || []);
          setCurrentServer(data.episodes[0].server_name);
          
          // Tìm tập phim theo slug từ URL hoặc số tập
          const server = data.episodes[0];
          let episode = server.server_data.find(ep => ep.slug === episodeSlug);
          
          // If not found by exact slug, try alternatives
          if (!episode) {
            // Try to match by episode number (tap-01, tap-1, 1, etc.)
            const matchEpisodeNumber = episodeSlug.match(/\d+$/);
            if (matchEpisodeNumber) {
              const epNumber = parseInt(matchEpisodeNumber[0]);
              episode = server.server_data.find(ep => {
                const epMatch = ep.slug.match(/\d+$/) || ep.name.match(/\d+$/);
                return epMatch && parseInt(epMatch[0]) === epNumber;
              });
            }
          }
          
          // Fallback to first episode if no match
          setCurrentEpisode(episode || server.server_data[0]);
        } else {
          // Always create at least one episode, regardless of movie type
          const episodeCount = data.movie && data.movie.episode_current && parseInt(data.movie.episode_current) > 1
            ? parseInt(data.movie.episode_current)
            : 1; // Default to at least 1 episode
            
          const fakeEpisodes: Episode[] = [];
          
          for (let i = 1; i <= episodeCount; i++) {
            fakeEpisodes.push({
              name: `Tập ${i}`,
              slug: `${i}`,
              filename: `${data.movie.slug}_${i}`,
              link_embed: `https://player.phimapi.com/${data.movie.slug}?ep=${i}`,
              link_m3u8: ''
            });
          }
          
          const fakeServerData: ServerData = {
            server_name: 'Main Server',
            server_data: fakeEpisodes
          };
          
          setEpisodes([fakeServerData]);
          setCurrentServer('Main Server');
          
          // Find the requested episode with improved matching
          let requestedEpisode = fakeEpisodes.find(ep => ep.slug === episodeSlug);
          
          // If not found by exact slug, try alternatives
          if (!requestedEpisode) {
            // Try to match by episode number (tap-01, tap-1, 1, etc.)
            const matchEpisodeNumber = episodeSlug.match(/\d+$/);
            if (matchEpisodeNumber) {
              const epNumber = parseInt(matchEpisodeNumber[0]);
              requestedEpisode = fakeEpisodes.find(ep => {
                const epMatch = ep.slug.match(/\d+$/) || ep.name.match(/\d+$/);
                return epMatch && parseInt(epMatch[0]) === epNumber;
              });
            }
          }
          
          // Fallback to first episode if still not found
          if (!requestedEpisode) {
            requestedEpisode = fakeEpisodes[0];
          }
                                  
          setCurrentEpisode(requestedEpisode);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching movie:', err);
        setError('Không thể tải thông tin phim. Vui lòng thử lại sau.');
        setIsLoading(false);
      }
    };
    
    fetchMovie();
  }, [id, episodeSlug]);
  
  // Hàm chọn server
  const handleServerChange = (serverName: string) => {
    const server = episodes.find(s => s.server_name === serverName);
    if (server) {
      setCurrentServer(serverName);
      
      // Tìm tập phim tương ứng trong server mới
      let episode = server.server_data.find(ep => ep.slug === episodeSlug);
      
      // If not found by exact slug, try alternatives
      if (!episode) {
        // Try to match by episode number (tap-01, tap-1, 1, etc.)
        const matchEpisodeNumber = episodeSlug.match(/\d+$/);
        if (matchEpisodeNumber) {
          const epNumber = parseInt(matchEpisodeNumber[0]);
          episode = server.server_data.find(ep => {
            const epMatch = ep.slug.match(/\d+$/) || ep.name.match(/\d+$/);
            return epMatch && parseInt(epMatch[0]) === epNumber;
          });
        }
      }
      
      setCurrentEpisode(episode || server.server_data[0]);
    }
  };
  
  // Hàm chọn tập phim
  const handleEpisodeChange = (episode: Episode) => {
    setCurrentEpisode(episode);
  };
  
  // Lọc và xử lý link embed và m3u8
  const embedUrl = currentEpisode?.link_embed || '';
  // Tách m3u8 từ embed nếu là wrapper player.phimapi.com
  let m3u8Url = currentEpisode?.link_m3u8 || '';
  if (embedUrl.includes('player.phimapi.com')) {
    try {
      const parsed = new URL(embedUrl).searchParams.get('url') || '';
      m3u8Url = parsed;
    } catch {}
  }
  
  // Quyết định cho phép iframe
  let allowIframe = false;
  if (embedUrl && !iframeError) {
    try {
      const hostname = new URL(embedUrl).hostname;
      // Loại bỏ host không cho embed
      const blocked = ['google.com','www.google.com','player.phimapi.com'];
      if (!blocked.includes(hostname)) {
        allowIframe = true;
      }
    } catch {}
  }
  
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
    <div className="bg-[#101720] min-h-screen page-transition">
      <div className="container mx-auto p-4 py-8 mt-[70px]">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">
            {movie.name} {currentEpisode && `- ${currentEpisode.name}`}
          </h1>
          <h2 className="text-lg text-gray-400">{movie.origin_name}</h2>
        </div>
        
        {/* Player */}
        <div className="w-full aspect-video bg-black rounded-lg mb-6 overflow-hidden">
          {currentEpisode ? (
            <div className="w-full h-full">
              {allowIframe && embedUrl ? (
                <iframe
                  ref={iframeRef}
                  src={embedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  referrerPolicy="no-referrer"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                  onError={() => setIframeError(true)}
                  onLoad={() => setIframeError(false)}
                />
              ) : m3u8Url ? (
                <video
                  ref={videoRef}
                  controls
                  autoPlay
                  className="w-full h-full"
                  src={m3u8Url}
                >
                  Trình duyệt của bạn không hỗ trợ HTML5 video.
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <p className="mb-4">Không thể hiển thị video này.</p>
                    <p className="text-sm">Vui lòng chọn server hoặc tập phim khác.</p>
                    {currentServer && embedUrl && (
                      <a
                        href={embedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Mở Link Trực Tiếp
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
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
                    href={`/watch/${id}?ep=${episode.slug}`}
                    className={`px-3 py-2 text-center rounded ${
                      currentEpisode?.slug === episode.slug
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    }`}
                  >
                    {episode.name.startsWith('Tập') ? episode.name : `Tập ${episode.name}`}
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
    </div>
  );
} 