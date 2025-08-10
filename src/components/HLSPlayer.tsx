"use client";
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';

interface HLSPlayerProps {
  src: string;
  className?: string;
  movieId?: string; // ID của phim để lưu thời gian xem
  episodeSlug?: string; // Slug của tập phim hiện tại
}

export default function HLSPlayer({ src, className = '', movieId, episodeSlug }: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [showControls, setShowControls] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showPlaybackOptions, setShowPlaybackOptions] = useState(false);
  const [seekMessage, setSeekMessage] = useState<{text: string, direction: 'forward' | 'backward'} | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLightModeOn, setIsLightModeOn] = useState(false); // Trạng thái bật đèn
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const seekMessageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoplayAttemptedRef = useRef(false);
  const hlsRef = useRef<Hls | null>(null);
  const isManifestLoadedRef = useRef(false);
  const autoplayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const isMobileRef = useRef<boolean>(false);
  const orientationChangeHandledRef = useRef<boolean>(false);
  const playerWrapperRef = useRef<HTMLDivElement>(null);

  // Playback speed options
  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];
  
  // Kiểm tra thiết bị di động
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      isMobileRef.current = /iphone|ipad|ipod|android|blackberry|windows phone/g.test(userAgent);
    };
    
    checkMobile();
  }, []);

  // Đọc trạng thái bật đèn từ localStorage khi khởi tạo
  useEffect(() => {
    const savedLightMode = localStorage.getItem('myphim-light-mode');
    if (savedLightMode) {
      setIsLightModeOn(savedLightMode === 'true');
    }
  }, []);

  // Phát hiện hướng màn hình và xử lý sự kiện xoay
  useEffect(() => {
    const handleOrientationChange = () => {
      if (!isMobileRef.current) return;

      // Kiểm tra hướng màn hình
      const isLandscapeMode = window.matchMedia("(orientation: landscape)").matches;

      // Xử lý chuyển đổi chế độ toàn màn hình khi xoay ngang
      if (isLandscapeMode && !orientationChangeHandledRef.current) {
        // Chỉ tự động chuyển sang toàn màn hình khi xoay ngang lần đầu
        if (!document.fullscreenElement && videoRef.current?.parentElement) {
          videoRef.current.parentElement.requestFullscreen().catch(err => {
            console.error(`Không thể vào chế độ toàn màn hình: ${err.message}`);
          });
          setIsFullscreen(true);
          orientationChangeHandledRef.current = true;
        }
      } else if (!isLandscapeMode && document.fullscreenElement) {
        // Thoát chế độ toàn màn hình khi xoay dọc
        document.exitFullscreen().catch(err => {
          console.error(`Không thể thoát chế độ toàn màn hình: ${err.message}`);
        });
        setIsFullscreen(false);
        orientationChangeHandledRef.current = false;
      }
    };

    // Đăng ký sự kiện xoay màn hình
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    // Kiểm tra hướng màn hình ban đầu
    handleOrientationChange();

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);
  
  // Theo dõi sự kiện fullscreen thay đổi từ bên ngoài (như nhấn Esc)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      
      // Đặt lại trạng thái xử lý xoay màn hình khi thoát toàn màn hình
      if (!document.fullscreenElement) {
        orientationChangeHandledRef.current = false;
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Tạo full screen
  const toggleFullScreen = () => {
    try {
      if (!document.fullscreenElement) {
        // Vào chế độ toàn màn hình
        const container = videoRef.current?.parentElement;
        if (container) {
          container.requestFullscreen().catch(err => {
            console.error(`Không thể vào chế độ toàn màn hình: ${err.message}`);
          });
        }
        setIsFullscreen(true);
      } else {
        // Thoát chế độ toàn màn hình
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("Lỗi khi xử lý chế độ toàn màn hình:", error);
    }
  };
  
  // Cài đặt HLS và xử lý video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset các trạng thái
    setLoading(true);
    setError(null);
    autoplayAttemptedRef.current = false;
    isManifestLoadedRef.current = false;
    
    // Xóa timeout cũ nếu có
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
      autoplayTimeoutRef.current = null;
    }
    
    // Nếu có instance HLS cũ, hủy nó
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    
    // Khắc phục lỗi tương thích cho Safari/iOS
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');

    const setupHLS = () => {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          maxBufferSize: 30 * 1000 * 1000, // 30MB
          maxMaxBufferLength: 60,
        });
        
        hlsRef.current = hls;
        
        // Đăng ký sự kiện trước khi load source
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          isManifestLoadedRef.current = true;
          
          // Đọc thời gian xem đã lưu
          if (movieId && episodeSlug) {
            const savedTime = localStorage.getItem(`watchtime-${movieId}-${episodeSlug}`);
            if (savedTime) {
              const time = parseInt(savedTime, 10);
              if (time && !isNaN(time)) {
                video.currentTime = time;
              }
            }
          }
          
          setLoading(false);
          
          // Trì hoãn việc phát để đảm bảo video đã sẵn sàng
          autoplayTimeoutRef.current = setTimeout(() => {
            if (!autoplayAttemptedRef.current) {
              autoplayAttemptedRef.current = true;
              attemptAutoplay();
            }
          }, 500);
        });

        // Xử lý lỗi HLS
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('Network error, trying to recover...', data);
                setError('Lỗi kết nối mạng, đang thử kết nối lại...');
                // Thử khởi động lại tối đa 3 lần
                let attempts = 0;
                const retryLoad = () => {
                  if (attempts >= 3 || !hlsRef.current) return;
                  attempts++;
                  setTimeout(() => {
                    console.log(`Retry attempt ${attempts}`);
                    if (hlsRef.current) hlsRef.current.startLoad();
                  }, 1000 * attempts); // Mỗi lần thử lại cách nhau lâu hơn
                };
                retryLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error('Media error, trying to recover...', data);
                setError('Lỗi phát video, đang thử khôi phục...');
                hls?.recoverMediaError();
                break;
              default:
                console.error('Fatal error, destroying HLS instance...', data);
                setError('Có lỗi xảy ra khi phát video');
                if (hlsRef.current === hls) {
                  hls.destroy();
                  hlsRef.current = null;
                }
                break;
            }
          }
        });
        
        // Attach media trước khi load source
        hls.attachMedia(video);
        
        // Sau đó mới load source
        hls.loadSource(src);
      }
      // For browsers that natively support HLS
      else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        const handleMetadata = () => {
          // Đọc thời gian xem đã lưu
          if (movieId && episodeSlug) {
            const savedTime = localStorage.getItem(`watchtime-${movieId}-${episodeSlug}`);
            if (savedTime) {
              const time = parseInt(savedTime, 10);
              if (time && !isNaN(time)) {
                video.currentTime = time;
              }
            }
          }
          
          setLoading(false);
          
          // Trì hoãn việc phát để đảm bảo video đã sẵn sàng
          autoplayTimeoutRef.current = setTimeout(() => {
            if (!autoplayAttemptedRef.current) {
              autoplayAttemptedRef.current = true;
              attemptAutoplay();
            }
          }, 500);
          
          // Xóa event listener để tránh gọi nhiều lần
          video.removeEventListener('loadedmetadata', handleMetadata);
        };
        
        // Đăng ký sự kiện trước khi thiết lập nguồn
        video.addEventListener('loadedmetadata', handleMetadata);
        
        // Thiết lập nguồn
        video.src = src;
        video.load();
      } else {
        setError('Trình duyệt của bạn không hỗ trợ phát video HLS');
        setLoading(false);
      }
    };
    
    // Hàm thử tự động phát với các chiến lược khác nhau
    const attemptAutoplay = async () => {
      if (!videoRef.current) return;
      
      try {
        // Đảm bảo video đã sẵn sàng để phát
        if (videoRef.current.readyState < 2) { // HAVE_CURRENT_DATA
          // Đợi thêm một chút nếu video chưa sẵn sàng
          await new Promise(resolve => {
            const checkReady = () => {
              if (videoRef.current && videoRef.current.readyState >= 2) {
                resolve(true);
              } else if (videoRef.current) {
                // Lắng nghe sự kiện canplay
                const handleCanPlay = () => {
                  videoRef.current?.removeEventListener('canplay', handleCanPlay);
                  resolve(true);
                };
                videoRef.current.addEventListener('canplay', handleCanPlay);
                // Fallback timeout sau 5 giây
                setTimeout(() => resolve(true), 5000);
              } else {
                setTimeout(checkReady, 200);
              }
            };
            checkReady();
          });
        }
        
        // Thử phát video
        await videoRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.warn('Standard autoplay was prevented:', error);
        
        // Thử với muted (trình duyệt thường cho phép tự động phát video tắt tiếng)
        try {
          if (videoRef.current) {
            videoRef.current.muted = true;
            await videoRef.current.play();
            setIsPlaying(true);
            setVolume(0); // Cập nhật state volume để khớp với video.muted
          }
        } catch (mutedError) {
          console.error('Muted autoplay was also prevented:', mutedError);
          setIsPlaying(false);
        }
      }
    };

    setupHLS();

    // Các event listeners
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      // Lưu thời gian xem mỗi 5 giây
      if (movieId && episodeSlug && video.currentTime > 5) {
        if (Math.floor(video.currentTime) % 5 === 0) {
          localStorage.setItem(`watchtime-${movieId}-${episodeSlug}`, Math.floor(video.currentTime).toString());
        }
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      
      // Ghi nhận lượt xem khi video bắt đầu phát
      if (movieId) {
        fetch(`/api/movies/by-id/${movieId}/view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }).catch(error => {
          console.error('Lỗi khi ghi nhận lượt xem:', error);
        });
      }
    };
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => setVolume(Math.round(video.volume * 100));
    const handleDurationChange = () => setDuration(video.duration);
    const handleRateChange = () => setPlaybackRate(video.playbackRate);

    const handleLoadStart = () => setLoading(true);
    const handleCanPlay = () => setLoading(false);
    const handleError = () => {
      setLoading(false);
      setError('Có lỗi xảy ra khi phát video');
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('ratechange', handleRateChange);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      // Xóa timeout nếu có
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current);
        autoplayTimeoutRef.current = null;
      }
      
      // Nếu có instance HLS, hủy nó
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      
      // Xóa các event listeners
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('ratechange', handleRateChange);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      
      // Xóa timer hiển thị controls nếu có
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
        controlsTimerRef.current = null;
      }
    };
  }, [src, movieId, episodeSlug]);

  // Xử lý hiển thị thanh điều khiển
  useEffect(() => {
    const video = videoRef.current;
    const playerWrapper = playerWrapperRef.current;
    if (!video || !playerWrapper) return;
    
    // Luôn hiển thị controls thay vì ẩn/hiện khi hover
    setShowControls(true);

    // Tạo lại các hàm xử lý để tránh lỗi reference
    const handleVideoTimeUpdate = () => {
      // Luôn hiển thị controls, không ẩn đi
      setShowControls(true);
    };
    
    const handleVideoPlay = () => {
      // Luôn hiển thị controls, không ẩn đi
      setShowControls(true);
    };
    
    const handleVideoPause = () => {
      // Luôn hiển thị controls, không ẩn đi
      setShowControls(true);
    };
    
    // Đăng ký các sự kiện để theo dõi video
    video.addEventListener('play', handleVideoPlay);
    video.addEventListener('pause', handleVideoPause);
    video.addEventListener('timeupdate', handleVideoTimeUpdate);
    playerWrapper.addEventListener('mousemove', handleMouseMove);
    playerWrapper.addEventListener('touchstart', handleTouchStart);
    
    return () => {
      // Xóa các event listeners khi component unmount
      video.removeEventListener('play', handleVideoPlay);
      video.removeEventListener('pause', handleVideoPause);
      video.removeEventListener('timeupdate', handleVideoTimeUpdate);
      playerWrapper.removeEventListener('mousemove', handleMouseMove);
      playerWrapper.removeEventListener('touchstart', handleTouchStart);
      
      // Xóa timeout nếu có
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
        controlsTimerRef.current = null;
      }
    };
  }, []);

  // Xử lý hiển thị controls
  const handleMouseMove = () => {
    // Không làm gì cả, vì chúng ta luôn hiển thị controls
  };

  // Xử lý sự kiện cảm ứng cho thiết bị di động
  const handleTouchStart = () => {
    setShowControls(true);
    
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }
    
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };
  
  // Xử lý nhấn đúp để toàn màn hình trên thiết bị di động
  const handleVideoTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    
    // Hiển thị controls
    handleTouchStart();
    
    // Kiểm tra nhấn đúp (double tap)
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // 300ms
    
    if (now - lastTapTimeRef.current < DOUBLE_TAP_DELAY) {
      // Nhấn đúp - chuyển chế độ toàn màn hình
      toggleFullScreen();
    } else if (isMobileRef.current) {
      // Nhấn đơn trên thiết bị di động - phát/dừng video
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
      }
    }
    
    lastTapTimeRef.current = now;
  };
  
  // Hàm hiển thị thông báo tua
  const showSeekMessage = (seconds: number, direction: 'forward' | 'backward') => {
    // Xóa timer cũ nếu có
    if (seekMessageTimerRef.current) {
      clearTimeout(seekMessageTimerRef.current);
      seekMessageTimerRef.current = null;
    }
    
    // Hiển thị thông báo mới
    setSeekMessage({
      text: `${Math.abs(seconds)} giây`,
      direction
    });
    
    // Tự động ẩn sau 1.5 giây
    seekMessageTimerRef.current = setTimeout(() => {
      setSeekMessage(null);
      seekMessageTimerRef.current = null;
    }, 1500);
  };
  
  // Hàm tua nhanh
  const seekForward = (seconds: number = 10) => {
    if (videoRef.current) {
      const newTime = Math.min(duration, videoRef.current.currentTime + seconds);
      videoRef.current.currentTime = newTime;
      showSeekMessage(seconds, 'forward');
    }
  };
  
  // Hàm lùi lại
  const seekBackward = (seconds: number = 10) => {
    if (videoRef.current) {
      const newTime = Math.max(0, videoRef.current.currentTime - seconds);
      videoRef.current.currentTime = newTime;
      showSeekMessage(seconds, 'backward');
    }
  };
  
  // Xử lý phím tắt bàn phím
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      
      switch (e.key) {
        case ' ':
        case 'k':
          // Phím Space hoặc K: Phát/Tạm dừng
          e.preventDefault();
          if (isPlaying) {
            videoRef.current.pause();
          } else {
            videoRef.current.play();
          }
          break;
        case 'ArrowRight':
          // Phím mũi tên phải: Tua tới 10s
          e.preventDefault();
          seekForward(10);
          break;
        case 'ArrowLeft':
          // Phím mũi tên trái: Lùi lại 10s
          e.preventDefault();
          seekBackward(10);
          break;
        case 'ArrowUp':
          // Phím mũi tên lên: Tăng âm lượng
          e.preventDefault();
          const newVolumeUp = Math.min(1, videoRef.current.volume + 0.1);
          videoRef.current.volume = newVolumeUp;
          setVolume(Math.round(newVolumeUp * 100));
          break;
        case 'ArrowDown':
          // Phím mũi tên xuống: Giảm âm lượng
          e.preventDefault();
          const newVolumeDown = Math.max(0, videoRef.current.volume - 0.1);
          videoRef.current.volume = newVolumeDown;
          setVolume(Math.round(newVolumeDown * 100));
          break;
        case 'f':
          // Phím F: Toàn màn hình
          e.preventDefault();
          toggleFullScreen();
          break;
        case 'm':
          // Phím M: Tắt/Bật âm thanh
          e.preventDefault();
          if (videoRef.current.volume > 0) {
            videoRef.current.volume = 0;
            setVolume(0);
          } else {
            videoRef.current.volume = 1;
            setVolume(100);
          }
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, duration]);

  // Format time (seconds -> HH:MM:SS or MM:SS)
  const formatTime = (time: number): string => {
    if (!time || isNaN(time)) return "00:00";
    
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  // Xử lý thay đổi tốc độ phát
  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowPlaybackOptions(false);
    }
  };

  // Xử lý chế độ bật đèn
  const toggleLightMode = () => {
    const newLightModeState = !isLightModeOn;
    setIsLightModeOn(newLightModeState);
    localStorage.setItem('myphim-light-mode', newLightModeState.toString());
  };

  return (
    <div 
      ref={playerWrapperRef} 
      className={`relative ${className} ${isFullscreen ? 'fullscreen' : ''}`}
      onMouseMove={handleMouseMove} // Giữ lại để tương thích
      onTouchStart={handleTouchStart} 
      onClick={handleVideoTap}
    >
      {/* Lớp nền sáng khi bật đèn */}
      <div className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-500 ${isLightModeOn ? 'opacity-100' : 'opacity-0'}`}>
        {/* Ánh sáng tập trung ở giữa màn hình */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[60%] h-[60%] rounded-full bg-white/40 blur-3xl"></div>
        </div>
        {/* Lớp nền mờ nhẹ */}
        <div className="absolute inset-0 bg-white/10"></div>
      </div>

      {/* Nút phóng to ở giữa màn hình khi hover */}
      {/* ĐÃ XÓA: Nút fullscreen lớn ở giữa player */}

      {/* Xóa hiệu ứng hover hiện nút fullscreen ở giữa video
          Thay vào đó, khi video pause thì hiện nút play lớn ở giữa */}
      {!isPlaying && !loading && !error && (
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer"
          onClick={() => {
            if (videoRef.current) videoRef.current.play();
          }}
        >
          <div className="bg-blue-600/80 w-24 h-24 rounded-full hover:bg-blue-700/90 transition-colors duration-300 flex items-center justify-center">
            <FontAwesomeIcon icon={faPlay} className="w-10 h-10 text-white" />
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        preload="auto"
        muted={volume === 0}
        poster="/placeholder.jpg"
        crossOrigin="anonymous"
        onContextMenu={(e) => e.preventDefault()} // Chặn menu chuột phải
        onClick={handleVideoTap}
      />
      
      {/* Seek message indicator */}
      {seekMessage && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 text-gray-900 px-4 py-3 rounded-lg flex items-center gap-2 z-30 sm:px-6 sm:py-4 sm:gap-3 shadow-lg">
          {seekMessage.direction === 'backward' ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
          )}
          <span className="text-lg sm:text-2xl font-medium">{seekMessage.text}</span>
        </div>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-30">
          <div className="relative">
            {/* Logo MyPhim */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold text-xl px-2 py-1 rounded">MP</div>
            </div>
            {/* Vòng loading xoay */}
            <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
            {/* Vòng loading phụ */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-red-500/30 border-b-red-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            </div>
            {/* Hiệu ứng ánh sáng */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500/10 to-red-500/10 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <div className="bg-white/90 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className="text-gray-900 text-sm font-medium">Đang tải phim</span>
            </div>
          </div>
        </div>
      )}

      {/* Thông báo video bị tắt tiếng */}
      {isPlaying && volume === 0 && !showControls && (
        <div 
          onClick={() => {
            if (videoRef.current) {
              videoRef.current.muted = false;
              setVolume(100);
              videoRef.current.volume = 1;
            }
          }}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black/70 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg cursor-pointer flex items-center text-xs sm:text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
          Bấm để bật âm thanh
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 text-gray-900 p-4">
          <div className="text-red-500 text-3xl mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 sm:w-12 sm:h-12">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <p className="text-center text-sm sm:text-base">{error}</p>
          <button 
            className="mt-4 px-3 py-1 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm sm:text-base text-white"
            onClick={() => window.location.reload()}
          >
            Tải lại trang
          </button>
        </div>
      )}
      
      {/* Custom controls */}
      {showControls && !error && (
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent z-20">
          {/* Progress bar */}
          <div className="px-4 pt-2">
                          <div 
                className="relative h-1 bg-gray-700/60 rounded-full cursor-pointer overflow-hidden hover:h-2 transition-all duration-200" 
                onClick={(e) => {
                if (videoRef.current) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  videoRef.current.currentTime = pos * duration;
                }
              }}
              onTouchStart={(e) => {
                if (videoRef.current) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const touch = e.touches[0];
                  const pos = (touch.clientX - rect.left) / rect.width;
                  videoRef.current.currentTime = Math.max(0, Math.min(duration, pos * duration));
                }
              }}
              onTouchMove={(e) => {
                if (videoRef.current) {
                  e.preventDefault(); // Ngăn không cho trang cuộn khi kéo thanh tiến trình
                  const rect = e.currentTarget.getBoundingClientRect();
                  const touch = e.touches[0];
                  const pos = (touch.clientX - rect.left) / rect.width;
                  videoRef.current.currentTime = Math.max(0, Math.min(duration, pos * duration));
                }
              }}
            >
              <div 
                className="absolute top-0 left-0 h-full bg-blue-600 rounded-full"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-300 mt-1 px-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          
          {/* Controls */}
          <div className="px-4 py-2 flex justify-between items-center">
            {/* Left controls */}
            <div className="flex items-center space-x-3">
              {/* Rewind 10s */}
              <button 
                className="text-white hover:text-white active:scale-90 transition-transform bg-blue-600/80 hover:bg-blue-700/90 rounded-full w-8 h-8 flex items-center justify-center"
                onClick={() => seekBackward(10)}
                title="Lùi 10 giây"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953l7.108-4.062A1.125 1.125 0 0121 8.688v8.123zM11.25 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953L9.567 7.71a1.125 1.125 0 011.683.977v8.123z" />
                </svg>
              </button>
            
              {/* Play/Pause */}
              <button 
                className="text-white hover:text-white active:scale-90 transition-transform bg-blue-600/80 hover:bg-blue-700/90 rounded-full w-8 h-8 flex items-center justify-center"
                onClick={() => {
                  if (videoRef.current) {
                    if (isPlaying) {
                      videoRef.current.pause();
                    } else {
                      videoRef.current.play();
                    }
                  }
                }}
                title={isPlaying ? "Tạm dừng" : "Phát"}
              >
                {isPlaying ? (
                  <FontAwesomeIcon icon={faPause} className="w-4 h-4" />
                ) : (
                  <FontAwesomeIcon icon={faPlay} className="w-4 h-4" />
                )}
              </button>
              
              {/* Forward 10s */}
              <button 
                className="text-white hover:text-white active:scale-90 transition-transform bg-blue-600/80 hover:bg-blue-700/90 rounded-full w-8 h-8 flex items-center justify-center"
                onClick={() => seekForward(10)}
                title="Tiến 10 giây"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.81V8.688zM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.688z" />
                </svg>
              </button>
            </div>
            
            {/* Right controls */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Light mode toggle */}
              <button 
                className="text-white hover:text-white active:scale-90 transition-transform bg-blue-600/80 hover:bg-blue-700/90 rounded-full w-8 h-8 flex items-center justify-center"
                onClick={toggleLightMode}
                title={isLightModeOn ? "Tắt đèn" : "Bật đèn"}
              >
                {isLightModeOn ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                )}
              </button>
              
              {/* Playback speed */}
              <div className="relative">
                <button 
                  className="text-white hover:text-white active:scale-90 transition-transform bg-blue-600/80 hover:bg-blue-700/90 rounded-full w-8 h-8 flex items-center justify-center"
                  onClick={() => setShowPlaybackOptions(!showPlaybackOptions)}
                  title="Tốc độ phát"
                >
                  <div className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </button>
                
                {showPlaybackOptions && (
                  <div className="absolute bottom-full right-0 bg-zinc-800/90 rounded-md overflow-hidden mb-1 shadow-lg">
                    {playbackRates.map(rate => (
                      <button 
                        key={rate} 
                        onClick={() => changePlaybackRate(rate)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-700/90 ${playbackRate === rate ? 'bg-blue-600 text-white' : 'text-gray-300'}`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Volume */}
              <div className="flex items-center space-x-2">
                <button
                  className="text-white hover:text-white active:scale-90 transition-transform bg-blue-600/80 hover:bg-blue-700/90 rounded-full w-8 h-8 flex items-center justify-center"
                  onClick={() => {
                    if (videoRef.current) {
                      if (volume > 0) {
                        videoRef.current.volume = 0;
                        setVolume(0);
                      } else {
                        videoRef.current.volume = 1;
                        setVolume(100);
                    }
                    }
                  }}
                  title={volume === 0 ? "Bật âm thanh" : "Tắt âm thanh"}
                >
                  {volume === 0 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                  ) : volume < 50 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                  )}
                </button>
                
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => {
                    const newVolume = parseInt(e.target.value);
                    if (videoRef.current) {
                      videoRef.current.volume = newVolume / 100;
                      setVolume(newVolume);
                    }
                  }}
                  className="hidden sm:block w-16 h-1 bg-gray-700/60 rounded appearance-none accent-blue-600"
                />
              </div>
              
              {/* Fullscreen */}
              <button 
                className="text-white hover:text-white active:scale-90 transition-transform bg-blue-600/80 hover:bg-blue-700/90 rounded-full w-8 h-8 flex items-center justify-center"
                onClick={toggleFullScreen}
                title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
              >
                {isFullscreen ? (
                  <FontAwesomeIcon icon={faCompress} className="w-4 h-4" />
                ) : (
                  <FontAwesomeIcon icon={faExpand} className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 