'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from "next-auth/react";

// User type definition
export interface User {
  id: string;
  fullName: string;
  name?: string | null; // 添加name属性以匹配NextAuth的User类型
  email: string;
  role: string;
  image?: string;
}

// Auth Context type definition
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // Check if user is logged in using NextAuth session
  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }
    
    if (session && session.user) {
      setUser({
        id: session.user.id || '',
        fullName: session.user.name || '',
        email: session.user.email || '',
        role: session.user.role || 'user',
        image: session.user.image || undefined,
      });
      setLoading(false);
    } else {
      // Also check our custom auth endpoint as fallback
      checkCustomAuth();
    }
  }, [session, status]);

  // Check custom auth for backward compatibility
  const checkCustomAuth = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/me');
      
      if (response.status === 401) {
        // User not authenticated, this is normal
        setUser(null);
        return;
      }
      
      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Auth check error:', err);
      // Don't set error for auth check failures
    } finally {
      setLoading(false);
    }
  };

  // Public method to refresh current user from server
  const refreshUser = async () => {
    await checkCustomAuth();
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // Try NextAuth first
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        // If NextAuth fails, try the custom login endpoint
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Đăng nhập thất bại');
        }

        if (data.success && data.user) {
          setUser(data.user);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Google login function
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await signIn('google', { callbackUrl: '/' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập với Google thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (fullName: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký thất bại');
      }

      if (data.success && data.user) {
        setUser(data.user);
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try NextAuth logout
      await signOut({ redirect: false });
      
      // Also call custom logout endpoint for backward compatibility
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      await response.json();

      setUser(null);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng xuất thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return React.createElement(
    AuthContext.Provider,
    { value: { user, loading, error, login, loginWithGoogle, register, logout, refreshUser } },
    children
  );
}

// useAuth hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
}

export default useAuth; 