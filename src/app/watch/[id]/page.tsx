"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import movieApi, { Movie, Episode } from '@/services/api/movieApi';
import HLSPlayer from '@/components/HLSPlayer';
import Loading from '@/components/Loading';

// Hàm decode HTML entities
const decodeHTMLEntities = (text: string): string => {
  if (!text) return '';
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

export default function WatchPage() {
  const { id } = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serverIndex, setServerIndex] = useState(0);
  const [isLightOff, setIsLightOff] = useState(false);

  useEffect(() => {
    if (!id || typeof id !== 'string') {
      setError('Không tìm thấy phim');
      setLoading(false);
      return;
    }

    const fetchMovieData = async () => {
      setLoading(true);
      try {
        const movieDetail = await movieApi.getMovieDetails(id);
        const movieWithDecodedContent = {
          ...movieDetail.movie,
          content: movieDetail.movie.content
            ? decodeHTMLEntities(movieDetail.movie.content)
            : '',
        };
        setMovie(movieWithDecodedContent);

        // Lưu lịch sử xem
        await movieApi.saveWatchHistory(movieDetail.movie._id);

        // Lọc episodes có link hợp lệ
        const validEpisodes = movieDetail.episodes?.[0]?.server_data?.filter(
          ep => ep.link_m3u8 || ep.link_embed
        ) || [];
        setEpisodes(validEpisodes);

        if (validEpisodes.length > 0) {
          setCurrentEpisode(validEpisodes[0]);
        }

      } catch (err) {
        setError('Không thể tải dữ liệu phim');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  const goToEpisode = (index: number) => {
    if (index >= 0 && index < episodes.length) {
      setCurrentEpisode(episodes[index]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentEpisodeIndex = episodes.findIndex(ep => ep.slug === currentEpisode?.slug);
  
  const servers = [
    { name: 'Server #1', source: currentEpisode?.link_m3u8 || currentEpisode?.link_embed },
    { name: 'Server #2', source: currentEpisode?.link_embed || currentEpisode?.link_m3u8 },
  ];

  if (loading) return <Loading />;
  if (error || !movie || !currentEpisode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-xl text-red-500 mb-4">{error || 'Không tìm thấy phim'}</h1>
          <button onClick={() => router.back()} className="px-4 py-2 bg-red-500 text-white rounded">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-900 ${isLightOff ? 'light-off' : ''}`}>
      {/* Player Section */}
      <div className="relative">
        <div className="aspect-video bg-black">
          {servers[serverIndex].source ? (
            <HLSPlayer
              src={servers[serverIndex].source}
              className="w-full h-full"
              movieId={movie._id} 
              episodeSlug={currentEpisode.slug}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              Không tìm thấy nguồn phát, vui lòng thử server khác
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-gray-800 p-4">
          <div className="container mx-auto flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => goToEpisode(currentEpisodeIndex - 1)}
                disabled={currentEpisodeIndex <= 0}
                className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
              >
                Tập trước
              </button>
              
              <button
                onClick={() => goToEpisode(currentEpisodeIndex + 1)}
                disabled={currentEpisodeIndex >= episodes.length - 1}
                className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
              >
                Tập sau
              </button>

              <button
                onClick={() => setIsLightOff(!isLightOff)}
                className="px-4 py-2 bg-gray-700 text-white rounded"
              >
                {isLightOff ? 'Bật đèn' : 'Tắt đèn'}
              </button>
            </div>

            <div className="flex gap-2">
              {servers.map((server, index) => (
                <button
                  key={index}
                  onClick={() => setServerIndex(index)}
                  className={`px-4 py-2 rounded ${
                    index === serverIndex 
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  {server.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto p-4">
        <h1 className="text-xl text-white mb-4">
          {movie.name} - Tập {currentEpisodeIndex + 1}
        </h1>

        {/* Episodes Grid */}
        <div className="mb-8">
          <h3 className="text-white mb-4">Danh sách tập</h3>
          <div className="grid grid-cols-10 gap-2">
            {episodes.map((ep, index) => (
              <button
                key={ep.slug}
                onClick={() => setCurrentEpisode(ep)}
                className={`p-2 rounded ${
                  currentEpisode.slug === ep.slug
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Movie Info */}
        <div className="text-gray-300">
          <h3 className="text-white mb-2">Thông tin phim</h3>
          <p className="mb-4">{movie.content}</p>
          
          {movie.category && (
            <div className="mb-2">
              <span className="text-gray-400">Thể loại: </span>
              {movie.category.map(cat => (
                <Link 
                  key={cat.slug}
                  href={`/the-loai/${cat.slug}`}
                  className="inline-block bg-gray-700 px-2 py-1 rounded text-sm mr-2 hover:bg-gray-600"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .light-off::before {
          content: '';
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.9);
          z-index: 10;
          pointer-events: none;
        }
        
        .light-off .player-wrapper {
          position: relative;
          z-index: 20;
        }
      `}</style>
    </div>
  );
}