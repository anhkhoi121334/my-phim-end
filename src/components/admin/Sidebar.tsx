'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useAuth } from '@/hooks';
import { FaUsers, FaFilm, FaList, FaCog, FaTachometerAlt, FaSignOutAlt } from 'react-icons/fa';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const navigationItems = [
    { name: 'Dashboard', href: '/admin', icon: <FaTachometerAlt /> },
    { name: 'Users', href: '/admin/users', icon: <FaUsers /> },
    { name: 'Movies', href: '/admin/movies', icon: <FaFilm /> },
    { name: 'Categories', href: '/admin/categories', icon: <FaList /> },
    { name: 'Settings', href: '/admin/settings', icon: <FaCog /> },
  ];

  const handleLogout = async () => {
    // 尝试使用 NextAuth 登出
    await signOut({ redirect: false });
    
    // 同时调用自定义登出API
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('登出错误:', error);
    }
    
    // 重定向到首页
    window.location.href = '/';
  };

  return (
    <>
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-zinc-800 shadow-md p-4 flex justify-between items-center">
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 rounded-md bg-zinc-700 hover:bg-zinc-600 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileSidebarOpen ? (
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
        <span className="text-xl font-bold">MyPhim Admin</span>
        <div className="w-8"></div> {/* Spacer for balance */}
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 z-20 transition-transform duration-300 lg:static lg:inset-auto lg:translate-x-0 w-64 bg-zinc-800 shadow-lg overflow-y-auto`}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-3">
            <Image
              src="/myphim-logo.svg"
              alt="MyPhim Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="text-xl font-bold">MyPhim Admin</span>
          </div>

          {/* Admin info */}
          <div className="flex items-center space-x-3 pb-6 border-b border-zinc-700">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={user?.image || '/default-avatar.png'}
                alt={user?.fullName || 'Admin'}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-medium">{user?.fullName || 'Admin'}</div>
              <div className="text-xs text-red-400">Administrator</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                  pathname === item.href
                    ? 'bg-red-600 text-white'
                    : 'text-gray-300 hover:bg-zinc-700'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-md text-gray-300 hover:bg-zinc-700 transition-colors"
            >
              <span className="text-lg"><FaSignOutAlt /></span>
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        ></div>
      )}
    </>
  );
} 