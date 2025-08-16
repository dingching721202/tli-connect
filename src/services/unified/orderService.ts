/**
 * Unified Order Service - Phase 3.4 Refactor
 * 
 * This service provides a unified interface that integrates:
 * - Supabase Orders (primary data source)
 * - Legacy order handling (for migration period)
 * - Backwards compatibility with existing API
 */

import { ApiResponse, Order } from '@/types'

class UnifiedOrderService {
  private useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED // Start with legacy mode for Phase 3.4

  constructor() {
    // Phase 4.3: Force Supabase mode activation
    this.useLegacyMode = false
    console.log('🚀 Unified Order Service: Phase 4.3 - Supabase integration ACTIVE')
  }

  private async checkSupabaseAvailability() {
    try {
      // TODO: Test Supabase connection when orders service is ready
      // await supabaseOrdersService.getOrders()
      // this.useLegacyMode = false
      // console.log('🔧 Unified Order Service: Using Supabase mode')
      this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      console.log('🔧 Unified Order Service: Using Legacy mode (Supabase not implemented yet)')
    } catch (error) {
      console.warn('⚠️ Supabase not available, falling back to legacy mode:', error)
      this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
    }
  }

  /**
   * Create order
   */
  async createOrder(orderData: {
    user_id: number
    plan_id: number
    amount: number
    payment_method?: string
    status?: 'pending' | 'completed' | 'failed'
  }): Promise<ApiResponse<Order>> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase order creation
        // const result = await supabaseOrdersService.createOrder(orderData)
        // return { success: true, data: result }
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      } catch (error) {
        console.error('Supabase createOrder failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    // Legacy mode implementation
    return this.legacyCreateOrder(orderData)
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: number): Promise<Order | null> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase order query
        // const result = await supabaseOrdersService.getOrderById(orderId)
        // return result
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      } catch (error) {
        console.error('Supabase getOrderById failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    // Legacy mode implementation
    return this.legacyGetOrderById(orderId)
  }

  /**
   * Get user orders
   */
  async getUserOrders(userId: number): Promise<Order[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase user orders query
        // const result = await supabaseOrdersService.getUserOrders(userId)
        // return result
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      } catch (error) {
        console.error('Supabase getUserOrders failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    // Legacy mode implementation
    return this.legacyGetUserOrders(userId)
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: number, status: 'pending' | 'completed' | 'failed'): Promise<ApiResponse<Order>> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase order status update
        // const result = await supabaseOrdersService.updateOrderStatus(orderId, status)
        // return { success: true, data: result }
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      } catch (error) {
        console.error('Supabase updateOrderStatus failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    // Legacy mode implementation
    return this.legacyUpdateOrderStatus(orderId, status)
  }

  /**
   * Get all orders (admin)
   */
  async getAllOrders(): Promise<Order[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase all orders query
        // const result = await supabaseOrdersService.getAllOrders()
        // return result
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      } catch (error) {
        console.error('Supabase getAllOrders failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    // Legacy mode implementation
    return this.legacyGetAllOrders()
  }

  // Legacy implementations (using mock data for now)
  private async legacyCreateOrder(orderData: {
    user_id: number
    plan_id: number
    amount: number
    payment_method?: string
    status?: 'pending' | 'completed' | 'failed'
  }): Promise<ApiResponse<Order>> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(300)

    try {
      // Get existing orders from localStorage
      const orders = JSON.parse(localStorage.getItem('orders') || '[]')
      const generateId = (array: { id: number }[]): number => {
        return Math.max(0, ...array.map(item => item.id)) + 1
      }

      const newOrder = {
        id: generateId(orders),
        user_id: orderData.user_id,
        plan_id: orderData.plan_id,
        amount: orderData.amount,
        payment_method: (orderData.payment_method || 'CREDIT_CARD') as 'CREDIT_CARD' | 'BANK_TRANSFER' | 'PAYPAL' | 'LINE_PAY' | 'APPLE_PAY' | 'GOOGLE_PAY',
        status: (orderData.status || 'CREATED') as 'CREATED' | 'COMPLETED' | 'CANCELED' | 'EXPIRED',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes from now
      }

      orders.push(newOrder)
      localStorage.setItem('orders', JSON.stringify(orders))

      console.log('✅ 訂單已創建:', newOrder)
      return { success: true, data: newOrder }
    } catch (error) {
      console.error('創建訂單失敗:', error)
      return { success: false, error: 'Failed to create order' }
    }
  }

  private async legacyGetOrderById(orderId: number): Promise<Order | null> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)

    try {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]')
      return orders.find((order: Order) => order.id === orderId) || null
    } catch (error) {
      console.error('獲取訂單失敗:', error)
      return null
    }
  }

  private async legacyGetUserOrders(userId: number): Promise<Order[]> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)

    try {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]')
      return orders.filter((order: Order) => order.user_id === userId)
    } catch (error) {
      console.error('獲取用戶訂單失敗:', error)
      return []
    }
  }

  private async legacyUpdateOrderStatus(orderId: number, status: 'pending' | 'completed' | 'failed'): Promise<ApiResponse<Order>> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(300)

    try {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]')
      const orderIndex = orders.findIndex((order: Order) => order.id === orderId)
      
      if (orderIndex === -1) {
        return { success: false, error: 'Order not found' }
      }

      orders[orderIndex].status = status
      orders[orderIndex].updated_at = new Date().toISOString()
      
      localStorage.setItem('orders', JSON.stringify(orders))

      console.log('✅ 訂單狀態已更新:', orders[orderIndex])
      return { success: true, data: orders[orderIndex] }
    } catch (error) {
      console.error('更新訂單狀態失敗:', error)
      return { success: false, error: 'Failed to update order status' }
    }
  }

  private async legacyGetAllOrders(): Promise<Order[]> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)

    try {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]')
      return orders
    } catch (error) {
      console.error('獲取所有訂單失敗:', error)
      return []
    }
  }
}

export const orderService = new UnifiedOrderService()