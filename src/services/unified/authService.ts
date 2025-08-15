/**
 * Unified Auth Service - Phase 3 Refactor
 * 
 * This service provides a unified interface that integrates:
 * - Supabase Auth (primary authentication)
 * - Legacy localStorage data (for migration period)
 * - Backwards compatibility with existing API
 */

import { authService as supabaseAuthService } from '@/lib/supabase/services'
import { User, UserWithPassword, LoginResponse, ApiResponse, UserRoleAssignment } from '@/types'
import { jwtUtils } from '@/lib/jwt'

// Legacy data imports for migration period
import { users as usersData } from '@/data/users'
import { memberCardService } from '../dataService'

class UnifiedAuthService {
  private useLegacyMode = false // Toggle for gradual migration

  constructor() {
    // Check if Supabase is available and properly configured
    this.checkSupabaseAvailability()
  }

  private async checkSupabaseAvailability() {
    try {
      const session = await supabaseAuthService.getCurrentSession()
      this.useLegacyMode = false
      console.log('🔧 Unified Auth Service: Using Supabase mode')
    } catch (error) {
      console.warn('⚠️ Supabase not available, falling back to legacy mode:', error)
      this.useLegacyMode = true
    }
  }

  /**
   * Register new user
   */
  async register(email: string, password: string, name: string, phone: string): Promise<LoginResponse> {
    if (!this.useLegacyMode) {
      try {
        const result = await supabaseAuthService.register(email, password, name, phone)
        
        if (result.success && result.user && result.session) {
          return {
            success: true,
            user_id: result.user.id,
            jwt: result.session.access_token
          }
        } else {
          return { 
            success: false, 
            error: result.error || 'Registration failed' 
          }
        }
      } catch (error) {
        console.error('Supabase registration failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    return this.legacyRegister(email, password, name, phone)
  }

  /**
   * User login
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    if (!this.useLegacyMode) {
      try {
        const result = await supabaseAuthService.signIn(email, password)
        
        if (result.success && result.user && result.session) {
          return {
            success: true,
            user_id: result.user.id,
            jwt: result.session.access_token
          }
        } else {
          return { 
            success: false, 
            error: result.error || 'INVALID_CREDENTIALS' 
          }
        }
      } catch (error) {
        console.error('Supabase login failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    return this.legacyLogin(email, password)
  }

  /**
   * Get user by ID
   */
  async getUser(id: number | string): Promise<User | null> {
    if (!this.useLegacyMode) {
      try {
        const userId = typeof id === 'number' ? id.toString() : id
        const profile = await supabaseAuthService.getUserProfile(userId)
        
        if (profile) {
          // Convert Supabase user to legacy format for compatibility
          return {
            ...profile,
            id: typeof id === 'number' ? parseInt(profile.id) : profile.id
          } as User
        }
      } catch (error) {
        console.error('Supabase getUser failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    const numericId = typeof id === 'string' ? parseInt(id) : id
    const legacyUsers: UserWithPassword[] = [...usersData] as UserWithPassword[]
    return legacyUsers.find(user => user.id === numericId) || null
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: number | string) {
    if (!this.useLegacyMode) {
      try {
        const userIdStr = typeof userId === 'number' ? userId.toString() : userId
        const result = await supabaseAuthService.getUserRoles(userIdStr)
        
        if (result.success) {
          // Convert to legacy format
          const activeRoles = result.data.map(role => ({
            id: Date.now(),
            user_id: typeof userId === 'number' ? userId : parseInt(userId),
            role: role.role,
            granted_by: role.granted_by || 'system',
            granted_at: role.created_at || new Date().toISOString(),
            is_active: role.is_active
          }))
          return { success: true, data: activeRoles }
        }
      } catch (error) {
        console.error('Supabase getUserRoles failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    return this.legacyGetUserRoles(typeof userId === 'string' ? parseInt(userId) : userId)
  }

  /**
   * Update user roles
   */
  async updateUserRoles(userId: number | string, roles: string[], adminId: number | string) {
    if (!this.useLegacyMode) {
      try {
        const userIdStr = typeof userId === 'number' ? userId.toString() : userId
        const adminIdStr = typeof adminId === 'number' ? adminId.toString() : adminId
        
        const result = await supabaseAuthService.updateUserRoles(
          userIdStr, 
          roles as any[], 
          adminIdStr
        )
        
        if (result.success) {
          return { success: true, data: { roles } }
        }
      } catch (error) {
        console.error('Supabase updateUserRoles failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    return this.legacyUpdateUserRoles(
      typeof userId === 'string' ? parseInt(userId) : userId,
      roles,
      typeof adminId === 'string' ? parseInt(adminId) : adminId
    )
  }

  /**
   * Update user status
   */
  async updateUserStatus(
    userId: number | string, 
    status: 'non_member' | 'activated' | 'expired' | 'test',
    adminId: number | string
  ) {
    if (!this.useLegacyMode) {
      try {
        const userIdStr = typeof userId === 'number' ? userId.toString() : userId
        const adminIdStr = typeof adminId === 'number' ? adminId.toString() : adminId
        
        const result = await supabaseAuthService.updateUserStatus(userIdStr, status, adminIdStr)
        
        if (result.success) {
          const user = await this.getUser(userId)
          return { success: true, data: user }
        }
      } catch (error) {
        console.error('Supabase updateUserStatus failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    return this.legacyUpdateUserStatus(
      typeof userId === 'string' ? parseInt(userId) : userId,
      status,
      typeof adminId === 'string' ? parseInt(adminId) : adminId
    )
  }

  /**
   * Get all users with roles
   */
  async getAllUsersWithRoles() {
    if (!this.useLegacyMode) {
      try {
        const result = await supabaseAuthService.getAllUsersWithRoles()
        
        if (result.success) {
          // Convert to legacy format for compatibility
          const usersWithRoles = result.data.map(user => ({
            ...user,
            id: parseInt(user.id) // Convert string ID to number for legacy compatibility
          }))
          return { success: true, data: usersWithRoles }
        }
      } catch (error) {
        console.error('Supabase getAllUsersWithRoles failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    return this.legacyGetAllUsersWithRoles()
  }

  /**
   * Create new user (admin only)
   */
  async createUser(
    userData: {
      name: string
      email: string
      phone?: string
      password: string
      roles: string[]
      membership_status?: string
      campus?: string
    },
    adminId: number | string
  ) {
    if (!this.useLegacyMode) {
      try {
        const adminIdStr = typeof adminId === 'number' ? adminId.toString() : adminId
        
        const result = await supabaseAuthService.createUser({
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          roles: userData.roles as any[],
          membership_status: userData.membership_status,
          campus: userData.campus
        }, adminIdStr)
        
        if (result.success) {
          return { 
            success: true, 
            data: { 
              ...result.data,
              id: parseInt(result.data.id) // Convert to legacy format
            }
          }
        } else {
          return { success: false, error: result.error }
        }
      } catch (error) {
        console.error('Supabase createUser failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    return this.legacyCreateUser(userData, typeof adminId === 'string' ? parseInt(adminId) : adminId)
  }

  /**
   * Update user profile
   */
  async updateUser(userData: any, adminId: number | string) {
    if (!this.useLegacyMode) {
      try {
        const userIdStr = typeof userData.id === 'number' ? userData.id.toString() : userData.id
        
        const result = await supabaseAuthService.updateUserProfile(userIdStr, {
          name: userData.name,
          phone: userData.phone,
          campus: userData.campus,
          avatar_url: userData.avatar_url
        })
        
        if (result.success) {
          const updatedUser = await this.getUser(userData.id)
          return { success: true, data: updatedUser }
        } else {
          return { success: false, error: result.error }
        }
      } catch (error) {
        console.error('Supabase updateUser failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    return this.legacyUpdateUser(userData, typeof adminId === 'string' ? parseInt(adminId) : adminId)
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: number | string, adminId: number | string) {
    if (!this.useLegacyMode) {
      try {
        const userIdStr = typeof userId === 'number' ? userId.toString() : userId
        const adminIdStr = typeof adminId === 'number' ? adminId.toString() : adminId
        
        const result = await supabaseAuthService.deleteUser(userIdStr, adminIdStr)
        
        if (result.success) {
          return { success: true, data: true }
        } else {
          return { success: false, error: result.error }
        }
      } catch (error) {
        console.error('Supabase deleteUser failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    return this.legacyDeleteUser(
      typeof userId === 'string' ? parseInt(userId) : userId,
      typeof adminId === 'string' ? parseInt(adminId) : adminId
    )
  }

  /**
   * Update user account status
   */
  async updateUserAccountStatus(
    userId: number | string,
    status: 'ACTIVE' | 'SUSPENDED',
    adminId: number | string
  ) {
    if (!this.useLegacyMode) {
      try {
        const userIdStr = typeof userId === 'number' ? userId.toString() : userId
        const adminIdStr = typeof adminId === 'number' ? adminId.toString() : adminId
        
        const result = await supabaseAuthService.updateUserAccountStatus(userIdStr, status, adminIdStr)
        
        if (result.success) {
          const updatedUser = await this.getUser(userId)
          return { success: true, data: updatedUser }
        } else {
          return { success: false, error: result.error }
        }
      } catch (error) {
        console.error('Supabase updateUserAccountStatus failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    return this.legacyUpdateUserAccountStatus(
      typeof userId === 'string' ? parseInt(userId) : userId,
      status,
      typeof adminId === 'string' ? parseInt(adminId) : adminId
    )
  }

  /**
   * Auto update membership status
   */
  async autoUpdateMembershipStatus(userId: number | string) {
    if (!this.useLegacyMode) {
      try {
        const userIdStr = typeof userId === 'number' ? userId.toString() : userId
        return await supabaseAuthService.autoUpdateMembershipStatus(userIdStr)
      } catch (error) {
        console.error('Supabase autoUpdateMembershipStatus failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    // Legacy mode implementation
    return this.legacyAutoUpdateMembershipStatus(typeof userId === 'string' ? parseInt(userId) : userId)
  }

  // Legacy implementations (existing code from dataService.ts)
  private async legacyRegister(email: string, password: string, name: string, phone: string): Promise<LoginResponse> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(500)
    
    const users: UserWithPassword[] = [...usersData] as UserWithPassword[]
    
    const existingUser = users.find(user => user.email === email)
    if (existingUser) {
      return { success: false, error: 'EMAIL_ALREADY_EXISTS' }
    }
    
    const generateId = (array: { id: number }[]): number => {
      return Math.max(0, ...array.map(item => item.id)) + 1
    }

    const newUser: UserWithPassword = {
      id: generateId(users),
      name,
      email,
      phone,
      password: `$2b$10$${password}`,
      roles: ['STUDENT'],
      membership_status: 'non_member',
      account_status: 'ACTIVE',
      campus: '羅斯福校',
      created_at: new Date().toISOString()
    }
    
    users.push(newUser)
    
    const jwt = jwtUtils.generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.roles[0]
    })
    
    return {
      success: true,
      user_id: newUser.id,
      jwt
    }
  }

  private async legacyLogin(email: string, password: string): Promise<LoginResponse> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(500)
    
    const users: UserWithPassword[] = [...usersData] as UserWithPassword[]
    const user = users.find(u => u.email === email)
    
    if (!user) {
      return { success: false, error: 'INVALID_CREDENTIALS' }
    }
    
    const isValidPassword = password === 'password' || password === user.password
    
    if (!isValidPassword) {
      return { success: false, error: 'INVALID_CREDENTIALS' }
    }
    
    const jwt = jwtUtils.generateToken({
      userId: user.id,
      email: user.email,
      role: user.roles[0] || 'STUDENT'
    })
    
    return {
      success: true,
      user_id: user.id,
      jwt
    }
  }

  private async legacyGetUserRoles(userId: number) {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)
    
    try {
      const users: UserWithPassword[] = [...usersData] as UserWithPassword[]
      const user = users.find(u => u.id === userId)
      
      if (!user) {
        return { success: false, error: 'User not found' }
      }
      
      const activeRoles = user.roles.map(role => ({
        id: Date.now(),
        user_id: userId,
        role: role,
        granted_by: 6,
        granted_at: new Date().toISOString(),
        is_active: true
      }))
      
      return { success: true, data: activeRoles }
    } catch (error) {
      console.error('獲取用戶角色失敗:', error)
      return { success: false, error: 'Failed to get user roles' }
    }
  }

  private async legacyUpdateUserRoles(userId: number, roles: string[], adminId: number) {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(500)
    
    try {
      // Implementation from original dataService
      const timestamp = new Date().toISOString()
      const users: UserWithPassword[] = [...usersData] as UserWithPassword[]
      
      const userIndex = users.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        users[userIndex].roles = roles as any[]
        users[userIndex].updated_at = timestamp
        
        if (typeof localStorage !== 'undefined') {
          const localUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[]
          const localUserIndex = localUsers.findIndex((u: User) => u.id === userId)
          if (localUserIndex !== -1) {
            localUsers[localUserIndex].roles = roles as any[]
            localUsers[localUserIndex].updated_at = timestamp
            localStorage.setItem('users', JSON.stringify(localUsers))
          }
        }
      }
      
      let userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]')
      
      userRoles = userRoles.map((ur: UserRoleAssignment) => 
        ur.user_id === userId ? { ...ur, is_active: false } : ur
      )
      
      roles.forEach(role => {
        const newRole = {
          id: Math.max(0, ...userRoles.map((r: UserRoleAssignment) => r.id)) + 1,
          user_id: userId,
          role: role,
          granted_by: adminId,
          granted_at: timestamp,
          is_active: true
        }
        userRoles.push(newRole)
      })
      
      localStorage.setItem('userRoles', JSON.stringify(userRoles))
      
      return { success: true, data: { roles } }
    } catch (error) {
      console.error('更新用戶角色失敗:', error)
      return { success: false, error: 'Failed to update user roles' }
    }
  }

  private async legacyUpdateUserStatus(
    userId: number, 
    status: 'non_member' | 'activated' | 'expired' | 'test', 
    adminId: number
  ) {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(300)
    
    try {
      const users: UserWithPassword[] = [...usersData] as UserWithPassword[]
      const userIndex = users.findIndex(u => u.id === userId)
      
      if (userIndex === -1) {
        return { success: false, error: 'User not found' }
      }
      
      const now = new Date().toISOString()
      users[userIndex].membership_status = status
      users[userIndex].updated_at = now
      
      if (typeof localStorage !== 'undefined') {
        const localUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[]
        const localUserIndex = localUsers.findIndex((u: User) => u.id === userId)
        if (localUserIndex !== -1) {
          localUsers[localUserIndex].membership_status = status
          localUsers[localUserIndex].updated_at = now
          localStorage.setItem('users', JSON.stringify(localUsers))
        }
      }
      
      return { success: true, data: users[userIndex] }
    } catch (error) {
      console.error('更新用戶狀態失敗:', error)
      return { success: false, error: 'Failed to update user status' }
    }
  }

  private async legacyGetAllUsersWithRoles() {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(300)
    
    try {
      const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]')
      const users: UserWithPassword[] = [...usersData] as UserWithPassword[]
      
      const usersWithRoles = users.map(user => {
        const activeRoles = userRoles
          .filter((ur: UserRoleAssignment) => ur.user_id === user.id && ur.is_active)
          .map((ur: UserRoleAssignment) => ur.role)
        
        return {
          ...user,
          roles: activeRoles.length > 0 ? activeRoles : user.roles
        }
      })
      
      return { success: true, data: usersWithRoles }
    } catch (error) {
      console.error('獲取用戶和角色失敗:', error)
      return { success: false, error: 'Failed to get users with roles' }
    }
  }

  private async legacyCreateUser(
    userData: {
      name: string
      email: string
      phone?: string
      password: string
      roles: string[]
      membership_status?: string
      campus?: string
    },
    adminId: number
  ) {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(500)
    
    try {
      const users: UserWithPassword[] = [...usersData] as UserWithPassword[]
      const timestamp = new Date().toISOString()
      const newId = Math.max(0, ...users.map(u => u.id)) + 1
      
      // Check if email already exists
      const existingUser = users.find(u => u.email === userData.email)
      if (existingUser) {
        return { success: false, error: 'Email already exists' }
      }
      
      const newUser: UserWithPassword = {
        id: newId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        password: userData.password,
        roles: userData.roles as any[],
        membership_status: userData.membership_status as any || 'non_member',
        account_status: 'ACTIVE',
        campus: userData.campus as any || '羅斯福校',
        created_at: timestamp,
        updated_at: timestamp
      }
      
      users.push(newUser)
      
      // Sync to localStorage
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[]
      localUsers.push(newUser)
      localStorage.setItem('users', JSON.stringify(localUsers))
      
      console.log('✅ 新用戶已創建:', newUser)
      return { success: true, data: newUser }
    } catch (error) {
      console.error('創建用戶失敗:', error)
      return { success: false, error: 'Failed to create user' }
    }
  }

  private async legacyUpdateUser(userData: any, adminId: number) {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(300)
    
    try {
      const users: UserWithPassword[] = [...usersData] as UserWithPassword[]
      const userIndex = users.findIndex(u => u.id === userData.id)
      if (userIndex === -1) {
        return { success: false, error: 'User not found' }
      }
      
      // Check if email conflicts with other users
      const existingUser = users.find(u => u.email === userData.email && u.id !== userData.id)
      if (existingUser) {
        return { success: false, error: 'Email already exists' }
      }
      
      const timestamp = new Date().toISOString()
      users[userIndex] = {
        ...users[userIndex],
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        roles: userData.roles,
        membership_status: userData.membership_status,
        campus: userData.campus,
        updated_at: timestamp
      }
      
      // Sync to localStorage
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[]
      const localUserIndex = localUsers.findIndex((u: User) => u.id === userData.id)
      if (localUserIndex !== -1) {
        localUsers[localUserIndex] = users[userIndex]
        localStorage.setItem('users', JSON.stringify(localUsers))
      }
      
      console.log('✅ 用戶資訊已更新:', users[userIndex])
      return { success: true, data: users[userIndex] }
    } catch (error) {
      console.error('更新用戶失敗:', error)
      return { success: false, error: 'Failed to update user' }
    }
  }

  private async legacyDeleteUser(userId: number, adminId: number) {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(300)
    
    try {
      const users: UserWithPassword[] = [...usersData] as UserWithPassword[]
      const userIndex = users.findIndex(u => u.id === userId)
      if (userIndex === -1) {
        return { success: false, error: 'User not found' }
      }
      
      // Prevent deleting yourself
      if (userId === adminId) {
        return { success: false, error: 'Cannot delete yourself' }
      }
      
      const deletedUser = users[userIndex]
      users.splice(userIndex, 1)
      
      // Sync to localStorage
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[]
      const localUserIndex = localUsers.findIndex((u: User) => u.id === userId)
      if (localUserIndex !== -1) {
        localUsers.splice(localUserIndex, 1)
        localStorage.setItem('users', JSON.stringify(localUsers))
      }
      
      // Also delete related role records
      let userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]')
      userRoles = userRoles.filter((ur: UserRoleAssignment) => ur.user_id !== userId)
      localStorage.setItem('userRoles', JSON.stringify(userRoles))
      
      console.log('✅ 用戶已刪除:', deletedUser)
      return { success: true, data: deletedUser }
    } catch (error) {
      console.error('刪除用戶失敗:', error)
      return { success: false, error: 'Failed to delete user' }
    }
  }

  private async legacyUpdateUserAccountStatus(
    userId: number,
    status: 'ACTIVE' | 'SUSPENDED',
    adminId: number
  ) {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(300)
    
    try {
      const users: UserWithPassword[] = [...usersData] as UserWithPassword[]
      const userIndex = users.findIndex(u => u.id === userId)
      if (userIndex === -1) {
        return { success: false, error: 'User not found' }
      }
      
      const now = new Date().toISOString()
      users[userIndex].account_status = status
      users[userIndex].updated_at = now
      
      // Sync to localStorage
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[]
      const localUserIndex = localUsers.findIndex((u: User) => u.id === userId)
      if (localUserIndex !== -1) {
        localUsers[localUserIndex].account_status = status
        localUsers[localUserIndex].updated_at = now
        localStorage.setItem('users', JSON.stringify(localUsers))
      }
      
      console.log('✅ 用戶帳號狀態已更新:', { userId, status, adminId })
      return { success: true, data: users[userIndex] }
    } catch (error) {
      console.error('更新用戶帳號狀態失敗:', error)
      return { success: false, error: 'Failed to update user account status' }
    }
  }

  private async legacyAutoUpdateMembershipStatus(userId: number) {
    try {
      const users: UserWithPassword[] = [...usersData] as UserWithPassword[]
      const user = users.find(u => u.id === userId)
      if (!user) return { success: false, error: 'User not found' }

      let newStatus: 'non_member' | 'activated' | 'expired' | 'test' = 'non_member'

      if (!user.roles.includes('STUDENT')) {
        newStatus = 'non_member'
      } else {
        const activeMembership = await memberCardService.getMembership(userId)
        if (activeMembership) {
          if (activeMembership.status === 'activated') {
            const now = new Date()
            const expireTime = new Date(activeMembership.expiry_date || '')
            if (expireTime > now) {
              newStatus = 'activated'
            } else {
              newStatus = 'expired'
            }
          } else if (activeMembership.status === 'expired') {
            newStatus = 'expired'
          }
        }
      }

      if (user.membership_status !== newStatus) {
        const userIndex = users.findIndex(u => u.id === userId)
        if (userIndex !== -1) {
          users[userIndex].membership_status = newStatus
          users[userIndex].updated_at = new Date().toISOString()

          if (typeof localStorage !== 'undefined') {
            const localUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[]
            const localUserIndex = localUsers.findIndex((u: User) => u.id === userId)
            if (localUserIndex !== -1) {
              localUsers[localUserIndex].membership_status = newStatus
              localUsers[localUserIndex].updated_at = new Date().toISOString()
              localStorage.setItem('users', JSON.stringify(localUsers))
            }
          }
        }
      }

      return { success: true, data: { userId, newStatus } }
    } catch (error) {
      console.error('自動更新會員狀態失敗:', error)
      return { success: false, error: 'Failed to auto update membership status' }
    }
  }
}

export const authService = new UnifiedAuthService()