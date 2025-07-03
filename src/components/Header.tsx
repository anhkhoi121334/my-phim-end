'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useSearch } from '@/hooks';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Get search functionality from our custom hook
  const {
    searchInput,
    setSearchInput,
    handleSubmit: handleSearchSubmit,
    searchHistory,
    handleHistoryItemClick,
  } = useSearch();
  
  // Show/hide search history dropdown
  const [showSearchHistory, setShowSearchHistory] = useState(false);

  // Handle form submission
  const handleSearch = (e: React.FormEvent) => {
    if (e) {
      handleSearchSubmit(e);
      setShowSearchHistory(false);
      setShowMobileMenu(false);
    }
  };

  // Handle input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e && e.target) {
      setSearchInput(e.target.value || '');
    }
  };

  // Đóng menu khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest('#mobile-menu') && !target.closest('#menu-button')) {
        setIsMenuOpen(false);
      }
      
      // Also close search history dropdown when clicking outside
      if (showSearchHistory && !target.closest('#search-container')) {
        setShowSearchHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen, showSearchHistory]);

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

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#0a0e1a]/95 backdrop-blur-md shadow-lg border-b border-blue-500/20' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-[70px]">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative h-10 w-10 mr-3 overflow-hidden">
              <Image 
                src="/myphim-logo.svg" 
                alt="Logo MyPhim" 
                fill
                className="object-contain transition-transform group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">
                My<span className="text-blue-500">Phim</span>
              </span>
              <span className="text-xs text-gray-400 hidden sm:inline">Phim hay mỗi ngày</span>
            </div>
          </Link>

          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`nav-link ${pathname === '/' ? 'active' : ''}`}
            >
              Trang chủ
            </Link>
            <Link 
              href="/the-loai" 
              className={`nav-link ${pathname.includes('/the-loai') ? 'active' : ''}`}
            >
              Thể loại
            </Link>
            <Link 
              href="/quoc-gia" 
              className={`nav-link ${pathname.includes('/quoc-gia') ? 'active' : ''}`}
            >
              Quốc gia
            </Link>
            <Link 
              href="/phim-le" 
              className={`nav-link ${pathname.includes('/phim-le') ? 'active' : ''}`}
            >
              Phim lẻ
            </Link>
            <Link 
              href="/phim-bo" 
              className={`nav-link ${pathname.includes('/phim-bo') ? 'active' : ''}`}
            >
              Phim bộ
            </Link>
            <Link 
              href="/phim-chieu-rap" 
              className={`nav-link ${pathname.includes('/phim-chieu-rap') ? 'active' : ''}`}
            >
              Phim chiếu rạp
            </Link>
          </nav>

          {/* Tìm kiếm và Đăng nhập */}
          <div className="flex items-center">
            {/* Form tìm kiếm */}
            <div id="search-container" className="relative mr-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm phim, diễn viên..."
                  value={searchInput}
                  onChange={handleSearchInputChange}
                  onFocus={() => searchHistory.length > 0 && setShowSearchHistory(true)}
                  className="w-40 md:w-64 py-2 pl-10 pr-4 rounded-full bg-[#131b2c] text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-blue-800 hover:border-blue-500 transition-all shadow-inner"
                />
                <button 
                  type="submit" 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </button>
              </form>
              
              {/* Search history dropdown */}
              {showSearchHistory && Array.isArray(searchHistory) && searchHistory.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 w-full bg-[#0a0e1a] border border-blue-500/20 rounded-lg shadow-lg z-50 backdrop-blur-md">
                  <ul className="rounded-lg overflow-hidden">
                    {searchHistory.slice(0, 5).map((item, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 hover:bg-blue-500/20 cursor-pointer flex items-center text-sm transition-colors"
                        onClick={() => {
                          if (item) {
                            handleHistoryItemClick(item);
                            setShowSearchHistory(false);
                          }
                        }}
                      >
                        <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span className="truncate">{item}</span>
                      </li>
                    ))}
                    <li className="border-t border-blue-800/30">
                      <Link
                        href="/search"
                        onClick={() => setShowSearchHistory(false)}
                        className="block px-4 py-2 text-sm text-blue-400 hover:bg-blue-500/20 transition-colors"
                      >
                        Xem tất cả kết quả tìm kiếm
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Menu người dùng */}
            <div className="hidden md:block">
              <Link href="/login" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-medium px-6 py-2 rounded-md transition-colors shadow-md hover:shadow-lg">
                Đăng nhập
              </Link>
            </div>

            {/* Mobile menu button */}
            <button 
              id="menu-button"
              className="md:hidden flex items-center text-white focus:outline-none" 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Menu"
            >
              <div className="relative w-6 h-6 transform transition-all duration-300">
                <span className={`absolute h-0.5 w-6 bg-white rounded-full transform transition-all duration-300 ${showMobileMenu ? 'rotate-45 translate-y-2.5' : ''}`}
                      style={{ top: '0px' }}></span>
                <span className={`absolute h-0.5 w-6 bg-white rounded-full transform transition-all duration-300 ${showMobileMenu ? 'opacity-0' : ''}`}
                      style={{ top: '8px' }}></span>
                <span className={`absolute h-0.5 w-6 bg-white rounded-full transform transition-all duration-300 ${showMobileMenu ? '-rotate-45 -translate-y-2.5' : ''}`}
                      style={{ top: '16px' }}></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Simplified dropdown style */}
      {showMobileMenu && (
        <div className="md:hidden absolute top-[70px] left-0 right-0 bg-[#0a0e1a]/95 backdrop-blur-md border-b border-blue-500/20 shadow-lg z-40">
          <div className="px-4 py-2">
            <nav>
              <ul className="space-y-1">
                <li>
                  <Link 
                    href="/" 
                    className={`flex items-center py-2 px-3 rounded-md ${pathname === '/' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-blue-500/20 hover:text-white'} transition-all duration-200`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                    <span>Trang chủ</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/the-loai"
                    className={`flex items-center py-2 px-3 rounded-md ${pathname.includes('/the-loai') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-blue-500/20 hover:text-white'} transition-all duration-200`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
                    </svg>
                    <span>Thể loại</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/quoc-gia"
                    className={`flex items-center py-2 px-3 rounded-md ${pathname.includes('/quoc-gia') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-blue-500/20 hover:text-white'} transition-all duration-200`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                    <span>Quốc gia</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/phim-le"
                    className={`flex items-center py-2 px-3 rounded-md ${pathname.includes('/phim-le') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-blue-500/20 hover:text-white'} transition-all duration-200`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path>
                    </svg>
                    <span>Phim lẻ</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/phim-bo"
                    className={`flex items-center py-2 px-3 rounded-md ${pathname.includes('/phim-bo') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-blue-500/20 hover:text-white'} transition-all duration-200`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path>
                    </svg>
                    <span>Phim bộ</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/phim-chieu-rap"
                    className={`flex items-center py-2 px-3 rounded-md ${pathname.includes('/phim-chieu-rap') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-blue-500/20 hover:text-white'} transition-all duration-200`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h18M3 12h18M3 16h18M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path>
                    </svg>
                    <span>Phim chiếu rạp</span>
                  </Link>
                </li>
                <li className="border-t border-blue-800/30 pt-2 mt-2">
                  <Link 
                    href="/login" 
                    className="flex items-center justify-center py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                    </svg>
                    <span>Đăng nhập</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
} 