'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { usersService } from '@/lib/supabase/services/users';
import { CoreUser, Role, Campus } from '@/lib/supabase/types';

interface AuthUser extends CoreUser {
  roles: Role[];
  permissions: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  currentRole: Role | null;
  loading: boolean;
  
  // Authentication methods
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData: SignUpData) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  
  // Profile management
  updateProfile: (updates: Partial<CoreUser>) => Promise<{ success: boolean; error?: string }>;
  
  // Role management
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
  hasAllRoles: (roles: Role[]) => boolean;
  switchRole: (role: Role) => void;
  availableRoles: Role[];
  
  // Role locking (for single-role users)
  isRoleLocked: boolean;
  lockedRole: Role | null;
  setRoleLock: (role: Role | null) => void;
  
  // Computed properties
  isAuthenticated: boolean;
  isStudent: boolean;
  isTeacher: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  isAgent: boolean;
  isCorporateContact: boolean;
}

interface SignUpData {
  full_name: string;
  phone?: string;
  campus: Campus;
  avatar_url?: string;
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Role locking state
  const [isRoleLocked, setIsRoleLocked] = useState(false);
  const [lockedRole, setLockedRole] = useState<Role | null>(null);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        if (mounted) {
          await handleSessionChange(session);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          console.log('Auth state changed:', event, session?.user?.email);
          await handleSessionChange(session);
          setLoading(false);
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleSessionChange = async (session: Session | null) => {
    setSession(session);

    if (session?.user) {
      await loadUserProfile(session.user);
    } else {
      setUser(null);
      setCurrentRole(null);
      clearRoleState();
    }
  };

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // Get user profile with roles from database
      const { data: userProfile, error } = await usersService.getUserById(supabaseUser.id);
      
      if (error || !userProfile) {
        console.error('Error loading user profile:', error);
        return;
      }

      // Get user roles
      const { data: roles } = await usersService.getUserRoles(supabaseUser.id);
      
      const authUser: AuthUser = {
        ...userProfile,
        roles: roles || [],
        permissions: [] // TODO: Implement permissions logic
      };

      setUser(authUser);
      
      // Handle role state restoration
      await restoreRoleState(authUser);
      
      // Update last login
      await usersService.updateLastLogin(supabaseUser.id);
      
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const restoreRoleState = async (authUser: AuthUser) => {
    try {
      // Check for role lock state (only for single-role users)
      const savedIsRoleLocked = localStorage.getItem('isRoleLocked') === 'true';
      const savedLockedRole = localStorage.getItem('lockedRole') as Role;
      
      if (authUser.roles.length === 1 && savedIsRoleLocked && savedLockedRole && authUser.roles.includes(savedLockedRole)) {
        // Restore role lock for single-role users
        setIsRoleLocked(true);
        setLockedRole(savedLockedRole);
        setCurrentRole(savedLockedRole);
      } else {
        // Clear role lock for multi-role users
        if (authUser.roles.length > 1) {
          clearRoleState();
        }
        
        // Set current role from localStorage or use first role
        const savedCurrentRole = localStorage.getItem('currentRole') as Role;
        if (savedCurrentRole && authUser.roles.includes(savedCurrentRole)) {
          setCurrentRole(savedCurrentRole);
        } else if (authUser.roles.length > 0) {
          setCurrentRole(authUser.roles[0]);
          localStorage.setItem('currentRole', authUser.roles[0]);
        }
      }
    } catch (error) {
      console.error('Error restoring role state:', error);
    }
  };

  const clearRoleState = () => {
    setIsRoleLocked(false);
    setLockedRole(null);
    localStorage.removeItem('lockedRole');
    localStorage.removeItem('isRoleLocked');
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Login failed' };
      }

      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: SignUpData): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      // Create user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            campus: userData.campus
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Registration failed' };
      }

      // Create user profile using the service
      const { error: profileError } = await usersService.createUser({
        email,
        password, // This won't be used since auth is handled by Supabase
        full_name: userData.full_name,
        phone: userData.phone,
        campus: userData.campus,
        avatar_url: userData.avatar_url
      });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // Note: User is already created in auth, profile creation failure is logged but not returned as error
      }

      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      // Get login source for redirect
      const loginSource = localStorage.getItem('loginSource') || '/';
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear all state
      setUser(null);
      setSession(null);
      setCurrentRole(null);
      clearRoleState();
      
      // Clear localStorage
      localStorage.clear();
      
      // Redirect to login source
      setTimeout(() => {
        window.location.href = loginSource;
      }, 100);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (updates: Partial<CoreUser>): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const { data, error } = await usersService.updateUser(user.id, updates);
      
      if (error || !data) {
        return { success: false, error: error?.message || 'Update failed' };
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, ...data } : null);
      
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Update failed' };
    }
  };

  // Role checking methods
  const hasRole = (role: Role): boolean => {
    return user?.roles.includes(role) || false;
  };

  const hasAnyRole = (roles: Role[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  const hasAllRoles = (roles: Role[]): boolean => {
    return roles.every(role => hasRole(role));
  };

  const switchRole = (role: Role): void => {
    if (!user || !user.roles.includes(role) || isRoleLocked) return;
    
    setCurrentRole(role);
    localStorage.setItem('currentRole', role);
  };

  const setRoleLock = (role: Role | null): void => {
    if (role && user?.roles.includes(role)) {
      setIsRoleLocked(true);
      setLockedRole(role);
      setCurrentRole(role);
      localStorage.setItem('lockedRole', role);
      localStorage.setItem('isRoleLocked', 'true');
    } else {
      clearRoleState();
    }
  };

  const value: AuthContextType = {
    user,
    session,
    currentRole,
    loading,
    
    // Methods
    signIn,
    signUp,
    signOut,
    updateProfile,
    
    // Role methods
    hasRole,
    hasAnyRole,
    hasAllRoles,
    switchRole,
    availableRoles: user?.roles || [],
    
    // Role locking
    isRoleLocked,
    lockedRole,
    setRoleLock,
    
    // Computed properties
    isAuthenticated: !!user,
    isStudent: hasRole('STUDENT'),
    isTeacher: hasRole('TEACHER'),
    isStaff: hasRole('STAFF'),
    isAdmin: hasRole('ADMIN'),
    isAgent: hasRole('AGENT'),
    isCorporateContact: hasRole('CORPORATE_CONTACT')
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};