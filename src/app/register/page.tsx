'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUser, FaEnvelope, FaLock, FaGoogle, FaFacebook } from 'react-icons/fa';
import { signIn } from 'next-auth/react';

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ApiError {
  message: string;
  success?: boolean;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const validateForm = (): boolean => {
    setError('');

    // Check required fields
    if (!formData.fullName.trim()) {
      setError('Vui lòng nhập họ tên');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Vui lòng nhập email');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email không hợp lệ');
      return false;
    }

    if (!formData.password) {
      setError('Vui lòng nhập mật khẩu');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    if (!formData.confirmPassword) {
      setError('Vui lòng xác nhận mật khẩu');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }

    return true;
  };

  const handleInputChange = (field: keyof RegisterFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
    
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          fullName: formData.fullName.trim(), 
          email: formData.email.trim().toLowerCase(), 
          password: formData.password 
        }),
      });
      
      const data: ApiError = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký thất bại');
      }
      
      // Auto login after successful registration
      const signInResult = await signIn('credentials', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        redirect: false,
      });
      
      if (signInResult?.error) {
        // Registration successful but login failed - redirect to login page
        router.push('/login?message=Đăng ký thành công. Vui lòng đăng nhập.');
        return;
      }
      
      // Both registration and login successful
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Đăng ký thất bại. Vui lòng thử lại sau.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-zinc-800 p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Đăng ký tài khoản</h1>
          <p className="mt-2 text-gray-400">Tham gia cộng đồng MyPhim ngay hôm nay</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="sr-only">Họ và tên</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange('fullName')}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-md bg-zinc-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Họ và tên"
                  disabled={isLoading}
                />
              </div>
            </div>
            
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
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-md bg-zinc-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Địa chỉ email"
                  disabled={isLoading}
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-md bg-zinc-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Mật khẩu (ít nhất 6 ký tự)"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Xác nhận mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-md bg-zinc-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Xác nhận mật khẩu"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-700 rounded bg-zinc-700"
              disabled={isLoading}
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
              Tôi đồng ý với <Link href="/terms" className="text-red-500 hover:text-red-400">Điều khoản sử dụng</Link> và <Link href="/privacy" className="text-red-500 hover:text-red-400">Chính sách bảo mật</Link>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                'Đăng ký'
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-zinc-800 text-gray-400">Hoặc đăng ký với</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-700 rounded-md shadow-sm bg-zinc-700 text-sm font-medium text-gray-300 hover:bg-zinc-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <FaGoogle className="mr-2" />
                <span>Google</span>
              </button>
            </div>

            <div>
              <button
                type="button"
                disabled={isLoading}
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-700 rounded-md shadow-sm bg-zinc-700 text-sm font-medium text-gray-300 hover:bg-zinc-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <FaFacebook className="mr-2" />
                <span>Facebook</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Đã có tài khoản?{' '}
            <Link href="/login" className="font-medium text-red-500 hover:text-red-400">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 