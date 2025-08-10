'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks';
import { useSettings } from '@/contexts/SettingsContext';
import { FaSignOutAlt, FaHistory, FaUserCircle } from 'react-icons/fa';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const { settings } = useSettings();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const userMenu = document.getElementById('user-menu');
      if (userMenu && !userMenu.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  const navLinks = [
    { href: '/phim-moi', label: 'Phim Mới' },
    { href: '/phim-le', label: 'Phim Lẻ' },
    { href: '/phim-bo', label: 'Phim Bộ' },
    { href: '/hoat-hinh', label: 'Hoạt Hình' },
    { href: '/phim-chieu-rap', label: 'Chiếu Rạp' },
    { href: '/the-loai', label: 'Thể Loại' },
    { href: '/quoc-gia', label: 'Quốc Gia' },
  ];

  // Get user avatar (or default)
  const userAvatar = user?.image || '/default-avatar.png';
  const isUnoptimizedAvatar = !!userAvatar && (
    userAvatar.includes('googleusercontent.com') ||
    userAvatar.includes('fbcdn.net') ||
    userAvatar.includes('scontent.')
  );

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#0d1117]/95 dark:bg-[#0d1117]/95 bg-white/95 backdrop-blur-md shadow-lg' 
          : ' from-[#0d1117] dark:from-[#0d1117] from-white to-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src={settings?.site?.logo || "/myphim-logo.svg"}
              alt={settings?.site?.name || "MyPhim Logo"}
              width={40}
              height={40}
              className="w-8 h-8 md:w-10 md:h-10"
            />
            <span className="text-xl md:text-2xl font-bold text-white dark:text-white text-gray-900">
              {settings?.site?.name || "MyPhim"}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  pathname === link.href
                    ? 'text-blue-500'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm phim..."
                  className="w-64 px-4 py-2 pl-10 text-sm text-white bg-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/20 transition-all duration-300"
                />
                <svg
                  className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </form>

            {/* User menu */}
            <div className="flex items-center">
              {user ? (
                <div className="relative" id="user-menu">
                  <button 
                    className="flex items-center space-x-2 text-white hover:text-gray-200 focus:outline-none"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-600">
                      <Image
                        src={userAvatar}
                        alt={user.fullName || 'User'}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.onerror = null; // Prevent infinite loop
                          target.src = '/default-avatar.png';
                        }}
                        unoptimized={isUnoptimizedAvatar}
                      />
                    </div>
                    <span className="text-sm font-medium">{user.fullName}</span>
                    <svg 
                      className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#1a2233] rounded-md shadow-lg py-1 z-50">
                      <Link 
                        href="/profile" 
                        className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FaUserCircle className="mr-2" />
                        Tài khoản
                      </Link>
                      <Link 
                        href="/history" 
                        className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FaHistory className="mr-2" />
                        Lịch sử xem
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                      >
                        <FaSignOutAlt className="mr-2" />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
              <Link 
                href="/login" 
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Đăng nhập
              </Link>
              <Link 
                href="/register" 
                className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium ml-2"
              >
                Đăng ký
              </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isMenuOpen ? 'max-h-[500px] pb-4' : 'max-h-0'
          }`}
        >
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm phim..."
                className="w-full px-4 py-2 pl-10 text-sm text-white bg-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/20 transition-all duration-300"
              />
              <svg
                className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </form>

          {/* Mobile Navigation */}
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  pathname === link.href
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 