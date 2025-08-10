"use client";
import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import movieApi, { Movie } from '@/services/api/movieApi';
import { 
  FaPlay, 
  FaHome, 
  FaCalendarAlt, 
  FaClock, 
  FaList, 
  FaChevronRight, 
  FaStar, 
  FaEye,
  FaBookmark,
  FaShare,
  FaHeart
} from 'react-icons/fa';

// Xử lý HTML entities
const decodeHTMLEntities = (text: string): string => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

export default function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        setError(null);
        const movieDetails = await movieApi.getMovieDetails(id as string);
        if (movieDetails.status && movieDetails.movie) {
          setMovie(movieDetails.movie);

          // Lấy phim liên quan
          const relatedResponse = await movieApi.getLatestMovies(1, 8);
          if (relatedResponse.status && relatedResponse.items) {
            setRelatedMovies(relatedResponse.items.filter(m => m._id !== movieDetails.movie._id));
          }
        } else {
          setError('Không tìm thấy phim');
        }
      } catch (err) {
        console.error('Error fetching movie data:', err);
        setError('Đã xảy ra lỗi khi tải thông tin phim');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieData();
    }
  }, [id]);

  // Tạo đánh giá ngẫu nhiên (cho mục đích demo) - chỉ tạo một lần
  const randomRating = useMemo(() => (Math.random() * 2 + 7).toFixed(1), []);
  const randomViews = useMemo(() => Math.floor(Math.random() * 10000) + 1000, []);
  
  // Tạo ratings cho phim liên quan - chỉ tạo một lần
  const relatedMovieRatings = useMemo(() => {
    return Array(20).fill(0).map(() => (Math.random() * 2 + 7).toFixed(1));
  }, []);

  // Trạng thái đang tải
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Skeleton Header */}
        <div className="container mx-auto px-4 pt-6">
          <div className="flex items-center text-sm mb-4">
            <div className="w-16 h-4 bg-gray-700 rounded animate-pulse"></div>
            <div className="mx-2 w-2 h-2 bg-gray-700 rounded animate-pulse"></div>
            <div className="w-32 h-4 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
        
        {/* Skeleton Content */}
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column Skeleton */}
            <div className="w-full lg:w-8/12">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Poster Skeleton */}
                <div className="w-full md:w-1/3">
                  <div className="aspect-[2/3] bg-gray-700 rounded-lg animate-pulse"></div>
                </div>
                
                {/* Info Skeleton */}
                <div className="flex-1 space-y-4">
                  <div className="w-3/4 h-8 bg-gray-700 rounded animate-pulse"></div>
                  <div className="w-1/2 h-6 bg-gray-700 rounded animate-pulse"></div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-full h-5 bg-gray-700 rounded animate-pulse"></div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="w-20 h-4 bg-gray-700 rounded animate-pulse"></div>
                    <div className="flex gap-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-16 h-6 bg-gray-700 rounded-full animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Content Skeleton */}
              <div className="mt-8 bg-gray-800 rounded-lg p-6">
                <div className="w-32 h-6 bg-gray-700 rounded animate-pulse mb-4"></div>
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-full h-4 bg-gray-700 rounded animate-pulse"></div>
                  ))}
                  <div className="w-2/3 h-4 bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {/* Right Column Skeleton */}
            <div className="w-full lg:w-4/12">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="w-40 h-6 bg-gray-700 rounded animate-pulse mb-4"></div>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-16 h-24 bg-gray-700 rounded animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="w-full h-4 bg-gray-700 rounded animate-pulse"></div>
                        <div className="w-2/3 h-3 bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Loading indicator */}
        <div className="fixed bottom-8 right-8">
          <div className="flex items-center gap-3 bg-gray-800/90 backdrop-blur-sm px-4 py-3 rounded-full shadow-lg">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-300 text-sm">Đang tải thông tin phim...</span>
          </div>
        </div>
      </div>
    );
  }

  // Trạng thái lỗi
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 text-center border border-gray-700/50 shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Không tìm thấy phim</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">{error}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 font-medium shadow-lg"
            >
              Thử lại
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 transform hover:scale-105 font-medium shadow-lg"
            >
              Trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return null;
  }

  // Xử lý nội dung phim
  const processedContent = movie.content ? decodeHTMLEntities(movie.content) : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      {/* Đường dẫn */}
      <div className="container mx-auto px-4 pt-6">
        <nav className="flex items-center text-sm text-gray-400 mb-6" aria-label="Breadcrumb">
          <Link 
            href="/" 
            className="flex items-center hover:text-blue-400 transition-colors duration-200 group"
          >
            <FaHome className="mr-2 group-hover:scale-110 transition-transform duration-200" />
            <span>Trang chủ</span>
          </Link>
          <FaChevronRight className="mx-3 text-xs text-gray-500" />
          <span className="text-gray-200 font-medium truncate">{movie.name}</span>
        </nav>
      </div>
      
      {/* Phần đầu - Bố cục 2 cột */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cột trái - Thông tin phim */}
          <div className="w-full lg:w-8/12">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Poster phim */}
              <div className="w-full md:w-1/3">
                <div className="relative rounded-xl overflow-hidden shadow-2xl group">
                  <div className="aspect-[2/3] relative">
                    <Image
                      src={movie.poster_url || movie.thumb_url || '/placeholder.jpg'}
                      alt={movie.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    
                    {/* Chất lượng phim */}
                    {movie.quality && (
                      <div className="absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-semibold rounded-lg shadow-lg backdrop-blur-sm">
                        {movie.quality}
                      </div>
                    )}
                    
                    {/* Đánh giá */}
                    <div className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black text-xs font-bold rounded-lg flex items-center shadow-lg">
                      <FaStar className="mr-1.5" />
                      {randomRating}
                    </div>
                    
                    {/* Số tập hiện tại */}
                    {movie.episode_current && (
                      <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-700 text-white text-xs font-semibold rounded-lg shadow-lg backdrop-blur-sm">
                        {movie.episode_current}
                      </div>
                    )}
                    
                    {/* Action buttons overlay */}
                    <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all duration-200">
                        <FaHeart className="text-white text-sm" />
                      </button>
                      <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all duration-200">
                        <FaBookmark className="text-white text-sm" />
                      </button>
                      <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all duration-200">
                        <FaShare className="text-white text-sm" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Nút xem phim */}
                  <Link
                    href={`/watch/${movie.slug}`}
                    className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-all duration-300 group/play"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300 shadow-2xl group-hover/play:shadow-blue-500/25">
                      <FaPlay className="text-white text-2xl ml-1 drop-shadow-lg" />
                    </div>
                  </Link>
                </div>
                
                {/* Nút xem phim (mobile) */}
                <div className="mt-6 md:hidden">
                  <Link
                    href={`/watch/${movie.slug}`}
                    className="block w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-center font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    <FaPlay className="inline mr-2" />
                    Xem phim ngay
                  </Link>
                </div>
              </div>
              
              {/* Thông tin chi tiết */}
              <div className="flex-1">
                <div className="mb-6">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                    {movie.name}
                  </h1>
                  {movie.origin_name && (
                    <p className="text-xl text-gray-300 font-medium">{movie.origin_name}</p>
                  )}
                </div>
                
                {/* Thông tin nhanh */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {movie.year && (
                    <div className="flex items-center p-3 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700/50">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                        <FaCalendarAlt className="text-blue-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Năm sản xuất</p>
                        <p className="text-white font-semibold">{movie.year}</p>
                      </div>
                    </div>
                  )}
                  {movie.time && (
                    <div className="flex items-center p-3 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700/50">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                        <FaClock className="text-green-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Thời lượng</p>
                        <p className="text-white font-semibold">{movie.time}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center p-3 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700/50">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                      <FaEye className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Lượt xem</p>
                      <p className="text-white font-semibold">{randomViews.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700/50">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center mr-3">
                      <FaStar className="text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Đánh giá</p>
                      <p className="text-white font-semibold">{randomRating}/10</p>
                    </div>
                  </div>
                </div>
                
                {/* Thể loại */}
                <div className="mb-6">
                  <h3 className="text-gray-300 font-semibold mb-3 flex items-center">
                    <span className="w-1 h-5 bg-blue-500 rounded-full mr-2"></span>
                    Thể loại
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.category?.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/the-loai/${cat.slug}`}
                        className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-blue-600 hover:to-blue-700 text-gray-300 hover:text-white rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 border border-gray-600 hover:border-blue-500"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
                
                {/* Quốc gia */}
                <div className="mb-8">
                  <h3 className="text-gray-300 font-semibold mb-3 flex items-center">
                    <span className="w-1 h-5 bg-green-500 rounded-full mr-2"></span>
                    Quốc gia
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.country?.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/quoc-gia/${c.slug}`}
                        className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-green-600 hover:to-green-700 text-gray-300 hover:text-white rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 border border-gray-600 hover:border-green-500"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
                
                {/* Nút xem phim (desktop) */}
                <div className="hidden md:flex gap-4 flex-wrap">
                  <Link
                    href={`/watch/${movie.slug}`}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center font-semibold shadow-lg transform hover:scale-105 hover:shadow-blue-500/25"
                  >
                    <FaPlay className="mr-3" />
                    Xem phim ngay
                  </Link>
                  <button
                    className="px-6 py-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center font-medium shadow-lg transform hover:scale-105"
                  >
                    <FaList className="mr-2" />
                    Danh sách tập
                  </button>
                  <button
                    className="px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center font-medium shadow-lg transform hover:scale-105"
                  >
                    <FaHeart className="mr-2" />
                    Yêu thích
                  </button>
                  <button
                    className="px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center font-medium shadow-lg transform hover:scale-105"
                  >
                    <FaBookmark className="mr-2" />
                    Lưu lại
                  </button>
                </div>
              </div>
            </div>
            
            {/* Nội dung phim */}
            <div className="mt-10">
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-4"></div>
                  Nội dung phim
                </h2>
                
                {processedContent ? (
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-200 leading-relaxed text-lg font-light">
                      {processedContent}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 italic text-lg">Chưa có thông tin chi tiết về phim này.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Cột phải - Phim liên quan */}
          <div className="w-full lg:w-4/12">
            <div className="bg-gray-800 rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-white mb-4 border-l-4 border-blue-500 pl-3">
                Có thể bạn cũng thích
              </h2>
              
              <div className="space-y-4">
                {relatedMovies.slice(0, 5).map((movie, index) => (
                  <Link key={`sidebar-${movie._id}`} href={`/movie/${movie.slug}`} className="group block">
                    <div className="flex gap-3 items-center p-2 rounded-lg hover:bg-gray-700/30 transition-colors">
                      <div className="w-16 h-24 relative rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={movie.thumb_url || movie.poster_url}
                          alt={movie.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-110"
                        />
                        {movie.episode_current && (
                          <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-xs font-medium text-center py-0.5">
                            {movie.episode_current}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white group-hover:text-blue-400 transition-colors line-clamp-2 text-sm font-medium">
                          {movie.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                          <span>{movie.year}</span>
                          <div className="flex items-center">
                            <FaStar className="text-yellow-500 mr-1" />
                            <span>{relatedMovieRatings[index]}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              {/* Nút xem thêm */}
              <div className="mt-6 text-center">
                <Link
                  href="/phim-moi"
                  className="inline-block px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors text-sm"
                >
                  Xem thêm phim khác
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Phim đề xuất khác - Hiển thị dạng lưới */}
      <div className="container mx-auto px-4 py-10">
        <h2 className="text-xl font-bold text-white mb-6 border-l-4 border-blue-500 pl-3">
          Phim đề xuất khác
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {relatedMovies.slice(0, 6).map((movie, index) => (
            <Link key={`grid-${movie._id}`} href={`/movie/${movie.slug}`} className="group">
              <div className="rounded-lg overflow-hidden bg-gray-800 h-full">
                <div className="relative aspect-[2/3]">
                  <Image
                    src={movie.thumb_url || movie.poster_url}
                    alt={movie.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  
                  {/* Nút play khi hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-blue-600/80 flex items-center justify-center">
                      <FaPlay className="text-white text-sm ml-1" />
                    </div>
                  </div>
                  
                  {/* Chất lượng phim */}
                  {movie.quality && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded">
                      {movie.quality}
                    </div>
                  )}
                  
                  {/* Số tập hiện tại */}
                  {movie.episode_current && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-green-600 text-white text-xs font-medium rounded">
                      {movie.episode_current}
                    </div>
                  )}
                </div>
                
                <div className="p-3">
                  <h3 className="text-white group-hover:text-blue-400 transition-colors line-clamp-2 text-sm font-medium">
                    {movie.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span>{movie.year}</span>
                    <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                    <div className="flex items-center">
                      <FaStar className="text-yellow-500 mr-1" />
                      <span>{relatedMovieRatings[index]}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 