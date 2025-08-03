'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, memberCardService, agentService } from '@/services/dataService';
import { User as DataUser, Membership } from '@/types';
import { Agent } from '@/data/agents';

interface User {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: 'STUDENT' | 'TEACHER' | 'OPS' | 'CORPORATE_CONTACT' | 'ADMIN' | 'AGENT';
  membership?: Membership | null;
  avatar?: string;
  agentData?: Agent | null; // 代理專用資料
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
  isAdmin: boolean;
  isAgent: boolean;
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
    // 優先獲取 ACTIVE 會員卡，如果沒有則獲取 PURCHASED 會員卡
    let membership = await memberCardService.getUserMembership(userData.id);
    if (!membership) {
      membership = await memberCardService.getUserPurchasedMembership(userData.id);
    }
    
    // 如果是 AGENT 角色，載入代理資料
    let agentData = null;
    if (userData.role === 'AGENT') {
      agentData = await agentService.getAgentByUserId(userData.id);
    }
    
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      role: userData.role,
      membership,
      agentData,
      avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face`
    };
  };

  // 註冊功能 (US01)
  const register = async (email: string, password: string, name: string, phone: string) => {
    try {
      setLoading(true);
      
      console.log('AuthContext: 開始註冊請求');
      
      // 調用 API 路由
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, phone }),
      });

      const data = await response.json();
      
      console.log('AuthContext: API 回應', { 
        status: response.status, 
        ok: response.ok, 
        data 
      });
      
      if (response.ok && data.success && data.user_id && data.jwt) {
        console.log('AuthContext: 註冊 API 成功，開始獲取用戶資料');
        
        // 獲取完整用戶資料
        const userData = await authService.getUser(data.user_id);
        console.log('AuthContext: 用戶資料', userData);
        
        if (userData) {
          const userWithMembership = await loadUserWithMembership(userData);
          console.log('AuthContext: 用戶會員資料', userWithMembership);
          
          setUser(userWithMembership);
          
          // 保存會話
          localStorage.setItem('userId', data.user_id.toString());
          localStorage.setItem('jwt', data.jwt);
          
          return { success: true, user: userWithMembership };
        } else {
          console.error('AuthContext: 無法獲取用戶資料');
          return { success: false, error: '無法獲取用戶資料' };
        }
      }
      
      // 處理特定錯誤狀態碼
      let errorMessage = data.error || '註冊失敗';
      if (response.status === 409 && data.error === 'EMAIL_ALREADY_EXISTS') {
        errorMessage = 'EMAIL_ALREADY_EXISTS';
      }
      
      return { success: false, error: errorMessage };
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
      
      // 調用 API 路由
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok && data.success && data.user_id && data.jwt) {
        // 獲取完整用戶資料
        const userData = await authService.getUser(data.user_id);
        if (userData) {
          const userWithMembership = await loadUserWithMembership(userData);
          setUser(userWithMembership);
          
          // 保存會話
          localStorage.setItem('userId', data.user_id.toString());
          localStorage.setItem('jwt', data.jwt);
          
          return { success: true, user: userWithMembership };
        }
      }
      
      // 處理特定錯誤狀態碼
      let errorMessage = data.error || '登入失敗';
      if (response.status === 401 && data.error === 'INVALID_CREDENTIALS') {
        errorMessage = 'INVALID_CREDENTIALS';
      }
      
      return { success: false, error: errorMessage };
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
    if (user.role !== 'STUDENT' && user.role !== 'AGENT') return true; // 非學生和代理角色總是有權限
    
    // AGENT 角色只能看到自己的資料，但有基本權限
    if (user.role === 'AGENT') {
      // 檢查代理狀態是否為 ACTIVE
      return user.agentData?.status === 'ACTIVE';
    }
    
    // 允許 ACTIVE 和 PURCHASED 狀態的會員預約
    return user.membership?.status === 'ACTIVE' || user.membership?.status === 'PURCHASED';
  };

  // 刷新會員資料
  const refreshMembership = async () => {
    if (!user) return;
    
    try {
      // 優先獲取 ACTIVE 會員卡，如果沒有則獲取 PURCHASED 會員卡
      let membership = await memberCardService.getUserMembership(user.id);
      if (!membership) {
        membership = await memberCardService.getUserPurchasedMembership(user.id);
      }
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
    isAdmin: user?.role === 'ADMIN',
    isAgent: user?.role === 'AGENT',
    refreshMembership
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};