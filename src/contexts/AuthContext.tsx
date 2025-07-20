'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, memberCardService } from '@/services/dataService';
import { User as DataUser, Membership } from '@/types';

interface User {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: 'STUDENT' | 'TEACHER' | 'OPS';
  membership?: Membership | null;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  register: (email: string, password: string, name: string, phone: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  hasActiveMembership: () => boolean;
  loading: boolean;
  isAuthenticated: boolean;
  isStudent: boolean;
  isTeacher: boolean;
  isOps: boolean;
  refreshMembership: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 從 localStorage 載入用戶會話
  useEffect(() => {
    const loadUserSession = async () => {
      try {
        const savedUserId = localStorage.getItem('userId');
        const savedJwt = localStorage.getItem('jwt');
        
        if (savedUserId && savedJwt) {
          const userData = await authService.getUser(parseInt(savedUserId));
          if (userData) {
            const userWithMembership = await loadUserWithMembership(userData);
            setUser(userWithMembership);
          }
        }
      } catch (error) {
        console.error('Error loading user session:', error);
        localStorage.removeItem('userId');
        localStorage.removeItem('jwt');
      } finally {
        setLoading(false);
      }
    };

    loadUserSession();
  }, []);

  // 載入用戶會員資料
  const loadUserWithMembership = async (userData: DataUser): Promise<User> => {
    const membership = await memberCardService.getUserMembership(userData.id);
    
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      role: userData.role,
      membership,
      avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face`
    };
  };

  // 註冊功能 (US01)
  const register = async (email: string, password: string, name: string, phone: string) => {
    try {
      setLoading(true);
      
      const response = await authService.register(email, password, name, phone);
      
      if (response.success && response.user_id && response.jwt) {
        // 獲取完整用戶資料
        const userData = await authService.getUser(response.user_id);
        if (userData) {
          const userWithMembership = await loadUserWithMembership(userData);
          setUser(userWithMembership);
          
          // 保存會話
          localStorage.setItem('userId', response.user_id.toString());
          localStorage.setItem('jwt', response.jwt);
          
          return { success: true, user: userWithMembership };
        }
      }
      
      return { success: false, error: response.error || '註冊失敗' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: '註冊失敗，請稍後再試' };
    } finally {
      setLoading(false);
    }
  };

  // 登入功能 (US01)
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const response = await authService.login(email, password);
      
      if (response.success && response.user_id && response.jwt) {
        // 獲取完整用戶資料
        const userData = await authService.getUser(response.user_id);
        if (userData) {
          const userWithMembership = await loadUserWithMembership(userData);
          setUser(userWithMembership);
          
          // 保存會話
          localStorage.setItem('userId', response.user_id.toString());
          localStorage.setItem('jwt', response.jwt);
          
          return { success: true, user: userWithMembership };
        }
      }
      
      return { success: false, error: response.error || '登入失敗' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: '登入失敗，請稍後再試' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('jwt');
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
  };

  const hasActiveMembership = () => {
    if (!user) return false;
    if (user.role !== 'STUDENT') return true; // 非學生角色總是有權限
    
    return user.membership?.status === 'ACTIVE';
  };

  // 刷新會員資料
  const refreshMembership = async () => {
    if (!user) return;
    
    try {
      const membership = await memberCardService.getUserMembership(user.id);
      setUser(prev => prev ? { ...prev, membership } : null);
    } catch (error) {
      console.error('Error refreshing membership:', error);
    }
  };

  const value: AuthContextType = {
    user,
    register,
    login,
    logout,
    updateProfile,
    hasActiveMembership,
    loading,
    isAuthenticated: !!user,
    isStudent: user?.role === 'STUDENT',
    isTeacher: user?.role === 'TEACHER',
    isOps: user?.role === 'OPS',
    refreshMembership
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};