import { BaseSupabaseService } from './base'
import { User, UserRole } from '@/types'
import type { Session } from '@supabase/supabase-js'

// TODO: Define proper Supabase types
// type SupabaseUser = Database['public']['Tables']['users']['Row']
// type SupabaseUserInsert = Database['public']['Tables']['users']['Insert']

export class AuthService extends BaseSupabaseService {
  /**
   * Register a new user
   */
  async register(
    email: string,
    password: string,
    name: string,
    phone?: string,
    campus = '羅斯福校'
  ) {
    try {
      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await this.client.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            campus
          }
        }
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('Failed to create user')
      }

      // 2. Create user profile in users table
      const userInsert: Record<string, unknown> = {
        id: authData.user.id,
        email,
        name,
        phone: phone || null,
        membership_status: 'non_member',
        account_status: 'ACTIVE',
        campus: campus as '羅斯福校' | '士林校' | '台中校' | '高雄校' | '總部'
      }

      const { error: profileError } = await this.client
        .from('users')
        .insert(userInsert)

      if (profileError) {
        // Clean up auth user if profile creation fails
        await this.client.auth.admin.deleteUser(authData.user.id)
        throw new Error(`Failed to create user profile: ${profileError.message}`)
      }

      // 3. Assign default STUDENT role
      const { error: roleError } = await this.client
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'STUDENT',
          granted_by: null, // System granted
          is_active: true
        })

      if (roleError) {
        console.error('Failed to assign default role:', roleError)
      }

      await this.logActivity(
        authData.user.id,
        'USER_REGISTERED',
        'users',
        authData.user.id,
        `User registered: ${name} (${email})`,
        { email, name, campus },
        campus as '羅斯福校' | '士林校' | '台中校' | '高雄校' | '總部'
      )

      return {
        success: true,
        user: authData.user,
        session: authData.session
      }
    } catch (error) {
      console.error('Registration failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      }
    }
  }

  /**
   * Sign in user
   */
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        throw new Error(error.message)
      }

      if (!data.user || !data.session) {
        throw new Error('Invalid credentials')
      }

      // Get user profile with roles
      const userProfile = await this.getUserProfile(data.user.id)

      await this.logActivity(
        data.user.id,
        'USER_SIGNED_IN',
        'users',
        data.user.id,
        `User signed in: ${email}`,
        { email }
      )

      return {
        success: true,
        user: data.user,
        session: data.session,
        profile: userProfile
      }
    } catch (error) {
      console.error('Sign in failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign in failed'
      }
    }
  }

  /**
   * Sign out user
   */
  async signOut() {
    try {
      const { error } = await this.client.auth.signOut()
      
      if (error) {
        throw new Error(error.message)
      }

      return { success: true }
    } catch (error) {
      console.error('Sign out failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign out failed'
      }
    }
  }

  /**
   * Get current user session
   */
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await this.client.auth.getSession()
      
      if (error) {
        throw new Error(error.message)
      }

      return session
    } catch (error) {
      console.error('Failed to get session:', error)
      return null
    }
  }

  /**
   * Get user profile with roles
   */
  async getUserProfile(userId: string): Promise<User | null> {
    try {
      // Get user data
      const { data: userData, error: userError } = await this.client
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError || !userData) {
        throw new Error('User not found')
      }

      // Get user roles
      const { data: rolesData, error: rolesError } = await this.client
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('is_active', true)

      if (rolesError) {
        console.error('Failed to get user roles:', rolesError)
      }

      const roles = (rolesData || []).map(r => r.role as UserRole)

      return {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || undefined,
        roles: roles.length > 0 ? roles : ['STUDENT'],
        membership_status: 'non_member',
        account_status: userData.account_status as 'ACTIVE' | 'SUSPENDED' | 'CANCELLED',
        campus: userData.campus as '羅斯福校' | '士林校' | '台中校' | '高雄校' | '總部',
        // avatar_url: userData.avatar_url || undefined, // TODO: Add to User type if needed
        created_at: userData.created_at,
        updated_at: userData.updated_at || undefined
      }
    } catch (error) {
      console.error('Failed to get user profile:', error)
      return null
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<User>) {
    try {
      const userUpdate: Record<string, unknown> = {
        name: updates.name,
        phone: updates.phone || null,
        campus: updates.campus as '羅斯福校' | '士林校' | '台中校' | '高雄校' | '總部' | undefined,
        // avatar_url: updates.avatar_url || null, // TODO: Add to User type if needed
        updated_at: new Date().toISOString()
      }

      const { error } = await this.client
        .from('users')
        .update(userUpdate)
        .eq('id', userId)

      if (error) {
        throw new Error(error.message)
      }

      await this.logActivity(
        userId,
        'USER_PROFILE_UPDATED',
        'users',
        userId,
        'User profile updated',
        updates
      )

      return { success: true }
    } catch (error) {
      console.error('Failed to update user profile:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Update failed'
      }
    }
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: string) {
    try {
      const { data, error } = await this.client
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)

      if (error) {
        throw new Error(error.message)
      }

      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Failed to get user roles:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user roles'
      }
    }
  }

  /**
   * Update user roles
   */
  async updateUserRoles(userId: string, roles: UserRole[], adminId: string) {
    try {
      // Deactivate all existing roles
      await this.client
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', userId)

      // Add new roles
      const roleInserts = roles.map(role => ({
        user_id: userId,
        role: role as 'STUDENT' | 'TEACHER' | 'CORPORATE_CONTACT' | 'AGENT' | 'STAFF' | 'ADMIN',
        granted_by: adminId,
        is_active: true
      }))

      const { error } = await this.client
        .from('user_roles')
        .insert(roleInserts)

      if (error) {
        throw new Error(error.message)
      }

      await this.logActivity(
        adminId,
        'USER_ROLES_UPDATED',
        'users',
        userId,
        `Updated user roles to: ${roles.join(', ')}`,
        { userId, roles, adminId }
      )

      return { success: true, data: { roles } }
    } catch (error) {
      console.error('Failed to update user roles:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user roles'
      }
    }
  }

  /**
   * Update user status
   */
  async updateUserStatus(
    userId: string, 
    status: 'non_member' | 'activated' | 'expired' | 'test',
    adminId: string
  ) {
    try {
      const { error } = await this.client
        .from('users')
        .update({ 
          membership_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        throw new Error(error.message)
      }

      await this.logActivity(
        adminId,
        'USER_STATUS_UPDATED',
        'users',
        userId,
        `Updated user membership status to: ${status}`,
        { userId, status, adminId }
      )

      return { success: true }
    } catch (error) {
      console.error('Failed to update user status:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user status'
      }
    }
  }

  /**
   * Update user account status
   */
  async updateUserAccountStatus(
    userId: string,
    status: 'ACTIVE' | 'SUSPENDED',
    adminId: string
  ) {
    try {
      const { error } = await this.client
        .from('users')
        .update({
          account_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        throw new Error(error.message)
      }

      await this.logActivity(
        adminId,
        'USER_ACCOUNT_STATUS_UPDATED',
        'users',
        userId,
        `Updated user account status to: ${status}`,
        { userId, status, adminId }
      )

      return { success: true }
    } catch (error) {
      console.error('Failed to update user account status:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update account status'
      }
    }
  }

  /**
   * Get all users with roles (admin only)
   */
  async getAllUsersWithRoles() {
    try {
      const { data: users, error: usersError } = await this.client
        .from('users_with_roles')
        .select('*')

      if (usersError) {
        throw new Error(usersError.message)
      }

      // Transform data to match expected format
      // Assuming users_with_roles table already has roles field as an array
      const usersWithRoles = (users || []).map(user => ({
        ...user,
        // If roles field exists as array, use it; if it exists as separate user_roles field, transform it; otherwise default to STUDENT
        roles: user.roles || 
               (user.user_roles?.map((ur: { role: string }) => ur.role)) || 
               ['STUDENT']
      }))

      return { success: true, data: usersWithRoles }
    } catch (error) {
      console.error('Failed to get all users with roles:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get users'
      }
    }
  }

  /**
   * Create new user (admin only)
   */
  async createUser(
    userData: {
      email: string
      name: string
      phone?: string
      roles: UserRole[]
      membership_status?: string
      campus?: string
    },
    adminId: string
  ) {
    try {
      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8)

      // Create auth user
      const { data: authData, error: authError } = await this.client.auth.admin.createUser({
        email: userData.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          name: userData.name,
          phone: userData.phone,
          campus: userData.campus || '羅斯福校'
        }
      })

      if (authError || !authData.user) {
        throw new Error(authError?.message || 'Failed to create auth user')
      }

      // Create user profile
      const userInsert: Record<string, unknown> = {
        id: authData.user.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone || null,
        membership_status: (userData.membership_status as 'non_member' | 'individual' | 'corporate') || 'non_member',
        account_status: 'ACTIVE',
        campus: (userData.campus as '羅斯福校' | '士林校' | '台中校' | '高雄校' | '總部') || '羅斯福校'
      }

      const { error: profileError } = await this.client
        .from('users')
        .insert(userInsert)

      if (profileError) {
        await this.client.auth.admin.deleteUser(authData.user.id)
        throw new Error(`Failed to create user profile: ${profileError.message}`)
      }

      // Assign roles
      const roleInserts = userData.roles.map(role => ({
        user_id: authData.user.id,
        role: role as 'STUDENT' | 'TEACHER' | 'CORPORATE_CONTACT' | 'AGENT' | 'STAFF' | 'ADMIN',
        granted_by: adminId,
        is_active: true
      }))

      const { error: rolesError } = await this.client
        .from('user_roles')
        .insert(roleInserts)

      if (rolesError) {
        console.error('Failed to assign roles:', rolesError)
      }

      await this.logActivity(
        adminId,
        'USER_CREATED',
        'users',
        authData.user.id,
        `Created user: ${userData.name} (${userData.email})`,
        { ...userData, adminId }
      )

      return { 
        success: true, 
        data: { 
          id: authData.user.id, 
          tempPassword,
          ...userData
        }
      }
    } catch (error) {
      console.error('Failed to create user:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user'
      }
    }
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string, adminId: string) {
    try {
      // Check if trying to delete self
      if (userId === adminId) {
        throw new Error('Cannot delete yourself')
      }

      // Get user info for logging
      const { data: userData } = await this.client
        .from('users')
        .select('name, email')
        .eq('id', userId)
        .single()

      // Delete from auth (this will cascade to user profile via RLS)
      const { error: authError } = await this.client.auth.admin.deleteUser(userId)

      if (authError) {
        throw new Error(authError.message)
      }

      await this.logActivity(
        adminId,
        'USER_DELETED',
        'users',
        userId,
        `Deleted user: ${userData?.name} (${userData?.email})`,
        { userId, adminId, deletedUser: userData }
      )

      return { success: true }
    } catch (error) {
      console.error('Failed to delete user:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete user'
      }
    }
  }

  /**
   * Auto update membership status based on active memberships
   */
  async autoUpdateMembershipStatus(userId: string) {
    try {
      const user = await this.getUserProfile(userId)
      if (!user) {
        throw new Error('User not found')
      }

      let newStatus: 'non_member' | 'activated' | 'expired' | 'test' = 'non_member'

      // Check if user has STUDENT role
      if (!user.roles.includes('STUDENT')) {
        newStatus = 'non_member'
      } else {
        // Check for active memberships
        const { data: memberships, error } = await this.client
          .from('memberships')
          .select('status, expiry_date')
          .eq('user_id', userId)
          .eq('status', 'activated')
          .order('expiry_date', { ascending: false })
          .limit(1)

        if (error) {
          console.error('Failed to check memberships:', error)
        } else if (memberships && memberships.length > 0) {
          const membership = memberships[0]
          const now = new Date()
          const expiryDate = new Date(membership.expiry_date || '')
          
          if (expiryDate > now) {
            newStatus = 'activated'
          } else {
            newStatus = 'expired'
          }
        }
      }

      if (user.membership_status !== newStatus) {
        await this.updateUserStatus(userId, newStatus, userId)
      }

      return { success: true, data: { userId, newStatus } }
    } catch (error) {
      console.error('Failed to auto update membership status:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to auto update status'
      }
    }
  }
}

export const authService = new AuthService()