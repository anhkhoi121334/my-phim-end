'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import Image from 'next/image';
import Link from 'next/link';
import { FaUser, FaEnvelope, FaCamera, FaSave, FaSpinner, FaEdit, FaTimes, FaPlay, FaClock } from 'react-icons/fa';

export default function ProfilePage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [image, setImage] = useState('/default-avatar.png');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [watchedMovies, setWatchedMovies] = useState<Array<{
    id?: string;
    movieId: string;
    movie?: {
      name?: string;
      thumb_url?: string;
    };
    viewedAt: string;
  }>>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Hàm xử lý URL hình ảnh
  const getImageUrl = (url: string) => {
    if (!url) return '/placeholder.jpg';
    if (url.startsWith('http')) return url;
    return `https://img.phimapi.com/${url}`;
  };

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || user.name || '');
      setEmail(user.email || '');
      if (user.image && user.image.trim() !== '') {
        setImage(user.image);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, authLoading, router]);

  // Fetch watched movies when user is available
  useEffect(() => {
    if (user && !loadingHistory) {
      fetchWatchedMovies();
    }
  }, [user, loadingHistory]);

  const fetchWatchedMovies = async () => {
    try {
      setLoadingHistory(true);
      const response = await fetch('/api/history?limit=6');
      const data = await response.json();
      
      if (data.success && data.history) {
        setWatchedMovies(data.history);
      }
    } catch (err) {
      console.error('Error fetching watched movies:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setError('Vui lòng nhập họ tên');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi cập nhật thông tin');
      }

      setSuccess('Cập nhật thành công');
      setIsEditing(false);

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-blue-500 text-3xl" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = fullName || 'Người dùng';

  const handleAvatarChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setAvatarUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/users/profile', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Tải ảnh thất bại');
      }
      setImage(data.url);
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tải ảnh thất bại');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarUrlUpdate = async () => {
    if (!avatarUrlInput.trim()) {
      setError('Vui lòng nhập link ảnh');
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: avatarUrlInput.trim() })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Cập nhật ảnh thất bại');
      }
      setImage(avatarUrlInput.trim());
      setAvatarUrlInput('');
      await refreshUser();
      setSuccess('Cập nhật ảnh đại diện thành công');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật ảnh thất bại');
    } finally {
      setIsLoading(false);
    }
  };

    return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] to-[#131b2c] pt-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <div className="relative mb-8">
          {/* Background */}
          <div className="h-48 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10"></div>
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
          </div>
          
          {/* Avatar */}
          <div className="absolute left-8 bottom-0 transform translate-y-1/3">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-[#151f32] shadow-2xl ring-4 ring-blue-500/20">
                <Image
                  src={image}
                  alt={displayName}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  unoptimized={
                    !!image && (
                      image.includes('googleusercontent.com') ||
                      image.includes('fbcdn.net') ||
                      image.includes('scontent.')
                    )
                  }
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/default-avatar.png';
                  }}
                />
              </div>
              <label 
                className="absolute bottom-1 right-1 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-all duration-300 shadow-lg cursor-pointer hover:scale-110"
                title="Đổi ảnh đại diện"
              >
                {avatarUploading ? (
                  <FaSpinner className="animate-spin" size={14} />
                ) : (
                  <FaCamera size={14} />
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
          </div>
          
          {/* User Info */}
          <div className="absolute left-48 md:left-56 bottom-4 text-white">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{displayName}</h1>
            <p className="text-gray-300 text-sm md:text-base">{email}</p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center">
            <FaTimes className="mr-3 text-red-400" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg flex items-center">
            <FaSave className="mr-3 text-green-400" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-1">
            <div className="bg-[#151f32] rounded-2xl p-6 border border-[#1c2940] shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <FaUser className="mr-3 text-blue-400" />
                Thông tin cá nhân
              </h2>
              
              {/* Avatar URL Update */}
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Cập nhật ảnh đại diện bằng link
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={avatarUrlInput}
                    onChange={(e) => setAvatarUrlInput(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 bg-[#1c2940] border border-[#2d3748] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleAvatarUrlUpdate}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                    disabled={isLoading}
                  >
                    Lưu
                  </button>
                </div>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-gray-300 text-sm font-medium mb-2">Họ và tên</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <FaUser />
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#1c2940] border border-[#2d3748] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Nhập họ tên của bạn"
                      />
                    ) : (
                      <div className="w-full pl-10 pr-4 py-3 bg-[#1c2940] border border-[#2d3748] rounded-lg text-gray-300">
                        {fullName}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <FaEnvelope />
                    </div>
                    <div className="w-full pl-10 pr-4 py-3 bg-[#1c2940] border border-[#2d3748] rounded-lg text-gray-300">
                      {email}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Email không thể thay đổi</p>
                </div>

                <div className="flex justify-center">
                  {isEditing ? (
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          if (user) {
                            setFullName(user.fullName || user.name || '');
                          }
                        }}
                        className="px-6 py-2 border border-[#2d3748] rounded-lg hover:bg-[#1c2940] transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-300"
                        disabled={isLoading}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center space-x-2 disabled:opacity-50"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            <span>Đang lưu...</span>
                          </>
                        ) : (
                          <>
                            <FaSave />
                            <span>Lưu thay đổi</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
                    >
                      <FaEdit />
                      <span>Chỉnh sửa thông tin</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Watched Movies */}
          <div className="lg:col-span-2">
            <div className="bg-[#151f32] rounded-2xl p-6 border border-[#1c2940] shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <FaClock className="mr-3 text-blue-400" />
                  Phim đã xem
                </h2>
                <Link 
                  href="/history" 
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  Xem tất cả
                </Link>
              </div>

              {loadingHistory ? (
                <div className="flex justify-center py-12">
                  <FaSpinner className="animate-spin text-blue-400 text-2xl" />
                </div>
              ) : watchedMovies.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {watchedMovies.map((item, index) => (
                    <div key={item.id || index} className="group">
                      <Link href={`/movie/${item.movieId}`}>
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-[#1c2940]">
                          <Image
                            src={getImageUrl(item.movie?.thumb_url || '')}
                            alt={item.movie?.name || 'Movie'}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            unoptimized={item.movie?.thumb_url?.includes('phimimg.com')}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = '/placeholder.jpg';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-blue-500/90 backdrop-blur-sm rounded-full p-3">
                              <FaPlay className="text-white text-lg" />
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <p className="text-white text-xs font-medium truncate group-hover:text-blue-300 transition-colors">
                              {item.movie?.name || 'Phim không tên'}
                            </p>
                            <p className="text-gray-300 text-xs">
                              {new Date(item.viewedAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaClock className="mx-auto text-4xl text-gray-500 mb-4" />
                  <p className="text-gray-400 text-lg mb-2">Bạn chưa xem phim nào</p>
                  <p className="text-gray-500 text-sm mb-6">Hãy khám phá những bộ phim hay trên trang chủ</p>
                  <Link 
                    href="/" 
                    className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Khám phá phim
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 