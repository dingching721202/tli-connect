/**
 * Unified Agent Service - Phase 3 Refactor
 * 
 * This service provides a unified interface that integrates:
 * - Supabase Agents table (primary, when implemented)
 * - Legacy agent data (current implementation)
 * - Backwards compatibility with existing API
 */

import { Agent } from '@/data/agents'
import { SalesRecord } from '@/types/sales'

// Legacy data import
import { agents as agentsData } from '@/data/agents'

class UnifiedAgentService {
  private useLegacyMode = true // Start with legacy mode
  private agents: Agent[] = [...agentsData]

  constructor() {
    // For now, we'll use legacy mode as Supabase agents table may not be ready
    this.useLegacyMode = true
    console.log('🔧 Unified Agent Service: Using Legacy mode')
  }

  /**
   * Get all agents
   */
  async getAllAgents(): Promise<Agent[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase agents query
        // const result = await supabaseAgentsService.getAllAgents()
        // return result.data
        return this.legacyGetAllAgents()
      } catch (error) {
        console.error('Supabase getAllAgents failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyGetAllAgents()
  }

  /**
   * Get agent by user ID
   */
  async getAgentByUserId(userId: number): Promise<Agent | null> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase agent by user ID query
        return this.legacyGetAgentByUserId(userId)
      } catch (error) {
        console.error('Supabase getAgentByUserId failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyGetAgentByUserId(userId)
  }

  /**
   * Get agent by ID
   */
  async getAgentById(agentId: number): Promise<Agent | null> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase agent by ID query
        return this.legacyGetAgentById(agentId)
      } catch (error) {
        console.error('Supabase getAgentById failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyGetAgentById(agentId)
  }

  /**
   * Get agent by code
   */
  async getAgentByCode(agentCode: string): Promise<Agent | null> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase agent by code query
        return this.legacyGetAgentByCode(agentCode)
      } catch (error) {
        console.error('Supabase getAgentByCode failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyGetAgentByCode(agentCode)
  }

  /**
   * Get agent sales records
   */
  async getAgentSalesRecords(agentUserId: number): Promise<SalesRecord[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase sales records query
        return this.legacyGetAgentSalesRecords(agentUserId)
      } catch (error) {
        console.error('Supabase getAgentSalesRecords failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyGetAgentSalesRecords(agentUserId)
  }

  /**
   * Update agent
   */
  async updateAgent(agentId: number, updateData: Partial<Agent>): Promise<boolean> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase agent update
        return this.legacyUpdateAgent(agentId, updateData)
      } catch (error) {
        console.error('Supabase updateAgent failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyUpdateAgent(agentId, updateData)
  }

  /**
   * Check if user is an agent
   */
  async isUserAgent(userId: number): Promise<boolean> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase user agent check
        return this.legacyIsUserAgent(userId)
      } catch (error) {
        console.error('Supabase isUserAgent failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyIsUserAgent(userId)
  }

  /**
   * Create new agent
   */
  async createAgent(agentData: Omit<Agent, 'id' | 'created_at' | 'updated_at'>): Promise<Agent> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase agent creation
        return this.legacyCreateAgent(agentData)
      } catch (error) {
        console.error('Supabase createAgent failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyCreateAgent(agentData)
  }

  /**
   * Get agent statistics
   */
  async getAgentStatistics(agentId?: number) {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase agent statistics
        return this.legacyGetAgentStatistics(agentId)
      } catch (error) {
        console.error('Supabase getAgentStatistics failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyGetAgentStatistics(agentId)
  }

  /**
   * Get agents by status
   */
  async getAgentsByStatus(status: Agent['status']): Promise<Agent[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase agents by status query
        return this.legacyGetAgentsByStatus(status)
      } catch (error) {
        console.error('Supabase getAgentsByStatus failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyGetAgentsByStatus(status)
  }

  /**
   * Update agent performance metrics
   */
  async updateAgentPerformance(agentId: number, saleAmount: number) {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase agent performance update
        return this.legacyUpdateAgentPerformance(agentId, saleAmount)
      } catch (error) {
        console.error('Supabase updateAgentPerformance failed, falling back to legacy:', error)
        this.useLegacyMode = true
      }
    }

    return this.legacyUpdateAgentPerformance(agentId, saleAmount)
  }

  // ===== Legacy implementations =====

  private async legacyGetAllAgents(): Promise<Agent[]> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)
    return [...this.agents]
  }

  private async legacyGetAgentByUserId(userId: number): Promise<Agent | null> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)
    return this.agents.find(agent => agent.user_id === userId) || null
  }

  private async legacyGetAgentById(agentId: number): Promise<Agent | null> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)
    return this.agents.find(agent => agent.id === agentId) || null
  }

  private async legacyGetAgentByCode(agentCode: string): Promise<Agent | null> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)
    return this.agents.find(agent => agent.agent_code === agentCode) || null
  }

  private async legacyGetAgentSalesRecords(agentUserId: number): Promise<SalesRecord[]> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)
    
    const agent = this.agents.find(a => a.user_id === agentUserId)
    if (!agent) return []
    
    // Return empty array for now - in a real implementation, 
    // this would query the sales records table
    return []
  }

  private async legacyUpdateAgent(agentId: number, updateData: Partial<Agent>): Promise<boolean> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(300)
    
    const index = this.agents.findIndex(agent => agent.id === agentId)
    if (index === -1) return false
    
    this.agents[index] = {
      ...this.agents[index],
      ...updateData,
      updated_at: new Date().toISOString()
    }
    
    return true
  }

  private async legacyIsUserAgent(userId: number): Promise<boolean> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return this.agents.some(agent => agent.user_id === userId)
  }

  private async legacyCreateAgent(agentData: Omit<Agent, 'id' | 'created_at' | 'updated_at'>): Promise<Agent> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(500)
    
    const newId = Math.max(0, ...this.agents.map(a => a.id)) + 1
    const now = new Date().toISOString()
    
    const newAgent: Agent = {
      ...agentData,
      id: newId,
      created_at: now,
      updated_at: now
    }
    
    this.agents.push(newAgent)
    return newAgent
  }

  private async legacyGetAgentStatistics(agentId?: number) {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)
    
    const targetAgents = agentId ? 
      this.agents.filter(a => a.id === agentId) : 
      this.agents
    
    const totalAgents = targetAgents.length
    const activeAgents = targetAgents.filter(a => a.status === 'ACTIVE').length
    const totalSales = targetAgents.reduce((sum, a) => sum + a.total_sales, 0)
    const totalCommission = targetAgents.reduce((sum, a) => sum + a.total_commission, 0)
    const totalSalesCount = targetAgents.reduce((sum, a) => sum + a.sales_count, 0)
    
    return {
      totalAgents,
      activeAgents,
      inactiveAgents: totalAgents - activeAgents,
      totalSales,
      totalCommission,
      totalSalesCount,
      averageCommissionRate: totalAgents > 0 ? 
        targetAgents.reduce((sum, a) => sum + a.commission_rate, 0) / totalAgents : 0
    }
  }

  private async legacyGetAgentsByStatus(status: Agent['status']): Promise<Agent[]> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)
    return this.agents.filter(agent => agent.status === status)
  }

  private async legacyUpdateAgentPerformance(agentId: number, saleAmount: number) {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(300)
    
    const agent = this.agents.find(a => a.id === agentId)
    if (!agent) return false
    
    const commission = saleAmount * (agent.commission_rate / 100)
    
    agent.total_sales += saleAmount
    agent.total_commission += commission
    agent.sales_count += 1
    agent.last_sale_date = new Date().toISOString().split('T')[0]
    agent.updated_at = new Date().toISOString()
    
    return true
  }
}

export const agentService = new UnifiedAgentService()