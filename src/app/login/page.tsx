'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaEnvelope, FaLock, FaGoogle, FaFacebook } from 'react-icons/fa';
import { useAuth } from '@/hooks';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  
  const { login, loginWithGoogle, error: authError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setLocalError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    
    try {
      setIsLoading(true);
      setLocalError('');
      
      // Gọi hàm login từ useAuth hook
      await login(email, password);
      
      // Chuyển hướng đến trang được yêu cầu hoặc trang chủ
      router.push(redirectPath);
    } catch (err) {
      // Lỗi sẽ được xử lý bởi useAuth hook
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // Redirect is handled by NextAuth
    } catch (err) {
      console.error('Google login error:', err);
    }
  };

  // Hiển thị lỗi từ useAuth hook hoặc lỗi cục bộ
  const errorMessage = authError || localError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-zinc-800 p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Đăng nhập</h1>
          <p className="mt-2 text-gray-400">Chào mừng bạn quay trở lại MyPhim</p>
        </div>
        
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-md bg-zinc-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Địa chỉ email"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-md bg-zinc-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Mật khẩu"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-700 rounded bg-zinc-700"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-red-500 hover:text-red-400">
                Quên mật khẩu?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-70"
            >
              {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </div>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-zinc-800 text-gray-400">Hoặc đăng nhập với</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div>
              <button
                onClick={handleGoogleLogin}
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-700 rounded-md shadow-sm bg-zinc-700 text-sm font-medium text-gray-300 hover:bg-zinc-600 transition-colors"
              >
                <FaGoogle className="mr-2" />
                <span>Google</span>
              </button>
            </div>

            <div>
              <a
                href="#"
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-700 rounded-md shadow-sm bg-zinc-700 text-sm font-medium text-gray-300 hover:bg-zinc-600 transition-colors"
              >
                <FaFacebook className="mr-2" />
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="font-medium text-red-500 hover:text-red-400">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 