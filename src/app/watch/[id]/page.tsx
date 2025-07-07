'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import movieApi, { Movie, Episode, ServerData } from '@/services/api/movieApi';
import Hls from 'hls.js';

// Custom hook for video player controls
function useVideoControls(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to handle video seeking
  const handleSeek = useCallback((seconds: number) => {
    if (videoRef.current) {
      try {
        // Make sure we don't go below 0
        const newTime = Math.max(0, videoRef.current.currentTime + seconds);
        // Make sure we don't exceed duration
        if (videoRef.current.duration) {
          videoRef.current.currentTime = Math.min(newTime, videoRef.current.duration);
        } else {
          videoRef.current.currentTime = newTime;
        }
      } catch (error) {
        console.error("Error seeking video:", error);
      }
    }
  }, [videoRef]);
  
  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      try {
        if (videoRef.current.paused) {
          const playPromise = videoRef.current.play();
          // Handle the play promise to catch any autoplay restrictions
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                // Playback started successfully
                setIsPlaying(true);
              })
              .catch(error => {
                // Auto-play was prevented
                console.error("Playback was prevented:", error);
                setIsPlaying(false);
              });
          }
        } else {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      } catch (error) {
        console.error("Error toggling play/pause:", error);
      }
    }
  }, [videoRef]);
  
  // Show controls temporarily
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    
    // Clear any existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    // Hide controls after 2 seconds
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  }, []);
  
  // Setup keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard shortcuts if video is loaded and not in a form field
      if (videoRef.current && 
          !(e.target instanceof HTMLInputElement || 
            e.target instanceof HTMLTextAreaElement || 
            (e.target instanceof HTMLElement && e.target.isContentEditable))) {
        
        if (e.key === 'ArrowLeft') {
          handleSeek(-10);
          showControlsTemporarily();
        } else if (e.key === 'ArrowRight') {
          handleSeek(10);
          showControlsTemporarily();
        } else if (e.key === ' ' || e.key === 'k') {
          e.preventDefault(); // Prevent page scroll on space
          togglePlayPause();
          showControlsTemporarily();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSeek, showControlsTemporarily, togglePlayPause]);
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);
  
  // Setup play/pause state tracking when video is available
  const setupVideoListeners = useCallback((video: HTMLVideoElement) => {
    if (!video) return () => {};
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e: Event) => {
      console.error("Video error:", e);
      setIsPlaying(false);
    };
    
    // Set initial state
    setIsPlaying(!video.paused);
    
    // Add event listeners
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    
    // Show controls when video is interacted with
    video.addEventListener('seeking', showControlsTemporarily);
    video.addEventListener('volumechange', showControlsTemporarily);
    
    // Return cleanup function
    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('seeking', showControlsTemporarily);
      video.removeEventListener('volumechange', showControlsTemporarily);
    };
  }, [showControlsTemporarily]);
  
  return {
    isPlaying,
    showControls,
    handleSeek,
    togglePlayPause,
    showControlsTemporarily,
    setupVideoListeners
  };
}

export default function Watch() {
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
  // Remove these states and refs as they're now in the hook
  // const [isPlaying, setIsPlaying] = useState(false);
  // const [showControls, setShowControls] = useState(false);
  // const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use our custom hook
  const {
    isPlaying,
    showControls,
    handleSeek,
    togglePlayPause,
    showControlsTemporarily,
    setupVideoListeners
  } = useVideoControls(videoRef);
  
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
  
  // Simplify HLS support to use our hook
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    if (currentEpisode && videoRef.current) {
      const embed = currentEpisode.link_embed || '';
      let m3u8 = currentEpisode.link_m3u8 || '';
      if (embed.includes('player.phimapi.com')) {
        try {
          m3u8 = new URL(embed).searchParams.get('url') || m3u8;
        } catch (error) {
          console.error("Error parsing embed URL:", error);
        }
      }
      
      if (m3u8) {
        const video = videoRef.current;
        
        // Setup play/pause tracking using our hook
        cleanup = setupVideoListeners(video);
        
        try {
          if (Hls.isSupported()) {
            const hls = new Hls({
              xhrSetup: (xhr) => {
                xhr.onerror = () => {
                  console.error("HLS XHR error");
                }
              }
            });
            
            hls.on(Hls.Events.ERROR, (event, data) => {
              console.error("HLS error:", data);
              if (data.fatal) {
                switch(data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    console.error("HLS network error - trying to recover");
                    hls.startLoad();
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    console.error("HLS media error - trying to recover");
                    hls.recoverMediaError();
                    break;
                  default:
                    console.error("HLS fatal error - cannot recover");
                    break;
                }
              }
            });
            
            hls.loadSource(m3u8);
            hls.attachMedia(video);
            
            return () => { 
              hls.destroy();
              if (cleanup) cleanup();
            };
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = m3u8;
            return () => {
              if (cleanup) cleanup();
            };
          }
        } catch (error) {
          console.error("Error setting up video player:", error);
          if (cleanup) cleanup();
        }
      }
    }
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [currentEpisode, setupVideoListeners]);
  
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
    <div className="bg-[#0d1117] min-h-screen page-transition">
      <div className="container mx-auto p-4 py-6 mt-[70px]">
        <div className="mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-white">
            {movie.name} {currentEpisode && <span className="text-blue-400">- {currentEpisode.name}</span>}
          </h1>
          {movie.origin_name && movie.origin_name !== movie.name && (
            <h2 className="text-sm md:text-base text-gray-400">{movie.origin_name}</h2>
          )}
        </div>
        
        {/* Player */}
        <div className="w-full aspect-video bg-black rounded-xl mb-5 overflow-hidden shadow-lg shadow-black/50 relative">
          {currentEpisode ? (
            <div className="w-full h-full relative group">
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
                <>
                  <video
                    ref={videoRef}
                    controls
                    autoPlay
                    className="w-full h-full"
                    src={m3u8Url}
                    onSeeking={() => showControlsTemporarily()}
                  >
                    Trình duyệt của bạn không hỗ trợ HTML5 video.
                  </video>
                  
                  {/* Simple seek buttons - repositioned to center-bottom */}
                  <div className={`absolute inset-x-0 bottom-24 flex justify-center transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <div className="flex gap-4 bg-black/50 backdrop-blur px-5 py-2 rounded-full shadow-lg">
                      <button
                        onClick={() => {
                          handleSeek(-10);
                          showControlsTemporarily();
                        }}
                        className="flex items-center justify-center bg-gray-800/80 hover:bg-blue-600 text-white rounded-full w-10 h-10 transition-all"
                        title="Tua lại 10 giây"
                      >
                        <span className="font-bold text-sm">-10s</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          togglePlayPause();
                          showControlsTemporarily();
                        }}
                        className="flex items-center justify-center bg-gray-800/80 hover:bg-blue-600 text-white rounded-full w-12 h-12 transition-all mx-1"
                        title={isPlaying ? "Tạm dừng" : "Phát"}
                      >
                        {isPlaying ? (
                          <span className="text-2xl leading-none">❚❚</span>
                        ) : (
                          <span className="text-xl leading-none pl-0.5">▶</span>
                        )}
                      </button>
                      
                      <button
                        onClick={() => {
                          handleSeek(10);
                          showControlsTemporarily();
                        }}
                        className="flex items-center justify-center bg-gray-800/80 hover:bg-blue-600 text-white rounded-full w-10 h-10 transition-all"
                        title="Tua đi 10 giây"
                      >
                        <span className="font-bold text-sm">+10s</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Keyboard shortcuts */}
                  <div className="sr-only">
                    <p>Phím tắt: Mũi tên trái để lùi 10 giây, mũi tên phải để tiến 10 giây</p>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
                  <div className="text-center p-6 rounded-lg bg-black/40 backdrop-blur-sm">
                    <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p className="mb-3 text-gray-300">Không thể hiển thị video này.</p>
                    <p className="text-sm text-gray-400 mb-4">Vui lòng chọn server hoặc tập phim khác.</p>
                    {currentServer && embedUrl && (
                      <a
                        href={embedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md inline-flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                        Mở Link Trực Tiếp
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
              <div className="text-center p-6 rounded-lg bg-black/40 backdrop-blur-sm">
                <svg className="w-12 h-12 text-yellow-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <p className="mb-3 text-gray-300">Không tìm thấy nguồn phát.</p>
                <p className="text-sm text-gray-400">Vui lòng chọn một tập phim khác.</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Server Selection & Episode Navigation in a card */}
        <div className="bg-[#151f32] rounded-xl p-4 mb-5 shadow-md border border-blue-900/30">
          {/* Server Selection */}
          {episodes.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2.5 text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
                </svg>
                Chọn Server
              </h3>
              <div className="flex flex-wrap gap-2">
                {episodes.map((server) => (
                  <button
                    key={server.server_name}
                    onClick={() => handleServerChange(server.server_name)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                      currentServer === server.server_name
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-gray-700/70 text-gray-200 hover:bg-gray-600'
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
            <div>
              <h3 className="text-lg font-semibold mb-2.5 text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                </svg>
                Danh sách tập
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                {episodes
                  .find(server => server.server_name === currentServer)
                  ?.server_data.map((episode) => (
                    <Link
                      key={episode.slug}
                      href={`/watch/${id}?ep=${episode.slug}`}
                      className={`px-2 py-1.5 text-center rounded-lg transition-all duration-200 ${
                        currentEpisode?.slug === episode.slug
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-medium'
                          : 'bg-gray-700/70 text-gray-200 hover:bg-gray-600 hover:scale-105'
                      }`}
                    >
                      {episode.name.startsWith('Tập') ? episode.name : `Tập ${episode.name}`}
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Movie Info */}
        <div className="bg-[#151f32] rounded-xl p-5 mb-5 shadow-md border border-blue-900/30">
          <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Thông tin phim
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ul className="space-y-2.5">
                <li className="flex">
                  <span className="text-gray-400 w-28">Tên phim:</span>
                  <span className="text-white font-medium">{movie.name}</span>
                </li>
                <li className="flex">
                  <span className="text-gray-400 w-28">Tên gốc:</span>
                  <span className="text-white">{movie.origin_name}</span>
                </li>
                <li className="flex">
                  <span className="text-gray-400 w-28">Trạng thái:</span>
                  <span className="text-white">{movie.episode_current}</span>
                </li>
                <li className="flex">
                  <span className="text-gray-400 w-28">Thời lượng:</span>
                  <span className="text-white">{movie.time}</span>
                </li>
                <li className="flex">
                  <span className="text-gray-400 w-28">Năm:</span>
                  <span className="text-white">{movie.year}</span>
                </li>
                <li className="flex">
                  <span className="text-gray-400 w-28">Chất lượng:</span>
                  <span className="text-white bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-sm">{movie.quality}</span>
                </li>
                <li className="flex">
                  <span className="text-gray-400 w-28">Ngôn ngữ:</span>
                  <span className="text-white">{movie.lang}</span>
                </li>
              </ul>
            </div>
            
            <div>
              <div className="mb-4">
                <h4 className="text-gray-400 mb-2 text-sm uppercase tracking-wider">Thể loại</h4>
                <div className="flex flex-wrap gap-2">
                  {movie.category && movie.category.map((cat, index) => (
                    <Link key={index} href={`/the-loai/${cat.slug}`} className="px-3 py-1 bg-blue-600/20 border border-blue-600/30 text-blue-300 text-sm rounded-full hover:bg-blue-600/30 transition-colors">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-gray-400 mb-2 text-sm uppercase tracking-wider">Quốc gia</h4>
                <div className="flex flex-wrap gap-2">
                  {movie.country && movie.country.map((country, index) => (
                    <Link key={index} href={`/quoc-gia/${country.slug}`} className="px-3 py-1 bg-gray-700/80 text-gray-300 text-sm rounded-full hover:bg-gray-600 transition-colors">
                      {country.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex flex-wrap gap-3 mt-6">
          <Link href={`/movie/${movie.slug}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md shadow-blue-600/20 flex items-center">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Chi tiết phim
          </Link>
          <Link href="/" className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition shadow-md flex items-center">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
} 