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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-2xl border-b border-gray-200/50' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-[70px]">
          {/* Enhanced Logo with Animation */}
          <Link href="/" className="flex items-center group">
            <div className="relative h-12 w-12 mr-3 overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 p-1 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-full h-full bg-white rounded-lg flex items-center justify-center">
                <Image 
                  src="/myphim-logo.svg" 
                  alt="Logo MyPhim" 
                  width={32}
                  height={32}
                  className="object-contain transition-transform group-hover:scale-110"
                />
              </div>
              {/* Animated glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-blue-600 transition-all duration-300">
                My<span className="text-gradient-primary">Phim</span>
              </span>
              <span className="text-xs text-gray-500 hidden sm:inline font-medium group-hover:text-blue-500 transition-colors duration-300">Phim hay mỗi ngày</span>
            </div>
          </Link>

          {/* Enhanced Desktop Navigation with Hover Effects */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link 
              href="/" 
              className={`nav-link group relative ${pathname === '/' ? 'active' : ''}`}
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                <span>Trang chủ</span>
              </div>
            </Link>
            <Link 
              href="/the-loai" 
              className={`nav-link group relative ${pathname.includes('/the-loai') ? 'active' : ''}`}
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2"/>
                </svg>
                <span>Thể loại</span>
              </div>
            </Link>
            <Link 
              href="/quoc-gia" 
              className={`nav-link group relative ${pathname.includes('/quoc-gia') ? 'active' : ''}`}
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Quốc gia</span>
              </div>
            </Link>
            <Link 
              href="/phim-le" 
              className={`nav-link group relative ${pathname.includes('/phim-le') ? 'active' : ''}`}
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Phim lẻ</span>
              </div>
            </Link>
            <Link 
              href="/phim-bo" 
              className={`nav-link group relative ${pathname.includes('/phim-bo') ? 'active' : ''}`}
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
                <span>Phim bộ</span>
              </div>
            </Link>
            <Link 
              href="/phim-chieu-rap" 
              className={`nav-link group relative ${pathname.includes('/phim-chieu-rap') ? 'active' : ''}`}
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2"/>
                </svg>
                <span>Chiếu rạp</span>
              </div>
            </Link>
          </nav>

          {/* Enhanced Search and User Actions */}
          <div className="flex items-center gap-4">
            {/* Enhanced Search Form with Better Styling */}
            <div id="search-container" className="relative">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Tìm kiếm phim, diễn viên..."
                    value={searchInput}
                    onChange={handleSearchInputChange}
                    onFocus={() => searchHistory.length > 0 && setShowSearchHistory(true)}
                    className="w-48 lg:w-64 py-2.5 pl-11 pr-4 rounded-xl bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border border-gray-200/50 hover:border-blue-500/50 transition-all duration-300 shadow-lg group-hover:shadow-xl"
                  />
                  <button 
                    type="submit" 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-300"
                  >
                    <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </button>
                </div>
              </form>
              
              {/* Enhanced Search History Dropdown with Animation */}
              {showSearchHistory && Array.isArray(searchHistory) && searchHistory.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 w-full bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-2xl z-50 animate-fade-in">
                  <ul className="rounded-xl overflow-hidden">
                    {searchHistory.slice(0, 5).map((item, index) => (
                      <li
                        key={index}
                        className="px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer flex items-center text-sm transition-all duration-300 text-gray-700 border-b border-gray-100/50 last:border-b-0 group"
                        onClick={() => {
                          if (item) {
                            handleHistoryItemClick(item);
                            setShowSearchHistory(false);
                          }
                        }}
                      >
                        <svg className="w-4 h-4 mr-3 text-blue-500 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span className="group-hover:text-blue-600 transition-colors duration-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Enhanced Mobile Menu Button */}
            <button
              id="menu-button"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Menu with Animation */}
        {showMobileMenu && (
          <div 
            id="mobile-menu"
            className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl animate-slide-down"
          >
            <nav className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-1 gap-4">
                <Link 
                  href="/" 
                  className={`mobile-nav-link ${pathname === '/' ? 'active' : ''}`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                  </svg>
                  Trang chủ
                </Link>
                <Link 
                  href="/the-loai" 
                  className={`mobile-nav-link ${pathname.includes('/the-loai') ? 'active' : ''}`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2"/>
                  </svg>
                  Thể loại
                </Link>
                <Link 
                  href="/quoc-gia" 
                  className={`mobile-nav-link ${pathname.includes('/quoc-gia') ? 'active' : ''}`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Quốc gia
                </Link>
                <Link 
                  href="/phim-le" 
                  className={`mobile-nav-link ${pathname.includes('/phim-le') ? 'active' : ''}`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Phim lẻ
                </Link>
                <Link 
                  href="/phim-bo" 
                  className={`mobile-nav-link ${pathname.includes('/phim-bo') ? 'active' : ''}`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                  </svg>
                  Phim bộ
                </Link>
                <Link 
                  href="/phim-chieu-rap" 
                  className={`mobile-nav-link ${pathname.includes('/phim-chieu-rap') ? 'active' : ''}`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2"/>
                  </svg>
                  Chiếu rạp
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 