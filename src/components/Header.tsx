'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { fetchGenres } from '@/services/api/movieApi';
import type { Genre } from '@/services/api/movieApi';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);

  // Xử lý tìm kiếm
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  // Đóng menu khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest('#mobile-menu') && !target.closest('#menu-button')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Xử lý hiệu ứng cuộn trang
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const genreData = await fetchGenres();
        setGenres(genreData);
      } catch (error) {
        console.error('Failed to load genres:', error);
      }
    };

    loadGenres();
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#0d1117]/95 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-[70px]">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative h-10 w-10 mr-3 overflow-hidden">
              <Image 
                src="/file.svg" 
                alt="Logo MyPhim" 
                fill
                className="object-contain transition-transform group-hover:scale-110"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">MyPhim</span>
              <span className="text-xs text-gray-400 hidden sm:inline">Phim hay mỗi ngày</span>
            </div>
          </Link>

          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`text-sm font-medium hover:text-sky-400 transition-all ${pathname === '/' ? 'text-sky-400' : 'text-white'}`}
            >
              Trang chủ
            </Link>
            <div className="relative">
              <button 
                className="text-sm font-medium text-white hover:text-sky-400 transition flex items-center"
                onClick={() => setShowGenreDropdown(!showGenreDropdown)}
              >
                Thể loại
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showGenreDropdown && (
                <div className="absolute left-0 mt-2 w-48 glass-card opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden">
                  <div className="py-1">
                    {genres.map((genre) => (
                      <Link 
                        key={genre._id} 
                        href={`/the-loai/${genre.slug}`}
                        className="block px-4 py-2 text-sm text-white hover:bg-sky-500/20 hover:text-sky-400 transition-all"
                        onClick={() => setShowGenreDropdown(false)}
                      >
                        {genre.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link 
              href="/danh-sach/phim-le" 
              className={`text-sm font-medium hover:text-sky-400 transition-all ${pathname.includes('/danh-sach/phim-le') ? 'text-sky-400' : 'text-white'}`}
            >
              Phim lẻ
            </Link>
            <Link 
              href="/danh-sach/phim-bo" 
              className={`text-sm font-medium hover:text-sky-400 transition-all ${pathname.includes('/danh-sach/phim-bo') ? 'text-sky-400' : 'text-white'}`}
            >
              Phim bộ
            </Link>
            <Link 
              href="/danh-sach/phim-chieu-rap" 
              className={`text-sm font-medium hover:text-sky-400 transition-all ${pathname.includes('/danh-sach/phim-chieu-rap') ? 'text-sky-400' : 'text-white'}`}
            >
              Phim chiếu rạp
            </Link>
            <div className="relative group">
              <button className="text-sm font-medium text-white hover:text-sky-400 transition-all flex items-center">
                Quốc gia
                <svg className="w-4 h-4 ml-1 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-48 glass-card opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden">
                <div className="py-1">
                  <Link href="/quoc-gia/viet-nam" className="block px-4 py-2 text-sm text-white hover:bg-sky-500/20 hover:text-sky-400 transition-all">Việt Nam</Link>
                  <Link href="/quoc-gia/trung-quoc" className="block px-4 py-2 text-sm text-white hover:bg-sky-500/20 hover:text-sky-400 transition-all">Trung Quốc</Link>
                  <Link href="/quoc-gia/han-quoc" className="block px-4 py-2 text-sm text-white hover:bg-sky-500/20 hover:text-sky-400 transition-all">Hàn Quốc</Link>
                  <Link href="/quoc-gia/au-my" className="block px-4 py-2 text-sm text-white hover:bg-sky-500/20 hover:text-sky-400 transition-all">Âu Mỹ</Link>
                  <Link href="/quoc-gia/nhat-ban" className="block px-4 py-2 text-sm text-white hover:bg-sky-500/20 hover:text-sky-400 transition-all">Nhật Bản</Link>
                  <Link href="/quoc-gia/thai-lan" className="block px-4 py-2 text-sm text-white hover:bg-sky-500/20 hover:text-sky-400 transition-all">Thái Lan</Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Tìm kiếm và Đăng nhập */}
          <div className="flex items-center">
            {/* Form tìm kiếm */}
            <form onSubmit={handleSearch} className="relative mr-4">
              <input
                type="text"
                placeholder="Tìm kiếm phim, diễn viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-40 md:w-64 py-2 pl-10 pr-4 rounded-full bg-[#161b22] text-white text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 border border-slate-700 hover:border-slate-600 transition-all"
              />
              <button 
                type="submit" 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-sky-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
            </form>

            {/* Menu người dùng */}
            <div className="hidden md:block">
              <Link href="/login" className="relative overflow-hidden px-6 py-2 group">
                <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform translate-x-0 -translate-y-0 bg-sky-500 group-hover:translate-y-full group-hover:translate-x-full rounded-lg"></span>
                <span className="absolute inset-0 w-full h-full border border-slate-600 group-hover:border-sky-500 rounded-lg"></span>
                <span className="relative text-sm font-medium text-white group-hover:text-sky-500 transition duration-300">
                  Đăng nhập
                </span>
              </Link>
            </div>

            {/* Nút menu di động */}
            <button 
              id="menu-button"
              className="ml-4 md:hidden text-white focus:outline-none"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden py-4 border-t border-gray-800">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex">
              <input
                type="text"
                placeholder="Tìm kiếm phim..."
                className="bg-gray-800 text-white px-4 py-2 rounded-l-md w-full focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="bg-fuchsia-600 text-white px-4 py-2 rounded-r-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>
          <nav className="flex flex-col space-y-3">
            <Link 
              href="/"
              className="text-white hover:text-fuchsia-400 transition py-2"
              onClick={() => setShowMobileMenu(false)}
            >
              Trang chủ
            </Link>
            <button 
              className="text-white hover:text-fuchsia-400 transition py-2 text-left flex justify-between items-center"
              onClick={() => setShowGenreDropdown(!showGenreDropdown)}
            >
              <span>Thể loại</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${showGenreDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showGenreDropdown && (
              <div className="pl-4 grid grid-cols-2 gap-2">
                {genres.map((genre) => (
                  <Link 
                    key={genre._id} 
                    href={`/the-loai/${genre.slug}`}
                    className="text-sm text-gray-300 hover:text-fuchsia-400 py-1"
                    onClick={() => {
                      setShowGenreDropdown(false);
                      setShowMobileMenu(false);
                    }}
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            )}
            <Link 
              href="/phim-le"
              className="text-white hover:text-fuchsia-400 transition py-2"
              onClick={() => setShowMobileMenu(false)}
            >
              Phim lẻ
            </Link>
            <Link 
              href="/phim-bo"
              className="text-white hover:text-fuchsia-400 transition py-2"
              onClick={() => setShowMobileMenu(false)}
            >
              Phim bộ
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
} 