import { BaseSupabaseService } from './base'
import { CoreUser, Campus, Role } from '../types'
import { PaginationOptions, PaginatedResponse, QueryResult } from '../types'

export interface UserFilters {
  campus?: Campus
  role?: Role
  is_active?: boolean
  search?: string
}

export interface CreateUserData {
  email: string
  password: string
  full_name: string
  phone?: string
  campus: Campus
  avatar_url?: string
}

export interface UpdateUserData {
  full_name?: string
  phone?: string
  campus?: Campus
  avatar_url?: string
  is_active?: boolean
}

export class UsersService extends BaseSupabaseService {
  /**
   * Get paginated list of users with filters
   */
  async getUsers(
    filters: UserFilters = {},
    pagination: PaginationOptions
  ): Promise<PaginatedResponse<CoreUser & { roles: Role[] }>> {
    let query = this.client
      .from('users_with_primary_roles')
      .select('*')

    // Apply filters
    if (filters.campus) {
      query = query.eq('campus', filters.campus)
    }
    
    if (filters.role) {
      query = query.eq('primary_role', filters.role)
    }
    
    if (typeof filters.is_active === 'boolean') {
      query = query.eq('is_active', filters.is_active)
    }
    
    if (filters.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }

    return this.paginatedQuery<CoreUser & { roles: Role[] }>(query, pagination)
  }

  /**
   * Get single user by ID with roles
   */
  async getUserById(userId: string): Promise<QueryResult<CoreUser & { roles: Role[] }>> {
    const query = this.client
      .from('users_with_primary_roles')
      .select('*')
      .eq('id', userId)

    return this.singleQuery(query)
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<QueryResult<CoreUser>> {
    const query = this.client
      .from('core_users')
      .select('*')
      .eq('email', email)

    return this.singleQuery(query)
  }

  /**
   * Create new user
   */
  async createUser(userData: CreateUserData): Promise<QueryResult<CoreUser>> {
    try {
      // First create user in Supabase Auth
      const { data: authUser, error: authError } = await this.client.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name,
            campus: userData.campus
          }
        }
      })

      if (authError) {
        throw authError
      }

      if (!authUser.user) {
        throw new Error('Failed to create auth user')
      }

      // Create user profile in core_users table
      const { data, error } = await this.client
        .from('core_users')
        .insert({
          id: authUser.user.id,
          email: userData.email,
          full_name: userData.full_name,
          phone: userData.phone,
          campus: userData.campus,
          avatar_url: userData.avatar_url,
          password_hash: '', // Managed by Supabase Auth
          is_active: true,
          email_verified: false
        })
        .select()
        .single()

      if (error) {
        // If profile creation fails, we should clean up the auth user
        await this.client.auth.admin.deleteUser(authUser.user.id)
        throw error
      }

      // Log activity
      await this.logActivity(
        authUser.user.id,
        'REGISTER',
        'user',
        authUser.user.id,
        `User ${userData.full_name} registered`,
        { email: userData.email, campus: userData.campus },
        userData.campus
      )

      return { data, error: null }
    } catch (error: unknown) {
      return { data: null, error: new Error(error instanceof Error ? error.message : String(error)) }
    }
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, updateData: UpdateUserData): Promise<QueryResult<CoreUser>> {
    try {
      const { data, error } = await this.client
        .from('core_users')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Log activity
      await this.logActivity(
        userId,
        'USER_UPDATE',
        'user',
        userId,
        'User profile updated',
        updateData as Record<string, unknown>
      )

      return { data, error: null }
    } catch (error: unknown) {
      return { data: null, error: new Error(error instanceof Error ? error.message : String(error)) }
    }
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId: string): Promise<QueryResult<boolean>> {
    try {
      const { error } = await this.client
        .from('core_users')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        throw error
      }

      // Log activity
      await this.logActivity(
        userId,
        'USER_DELETE',
        'user',
        userId,
        'User account deactivated'
      )

      return { data: true, error: null }
    } catch (error: unknown) {
      return { data: null, error: new Error(error instanceof Error ? error.message : String(error)) }
    }
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: string): Promise<QueryResult<Role[]>> {
    try {
      const { data, error } = await this.client
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('is_active', true)

      if (error) {
        throw error
      }

      const roles = data?.map(r => r.role) || []
      return { data: roles, error: null }
    } catch (error: unknown) {
      return { data: null, error: new Error(error instanceof Error ? error.message : String(error)) }
    }
  }

  /**
   * Add role to user
   */
  async addUserRole(
    userId: string, 
    role: Role, 
    organizationId?: string,
    isPrimary: boolean = false,
    assignedBy?: string
  ): Promise<QueryResult<boolean>> {
    try {
      const { error } = await this.client
        .from('user_roles')
        .insert({
          user_id: userId,
          role,
          organization_id: organizationId,
          is_primary: isPrimary,
          assigned_by: assignedBy
        })

      if (error) {
        throw error
      }

      // Log activity
      await this.logActivity(
        assignedBy || userId,
        'ROLE_CHANGE',
        'user_role',
        userId,
        `Role ${role} assigned to user`,
        { role, organization_id: organizationId, is_primary: isPrimary }
      )

      return { data: true, error: null }
    } catch (error: unknown) {
      return { data: null, error: new Error(error instanceof Error ? error.message : String(error)) }
    }
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.client
        .from('core_users')
        .update({ 
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
    } catch (error) {
      console.error('Failed to update last login:', error)
    }
  }
}

// Export singleton instance
export const usersService = new UsersService()