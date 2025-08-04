'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, memberCardService, agentService } from '@/services/dataService';
import { User as DataUser, Membership } from '@/types';
import { Agent } from '@/data/agents';
import { userRoles } from '@/data/user_roles';

interface User {
  id: number;
  email: string;
  name: string;
  phone: string;
  primary_role: 'STUDENT' | 'TEACHER' | 'CORPORATE_CONTACT' | 'AGENT' | 'OPS' | 'ADMIN';
  membership_status: 'NON_MEMBER' | 'MEMBER' | 'EXPIRED_MEMBER' | 'TEST_USER';
  roles: string[]; // 多重角色
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
  isMember: boolean;
  isCorporateContact: boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
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

  // 載入用戶會員資料和角色
  const loadUserWithMembership = async (userData: DataUser): Promise<User> => {
    // 優先獲取 ACTIVE 會員卡，如果沒有則獲取 PURCHASED 會員卡
    let membership = await memberCardService.getUserMembership(userData.id);
    if (!membership) {
      membership = await memberCardService.getUserPurchasedMembership(userData.id);
    }
    
    // 載入用戶的所有角色
    const activeRoles = userRoles.filter(ur => ur.user_id === userData.id && ur.is_active);
    const roles = activeRoles.map(ur => ur.role);
    
    // 如果是 AGENT 角色，載入代理資料
    let agentData = null;
    if (userData.primary_role === 'AGENT' || roles.includes('AGENT')) {
      agentData = await agentService.getAgentByUserId(userData.id);
    }
    
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      primary_role: userData.primary_role,
      membership_status: userData.membership_status,
      roles,
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
    
    // 管理員和營運人員總是有權限
    if (user.primary_role === 'ADMIN' || user.primary_role === 'OPS' || 
        user.roles.includes('ADMIN') || user.roles.includes('OPS')) {
      return true;
    }
    
    // 教師和企業窗口有基本權限
    if (user.primary_role === 'TEACHER' || user.primary_role === 'CORPORATE_CONTACT' ||
        user.roles.includes('TEACHER') || user.roles.includes('CORPORATE_CONTACT')) {
      return true;
    }
    
    // AGENT 角色檢查代理狀態
    if (user.primary_role === 'AGENT' || user.roles.includes('AGENT')) {
      return user.agentData?.status === 'ACTIVE';
    }
    
    // 會員狀態或有 STUDENT 角色
    if (user.membership_status === 'MEMBER' || user.roles.includes('STUDENT')) {
      return user.membership?.status === 'ACTIVE' || user.membership?.status === 'PURCHASED';
    }
    
    return false;
  };

  // 檢查是否有特定角色
  const hasRole = (role: string) => {
    if (!user) return false;
    return user.primary_role === role || user.roles.includes(role);
  };

  // 檢查是否有任一角色
  const hasAnyRole = (roles: string[]) => {
    if (!user) return false;
    return roles.some(role => user.primary_role === role || user.roles.includes(role));
  };

  // 檢查是否有全部角色
  const hasAllRoles = (roles: string[]) => {
    if (!user) return false;
    return roles.every(role => user.primary_role === role || user.roles.includes(role));
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
    isStudent: user?.primary_role === 'STUDENT' || user?.roles.includes('STUDENT') || false,
    isTeacher: user?.primary_role === 'TEACHER' || user?.roles.includes('TEACHER') || false,
    isOps: user?.primary_role === 'OPS' || user?.roles.includes('OPS') || false,
    isAdmin: user?.primary_role === 'ADMIN' || user?.roles.includes('ADMIN') || false,
    isAgent: user?.primary_role === 'AGENT' || user?.roles.includes('AGENT') || false,
    isMember: user?.membership_status === 'MEMBER' || user?.roles.includes('STUDENT') || false,
    isCorporateContact: user?.primary_role === 'CORPORATE_CONTACT' || user?.roles.includes('CORPORATE_CONTACT') || false,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    refreshMembership
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};