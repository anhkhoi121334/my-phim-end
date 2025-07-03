'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import movieApi, { Movie, Episode as ApiEpisode } from '@/services/api/movieApi';
import { useParams } from 'next/navigation';
import MovieCard from '@/components/MovieCard';

interface Episode extends ApiEpisode {
  id?: string;
}

interface MovieDetailProps {
  params: {
    id: string;
  };
}

export default function MovieDetail({ params }: MovieDetailProps) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  
  const routeParams = useParams();
  const slug = routeParams.id as string;
  
  useEffect(() => {
    const fetchMovieDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await movieApi.getMovieDetails(slug);
        if (!data.status) {
          setError(data.msg || 'Không tìm thấy thông tin phim.');
          setIsLoading(false);
          return;
        }
        
        const movieData = data.movie;
        const processedData = {
          ...movieData,
          category: Array.isArray(movieData.category) ? movieData.category : [],
          country: Array.isArray(movieData.country) ? movieData.country : []
        };
        setMovie(processedData);
        
        console.log('API response episodes:', JSON.stringify(data.episodes));
        
        // Handle episodes data
        if (data.episodes && data.episodes.length > 0) {
          console.log('Episodes servers available:', data.episodes.map(s => s.server_name));
          
                    if (data.episodes[0].server_data && data.episodes[0].server_data.length > 0) {
            // Use episodes directly from API response
            console.log('Using API episodes from server:', data.episodes[0].server_name);
            setEpisodes(data.episodes[0].server_data);
          }
        } else if (movieData.episode_current && parseInt(movieData.episode_current)) {
          // Fallback: Create fake episodes based on episode_current if no episodes in API response
          console.log('No API episodes, creating from episode_current:', movieData.episode_current);
          const fakeEpisodes = Array.from(
            { length: parseInt(movieData.episode_current) }, 
            (_, i) => ({
              id: `${i+1}`,
              name: `Tập ${i < 9 ? '0' : ''}${i+1}`,
              slug: `tap-${i < 9 ? '0' : ''}${i+1}`,
              filename: '',
              link_embed: '',
              link_m3u8: ''
            })
          );
          setEpisodes(fakeEpisodes);
        } else {
          // Default to at least one episode for any movie
          console.log('No episodes data and no episode_current, creating default episode');
          const fakeEpisodes = [{
            id: "1",
            name: "Tập 01",
            slug: "tap-01",
            filename: movieData.slug || '',
            link_embed: movieData.slug ? `https://player.phimapi.com/${movieData.slug}` : '',
            link_m3u8: ''
          }];
          setEpisodes(fakeEpisodes);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching movie detail:', err);
        setError('Không thể tải thông tin phim. Vui lòng thử lại sau.');
        setIsLoading(false);
      }
    };
    
    fetchMovieDetail();
  }, [slug]);
  
  // Debug useEffect to monitor episodes state
  useEffect(() => {
    console.log('Episodes state changed:', episodes);
  }, [episodes]);
  
  // Always ensure we have episodes to display
  useEffect(() => {
    // Force display of episodes even if none available
    if (episodes.length === 0 && movie) {
      console.log('Forcing display of default episodes for', movie.name);
      const defaultEpisodes = [
        {
          id: "1",
          name: "Tập 01",
          slug: "tap-01",
          filename: movie.slug || '',
          link_embed: `https://player.phimapi.com/${movie.slug}?ep=1`,
          link_m3u8: ''
        },
        {
          id: "2",
          name: "Tập 02",
          slug: "tap-02",
          filename: movie.slug || '',
          link_embed: `https://player.phimapi.com/${movie.slug}?ep=2`,
          link_m3u8: ''
        },
        {
          id: "3",
          name: "Tập 03",
          slug: "tap-03", 
          filename: movie.slug || '',
          link_embed: `https://player.phimapi.com/${movie.slug}?ep=3`,
          link_m3u8: ''
        }
      ];
      setEpisodes(defaultEpisodes);
    }
  }, [movie, episodes]);
  
  // Hàm xử lý URL hình ảnh
  const getImageUrl = (url: string) => {
    if (!url) return '/placeholder.jpg';
    if (url.startsWith('http')) return url;
    return `https://img.phimapi.com/${url}`;
  };

  // Format broadcast date nicely
  const formatBroadcastDate = () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  // Add a helper function to determine badge color and text
  const getQualityBadge = (quality: string | undefined) => {
    if (!quality) return { text: "FHD", color: "bg-blue-600" };
    
    const qualityLower = quality.toLowerCase();
    if (qualityLower.includes('cam') || qualityLower === 'cam') {
      return { text: "CAM", color: "bg-red-600" };
    } else if (qualityLower === 'hd') {
      return { text: "FHD", color: "bg-blue-600" };
    } else {
      return { text: quality, color: "bg-blue-600" };
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101720] p-4">
        <div className="text-center">
          <div className="inline-block h-14 w-14 animate-spin rounded-full border-4 border-solid border-yellow-500 border-r-transparent align-[-0.125em]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
          <p className="mt-5 text-xl text-gray-300 font-medium">Đang tải thông tin phim...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101720] p-4">
        <div className="text-center max-w-md mx-auto bg-gray-900/90 p-10 rounded-2xl backdrop-blur-sm shadow-2xl border border-gray-800">
          <svg className="w-20 h-20 text-red-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-2xl text-red-400 mb-6 font-medium">{error}</p>
          <button 
            className="mt-4 bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-4 rounded-xl hover:from-red-500 hover:to-red-400 transition duration-300 transform hover:scale-105 shadow-lg font-medium text-lg"
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
      <div className="min-h-screen flex items-center justify-center bg-[#101720] p-4">
        <div className="text-center max-w-md mx-auto bg-gray-900/90 p-10 rounded-2xl backdrop-blur-sm shadow-2xl border border-gray-800">
          <svg className="w-20 h-20 text-yellow-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-2xl text-gray-300 mb-6 font-medium">Không tìm thấy thông tin phim.</p>
          <Link href="/" className="mt-4 inline-block bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-xl hover:from-blue-500 hover:to-blue-400 transition duration-300 transform hover:scale-105 shadow-lg font-medium text-lg">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }
  
  // Determine if movie is series or single movie
  // Determine if movie has multiple episodes
  const isSeries = episodes.length > 1;
  const latestEpisode = movie.episode_current || episodes.length.toString();
  
  return (
    <div className="bg-[#101720] min-h-screen text-gray-100 pb-20 page-transition">
      {/* Movie Header Section with Backdrop */}
      <div className="relative w-full h-[70vh] md:h-[80vh]">
        <Image 
          src={getImageUrl(movie.thumb_url)} 
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101720] via-[#101720]/90 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-6 z-10">
          <div className="container mx-auto flex flex-col md:flex-row gap-8">
            {/* Movie Poster */}
            <div className="w-48 h-72 md:w-64 md:h-96 relative flex-shrink-0">
              <Image
                src={getImageUrl(movie.poster_url)}
                alt={movie.name}
                fill
                className="object-cover rounded-md"
                priority
              />
            </div>
            
            {/* Movie Title and Quick Info */}
            <div className="flex flex-col justify-end">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {movie.name}
              </h1>
              <h2 className="text-xl text-gray-400 mb-4">
                {movie.origin_name}
              </h2>
              
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {movie.quality && (
                  <span className={`px-3 py-1 ${getQualityBadge(movie.quality).color} text-white text-sm font-medium rounded-sm`}>
                    {getQualityBadge(movie.quality).text}
                  </span>
                )}
                <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-sm">
                  {movie.lang || "Vietsub"}
                </span>
                <span className="px-3 py-1 bg-gray-700 text-white text-sm font-medium rounded-sm">
                  {movie.year || '2023'}
                </span>
                <span className="px-3 py-1 bg-gray-700 text-white text-sm font-medium rounded-sm">
                  {movie.time ? `${movie.time} phút` : '125 phút'}
                </span>
              </div>
              
              <div className="flex items-center gap-4 mt-5">
                <Link 
                  href={isSeries ? `#episodes` : `/watch/${movie.slug}`}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-700 transition duration-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                  </svg>
                  Xem Ngay
                </Link>
                
                <button className="flex items-center gap-2 bg-gray-700/50 hover:bg-gray-700 text-white px-4 py-3 rounded-md transition duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z"></path>
                  </svg>
                  Yêu thích
                </button>
                
                <button className="flex items-center gap-2 bg-gray-700/50 hover:bg-gray-700 text-white px-4 py-3 rounded-md transition duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"></path>
                  </svg>
                  Chia sẻ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content Container */}
      <div className="container mx-auto px-4 mt-8">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 mb-6">
          <button 
            onClick={() => setActiveTab('info')} 
            className={`px-6 py-3 font-medium ${activeTab === 'info' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
          >
            Tập phim
          </button>
          <button 
            onClick={() => setActiveTab('gallery')} 
            className={`px-6 py-3 font-medium ${activeTab === 'gallery' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
          >
            Gallery
          </button>
          <button 
            onClick={() => setActiveTab('cast')} 
            className={`px-6 py-3 font-medium ${activeTab === 'cast' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
          >
            Diễn viên
          </button>
          <button 
            onClick={() => setActiveTab('review')} 
            className={`px-6 py-3 font-medium ${activeTab === 'review' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
          >
            Đề xuất
          </button>
        </div>
        
        {/* Episode Alert - Only show in info tab */}
        {activeTab === 'info' && isSeries && (
          <div className="mb-8 bg-blue-900/30 rounded-md p-4 flex items-center" id="episodes">
            <div className="bg-blue-500 rounded-full p-1 mr-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z"></path>
              </svg>
            </div>
            <span>
              Tập {latestEpisode} sẽ phát sóng {movie.time || 24} phút/tập ngày {formatBroadcastDate()}. Các bạn nhớ đón xem nhé 🎬
            </span>
          </div>
        )}
        
        {/* Episodes Grid - Always show episodes */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">
            {/* Episode count display */}
            <div className="col-span-full text-sm text-blue-500 mb-2">
              {episodes.length === 0 ? 'Không tìm thấy tập phim - hiển thị mặc định' : `Tìm thấy ${episodes.length} tập phim`}
            </div>
            
            {/* If we have episodes, display them, otherwise show at least one episode */}
            {episodes.length > 0 ? (
              episodes.map((episode) => (
                <Link 
                  href={`/watch/${movie.slug}?ep=${episode.slug}`}
                  key={episode.slug || episode.name} 
                  className="bg-gray-800/50 rounded-md py-3 text-center hover:bg-blue-900/50 transition duration-300"
                >
                  {episode.name}
                </Link>
              ))
            ) : (
              // Default episode if none found
              <Link 
                href={`/watch/${movie.slug}?ep=tap-01`}
                className="bg-gray-800/50 rounded-md py-3 text-center hover:bg-blue-900/50 transition duration-300"
              >
                Tập 01
              </Link>
            )}
          </div>
        )}
        
        {/* Gallery Content */}
        {activeTab === 'gallery' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
            {[1, 2, 3, 4, 5, 6, 8].map((index) => (
              <div key={index} className="relative aspect-video rounded-md overflow-hidden cursor-pointer group">
                <Image 
                  src={getImageUrl(movie.thumb_url)}
                  alt={`${movie.name} - Gallery ${index}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Cast Content */}
        {activeTab === 'cast' && (
          <div className="mb-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[
                { name: 'Cho Yi-hyun', role: 'Vai chính' },
                { name: 'Choo Young-woo', role: 'Vai chính' },
                { name: 'Cha Kang-yoon', role: 'Vai phụ' },
                { name: 'Choo Ja-hyun', role: 'Vai phụ' }
              ].map((actor, index) => (
                <div key={index} className="text-center">
                  <div className="relative w-full aspect-square rounded-full overflow-hidden mb-3 mx-auto border-2 border-gray-700">
                    <Image 
                      src="/placeholder.jpg"
                      alt={actor.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h4 className="font-medium text-white">{actor.name}</h4>
                  <p className="text-sm text-gray-400">{actor.role}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Recommended Movies */}
        {activeTab === 'review' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mb-10">
            {/* Create sample movie objects for demonstration */}
            {[...Array(10)].map((_, index) => {
              const demoMovie: Movie = {
                _id: `demo-${index}`,
                name: `Bí Kíp Luyện Rồng ${index + 1}`,
                origin_name: `How To Train Your Dragon ${index + 1}`,
                slug: 'bi-kip-luyen-rong',
                year: 2025,
                thumb_url: '/placeholder.jpg',
                poster_url: '/placeholder.jpg',
                quality: index % 3 === 0 ? 'CAM' : 'HD',
                lang: 'Vietsub',
                time: '125',
                episode_current: '1',
                episode_total: '1',
                content: 'Phim đề xuất hay',
                category: [],
                country: []
              };
              
              return <MovieCard key={index} movie={demoMovie} />;
            })}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Movie Info */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-[#171F2A]/70 rounded-md overflow-hidden mb-6">
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-4">Giới thiệu:</h3>
                <p className="text-gray-300 mb-4">
                  {movie.content || "Đang cập nhật nội dung phim. Vui lòng quay lại sau."}
                </p>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col">
                    <span className="text-gray-500">Thời lượng:</span>
                    <span className="text-white">{movie.time || '100'} phút</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-gray-500">Quốc gia:</span>
                    <span className="text-white">
                      {movie.country && movie.country.length > 0
                        ? movie.country.map(c => c.name).join(', ')
                        : 'Đang cập nhật'}
                    </span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-gray-500">Networks:</span>
                    <span className="text-white">tvN</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-gray-500">Sản xuất:</span>
                    <span className="text-white">Netflix</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Top Movies This Week */}
            <div className="bg-[#171F2A]/70 rounded-md overflow-hidden">
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                  </svg>
                  Top phim tuần này
                </h3>
                
                <div className="space-y-4">
                  {[1, 2, 3].map((num) => (
                    <div key={num} className="flex gap-3 items-center">
                      <div className="text-4xl font-bold text-gray-700">{num}</div>
                      <div className="w-16 h-24 relative flex-shrink-0 rounded overflow-hidden">
                        <Image
                          src="/placeholder.jpg"
                          alt="Top movie"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">Phim Hấp Dẫn {num}</h4>
                        <p className="text-sm text-gray-400">Thể loại phim</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Comments */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-[#171F2A]/70 rounded-md overflow-hidden">
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd"></path>
                  </svg>
                  Bình luận (24)
                </h3>
                
                <div className="mb-6">
                  <textarea 
                    placeholder="Viết bình luận..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 text-white resize-none focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    rows={4}
                  ></textarea>
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm text-gray-400">0 / 1000</div>
                    <button className="bg-yellow-500 text-black px-4 py-2 rounded-md font-medium hover:bg-yellow-600 transition duration-300">
                      Gửi
                    </button>
                  </div>
                </div>
                
                {/* Sample Comments */}
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-10 h-10 relative rounded-full overflow-hidden flex-shrink-0">
                        <Image 
                          src="/placeholder.jpg" 
                          alt="User avatar" 
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Người dùng {i}</span>
                          <span className="text-xs text-gray-400">12 giờ trước</span>
                        </div>
                        <p className="mt-1 text-gray-300">
                          Bộ phim này rất hay, tôi đánh giá cao diễn xuất của các diễn viên!
                        </p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-400">
                          <button className="flex items-center gap-1 hover:text-gray-300 transition">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path>
                            </svg>
                            Thích
                          </button>
                          <button className="flex items-center gap-1 hover:text-gray-300 transition">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z"></path>
                            </svg>
                            Dislike
                          </button>
                          <button className="hover:text-gray-300 transition">Trả lời</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 