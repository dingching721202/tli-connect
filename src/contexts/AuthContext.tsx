'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'student' | 'instructor' | 'consultant' | 'admin' | 'corporate_contact';
  avatar: string;
  membershipType?: 'individual' | 'corporate' | null;
  membershipStatus: 'active' | 'inactive';
  companyName?: string;
  companyId?: string;
  membership?: {
    plan: string;
    planName: string;
    startDate: string;
    endDate: string;
    price: number;
    autoRenewal: boolean;
    daysRemaining: number;
    isExpiringSoon: boolean;
  } | null;
  enrolledCourses?: number[];
  courses?: number[];
  profile: {
    phone: string;
    level?: string;
    joinDate?: string;
    expertise?: string;
    experience?: string;
    department?: string;
    permissions?: string[];
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  hasPermission: (permission: string) => boolean;
  hasActiveMembership: () => boolean;
  getMembershipDaysRemaining: () => number;
  isMembershipExpiringSoon: () => boolean;
  loading: boolean;
  isAuthenticated: boolean;
  isStudent: boolean;
  isInstructor: boolean;
  isConsultant: boolean;
  isAdmin: boolean;
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

  // Mock users for demonstration with membership details
  const mockUsers: Record<string, User> = {
    'student@example.com': {
      id: 1,
      email: 'student@example.com',
      name: '王小明',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      membershipType: 'individual',
      membershipStatus: 'active',
      membership: {
        plan: 'yearly',
        planName: '年方案',
        startDate: '2024-11-01',
        endDate: '2025-11-01',
        price: 36000,
        autoRenewal: true,
        daysRemaining: 316,
        isExpiringSoon: false
      },
      enrolledCourses: [],
      profile: {
        phone: '0912-345-678',
        level: '中級',
        joinDate: '2024-01-15'
      }
    },
    'instructor@example.com': {
      id: 2,
      email: 'instructor@example.com',
      name: '張老師',
      role: 'instructor',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      membershipType: null,
      membershipStatus: 'active', // Instructors are always active
      membership: null,
      courses: [1, 5, 24],
      profile: {
        phone: '0923-456-789',
        expertise: '商務華語、文法教學',
        experience: '8年教學經驗'
      }
    },
    'admin@example.com': {
      id: 3,
      email: 'admin@example.com',
      name: '系統管理員',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      membershipType: null,
      membershipStatus: 'active', // Admins are always active
      membership: null,
      profile: {
        phone: '0934-567-890',
        department: '教務處',
        permissions: ['all']
      }
    },
    'corporate@example.com': {
      id: 4,
      email: 'corporate@example.com',
      name: '企業員工A',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      membershipType: 'corporate',
      membershipStatus: 'active',
      companyName: '台灣科技股份有限公司',
      membership: {
        plan: 'corporate',
        planName: '企業方案',
        startDate: '2024-07-01',
        endDate: '2025-07-01',
        price: 26000,
        autoRenewal: true,
        daysRemaining: 183,
        isExpiringSoon: false
      },
      enrolledCourses: [],
      profile: {
        phone: '0912-345-678',
        level: '中級',
        joinDate: '2024-07-01'
      }
    },
    'consultant@example.com': {
      id: 5,
      email: 'consultant@example.com',
      name: '李顧問',
      role: 'consultant',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face',
      membershipType: null,
      membershipStatus: 'active',
      membership: null,
      profile: {
        phone: '0945-678-901',
        expertise: '企業培訓、商務諮詢',
        experience: '10年顧問經驗',
        department: '業務發展部'
      }
    },
    'corporate.contact@taiwantech.com': {
      id: 6,
      email: 'corporate.contact@taiwantech.com',
      name: '王企業窗口',
      role: 'corporate_contact',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      membershipType: 'corporate',
      membershipStatus: 'active',
      companyName: '台灣科技股份有限公司',
      companyId: 'company_001',
      membership: {
        plan: 'corporate',
        planName: '企業方案 (50人)',
        startDate: '2024-07-01',
        endDate: '2025-07-01',
        price: 130000,
        autoRenewal: true,
        daysRemaining: 183,
        isExpiringSoon: false
      },
      profile: {
        phone: '02-2345-6789',
        department: '人力資源部',
        expertise: '企業學習管理',
        experience: '5年企業培訓經驗'
      }
    }
  };

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        // Clear corrupted data
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Mock authentication
      const user = mockUsers[email];
      if (user && password === 'password') {
        setUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true, user };
      } else {
        return { success: false, error: '帳號或密碼錯誤' };
      }
    } catch {
      return { success: false, error: '登入失敗，請稍後再試' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const hasPermission = (permission: string) => {
    if (!user) return false;

    const { role } = user;

    // Define role-based permissions
    const rolePermissions: Record<User['role'], string[]> = {
      student: ['view_courses', 'book_courses', 'view_own_bookings'],
      instructor: ['view_courses', 'manage_own_courses', 'view_students', 'manage_courses'],
      consultant: ['view_courses', 'manage_referrals', 'view_commissions', 'view_own_performance'],
      corporate_contact: ['view_courses', 'manage_corporate_users', 'view_corporate_learning', 'manage_corporate_membership'],
      admin: ['all']
    };

    // Special permissions
    if (permission === 'admin_access') {
      return role === 'admin'; // Only admin can access admin features
    }
    
    // Admin has all permissions
    if (role === 'admin') return true;
    if (permission === 'manage_courses') {
      return role === 'instructor';
    }

    return rolePermissions[role]?.includes(permission) || false;
  };

  const hasActiveMembership = () => {
    if (!user) return false;
    if (user.role !== 'student') return true; // Non-students always have access
    
    return user.membershipStatus === 'active';
  };

  const getMembershipDaysRemaining = () => {
    if (!user?.membership) return 0;
    return user.membership.daysRemaining;
  };

  const isMembershipExpiringSoon = () => {
    if (!user?.membership) return false;
    return user.membership.daysRemaining <= 14 && user.membership.daysRemaining > 0;
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    updateProfile,
    hasPermission,
    hasActiveMembership,
    getMembershipDaysRemaining,
    isMembershipExpiringSoon,
    loading,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isInstructor: user?.role === 'instructor',
    isConsultant: user?.role === 'consultant',
    isAdmin: user?.role === 'admin',
    isCorporateContact: user?.role === 'corporate_contact'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};