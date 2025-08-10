'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        if (status === 'loading') return;

        if (status === 'unauthenticated') {
          console.log('Người dùng chưa đăng nhập, chuyển hướng đến trang đăng nhập');
          router.push('/login?redirect=/admin');
          return;
        }

        // Kiểm tra vai trò admin trong session
        if (session?.user?.role === 'admin') {
          console.log('Xác nhận admin từ session');
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        // Nếu session không có role admin, kiểm tra lại qua API
        console.log('Lấy thông tin user từ API');
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (data.success && data.user.role === 'admin') {
          console.log('API xác nhận admin');
          setIsAuthorized(true);
        } else {
          console.log('Không phải admin, chuyển hướng về trang chủ', data);
          router.push('/');
        }
      } catch (error) {
        console.error('Lỗi xác thực admin:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, [status, session, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-zinc-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex h-screen bg-zinc-900 text-white">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        {children}
      </div>
    </div>
  );
} 