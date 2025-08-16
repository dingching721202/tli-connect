'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, memberCardService, agentService } from '@/services/dataService';
import { User as DataUser, Membership, MembershipStatus } from '@/types';
import { Agent } from '@/data/agents';

type RoleType = 'STUDENT' | 'TEACHER' | 'CORPORATE_CONTACT' | 'AGENT' | 'STAFF' | 'ADMIN';

interface User {
  id: number;
  email: string;
  name: string;
  phone: string;
  roles: RoleType[]; // 多重角色
  membership_status: MembershipStatus;
  campus: '羅斯福校' | '士林校' | '台中校' | '高雄校' | '總部';
  membership?: Membership | null;
  avatar?: string;
  agentData?: Agent | null; // 代理專用資料
  corp_id?: string; // 企業窗口用戶的公司ID
}

interface AuthContextType {
  user: User | null;
  currentRole: string | null;
  register: (email: string, password: string, name: string, phone: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  hasActiveMembership: () => boolean;
  loading: boolean;
  isAuthenticated: boolean;
  isStudent: boolean;
  isTeacher: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  isAgent: boolean;
  isMember: boolean;
  isCorporateContact: boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  refreshMembership: () => Promise<void>;
  switchRole: (role: string) => void;
  availableRoles: string[];
  // 新增角色鎖定功能
  isRoleLocked: boolean;
  lockedRole: string | null;
  setRoleLock: (role: string | null) => void;
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
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // 新增角色鎖定狀態
  const [isRoleLocked, setIsRoleLocked] = useState(false);
  const [lockedRole, setLockedRole] = useState<string | null>(null);

  // 初始化載入狀態（移除自動登錄功能）
  useEffect(() => {
    // 直接設置載入完成，不自動從 localStorage 載入用戶會話
    setLoading(false);
  }, []);

  // 載入用戶會員資料和角色
  const loadUserWithMembership = async (userData: DataUser): Promise<User> => {
    // 優先獲取 ACTIVE 會員卡，如果沒有則獲取 PURCHASED 會員卡
    let membership = await memberCardService.getMembership(userData.id);
    if (!membership) {
      membership = await memberCardService.getUserInactiveMembership(userData.id);
    }
    
    // 使用新的角色系統：直接從 userData.roles 獲取角色
    const roles = userData.roles || [];
    
    // 如果是 AGENT 角色，載入代理資料
    let agentData = null;
    if (roles.includes('AGENT')) {
      agentData = await agentService.getAgentByUserId(userData.id);
    }
    
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      roles,
      membership_status: userData.membership_status,
      campus: userData.campus,
      membership,
      agentData,
      corp_id: userData.corp_id,
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
          
          // 不自動設置角色，讓用戶手動選擇或由特定頁面設置
          
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
        console.log('🔍 AuthContext login - 嘗試獲取用戶資料，user_id:', data.user_id);
        const userData = await authService.getUser(data.user_id);
        console.log('📋 AuthContext login - 獲取到的用戶資料:', userData);
        
        if (userData) {
          const userWithMembership = await loadUserWithMembership(userData);
          console.log('✅ AuthContext login - 用戶登入成功:', userWithMembership);
          setUser(userWithMembership);
          
          // 不自動設置角色，讓用戶手動選擇或由特定頁面設置
          
          // 保存會話
          localStorage.setItem('userId', data.user_id.toString());
          localStorage.setItem('jwt', data.jwt);
          
          return { success: true, user: userWithMembership };
        } else {
          console.error('❌ AuthContext login - 無法獲取用戶資料，user_id:', data.user_id);
        }
      } else {
        console.error('❌ AuthContext login - API 回應失敗:', { response: response.ok, data });
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
    // 取得登入來源頁面
    const loginSource = localStorage.getItem('loginSource') || '/login';
    
    // 重置所有狀態
    setUser(null);
    setCurrentRole(null);
    setIsRoleLocked(false);
    setLockedRole(null);
    
    // 清除用戶相關的 localStorage 數據
    localStorage.removeItem('userId');
    localStorage.removeItem('jwt');
    localStorage.removeItem('currentRole');
    localStorage.removeItem('lockedRole');
    localStorage.removeItem('isRoleLocked');
    localStorage.removeItem('loginSource');
    
    // 跳轉到登入頁面，不重新載入整個頁面
    window.location.href = loginSource;
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
  };

  const hasActiveMembership = () => {
    if (!user) return false;
    
    // 管理員和營運人員總是有權限
    if (user.roles.includes('ADMIN') || user.roles.includes('STAFF')) {
      return true;
    }
    
    // 教師和企業窗口有基本權限
    if (user.roles.includes('TEACHER') || user.roles.includes('CORPORATE_CONTACT')) {
      return true;
    }
    
    // AGENT 角色檢查代理狀態
    if (user.roles.includes('AGENT')) {
      return user.agentData?.status === 'ACTIVE';
    }
    
    // 學生角色：檢查會員狀態
    if (user.roles.includes('STUDENT')) {
      // 如果用戶層級的會員狀態是 activated，就是有效會員
      if (user.membership_status === 'activated') {
        return true;
      }
      
      // 如果有 membership 物件，檢查其狀態
      if (user.membership) {
        return user.membership.status === 'activated' || user.membership.status === 'inactive';
      }
      
      // 如果沒有 membership 物件但用戶狀態是 activated，仍視為有效
      return (user.membership_status as MembershipStatus) === 'activated';
    }
    
    return false;
  };

  // 檢查是否有特定角色
  const hasRole = (role: string) => {
    if (!user) return false;
    return user.roles.includes(role as RoleType);
  };

  // 檢查是否有任一角色
  const hasAnyRole = (roles: string[]) => {
    if (!user) return false;
    return roles.some(role => user.roles.includes(role as RoleType));
  };

  // 檢查是否有全部角色
  const hasAllRoles = (roles: string[]) => {
    if (!user) return false;
    return roles.every(role => user.roles.includes(role as RoleType));
  };

  // 切換當前活動角色
  const switchRole = (role: string) => {
    if (!user || !user.roles.includes(role as RoleType)) return;
    // 如果角色被鎖定且不是同一個角色，不允許切換
    if (isRoleLocked && lockedRole !== role) return;
    setCurrentRole(role);
    localStorage.setItem('currentRole', role);
  };

  // 設置角色鎖定
  const setRoleLock = (role: string | null) => {
    if (role) {
      setIsRoleLocked(true);
      setLockedRole(role);
      setCurrentRole(role);
      localStorage.setItem('lockedRole', role);
      localStorage.setItem('isRoleLocked', 'true');
    } else {
      setIsRoleLocked(false);
      setLockedRole(null);
      localStorage.removeItem('lockedRole');
      localStorage.removeItem('isRoleLocked');
    }
  };

  // 刷新會員資料
  const refreshMembership = async () => {
    if (!user) return;
    
    try {
      // 優先獲取 ACTIVE 會員卡，如果沒有則獲取 PURCHASED 會員卡
      let membership = await memberCardService.getMembership(user.id);
      if (!membership) {
        membership = await memberCardService.getUserInactiveMembership(user.id);
      }
      setUser(prev => prev ? { ...prev, membership } : null);
    } catch (error) {
      console.error('Error refreshing membership:', error);
    }
  };

  const value: AuthContextType = {
    user,
    currentRole,
    register,
    login,
    logout,
    updateProfile,
    hasActiveMembership,
    loading,
    isAuthenticated: !!user,
    isStudent: user?.roles.includes('STUDENT') || false,
    isTeacher: user?.roles.includes('TEACHER') || false,
    isStaff: user?.roles.includes('STAFF') || false,
    isAdmin: user?.roles.includes('ADMIN') || false,
    isAgent: user?.roles.includes('AGENT') || false,
    isMember: user?.membership_status === 'activated' || user?.roles.includes('STUDENT') || false,
    isCorporateContact: user?.roles.includes('CORPORATE_CONTACT') || false,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    refreshMembership,
    switchRole,
    availableRoles: user?.roles || [],
    // 新增角色鎖定功能
    isRoleLocked,
    lockedRole,
    setRoleLock
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};