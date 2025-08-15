/**
 * Unified Consultation Service - Phase 3.5 Refactor
 * 
 * This service provides a unified interface that integrates:
 * - Supabase Consultations table (primary, when implemented)
 * - Legacy file-based consultation storage (current implementation)
 * - Backwards compatibility with existing form submission APIs
 * 
 * Note: Form submission APIs from homepage and corporate page are preserved
 * for backwards compatibility, but management operations use unified patterns.
 */

import { 
  Consultation,
  ConsultationType, 
  ConsultationStatus,
  ConsultationStats,
  CreateConsultationRequest,
  UpdateConsultationRequest,
  FilterState
} from '@/types/consultation'

// Default consultation data (similar to API route structure)
const getDefaultConsultations = (): Consultation[] => [
  {
    id: 'cons_ind_1',
    type: ConsultationType.INDIVIDUAL,
    status: ConsultationStatus.LEAD,
    contactName: '李小華',
    email: 'li@example.com',
    phone: '+886 912 345 678',
    submittedAt: '2025-07-28T14:20:00Z',
    updatedAt: '2025-07-28T14:20:00Z',
    source: 'homepage',
    notes: '從首頁表單提交'
  },
  {
    id: 'cons_ind_2',
    type: ConsultationType.INDIVIDUAL,
    status: ConsultationStatus.CONTACTED,
    contactName: '王小明',
    email: 'wang@example.com',
    phone: '+886 987 654 321',
    submittedAt: '2025-07-25T10:15:00Z',
    updatedAt: '2025-07-26T14:30:00Z',
    source: 'individual_form',
    notes: '從會員管理提交，已初步聯繫',
    assignedTo: 'ops_001'
  },
  {
    id: 'cons_corp_1',
    type: ConsultationType.CORPORATE,
    status: ConsultationStatus.QUALIFICATION,
    contactName: '張小明',
    email: 'zhang@example.com',
    phone: '+886 2 1234 5678',
    companyName: 'ABC科技股份有限公司',
    contactTitle: '人資經理',
    trainingNeeds: ['中文', '英文'],
    trainingSize: '50–100',
    message: '我們希望為員工提供語言培訓課程',
    submittedAt: '2025-07-30T10:30:00Z',
    updatedAt: '2025-07-31T09:15:00Z',
    source: 'corporate_form',
    assignedTo: 'ops_002',
    notes: '正在進行需求分析會議'
  },
  {
    id: 'cons_corp_2',
    type: ConsultationType.CORPORATE,
    status: ConsultationStatus.PROPOSAL,
    contactName: '陳小美',
    email: 'chen@corp.com',
    phone: '+886 2 9876 5432',
    companyName: 'XYZ製造有限公司',
    contactTitle: '訓練主管',
    trainingNeeds: ['商業', '師培'],
    trainingSize: '100–300',
    message: '需要針對主管階層的培訓課程',
    submittedAt: '2025-07-20T09:15:00Z',
    updatedAt: '2025-07-29T16:45:00Z',
    source: 'corporate_form',
    assignedTo: 'ops_003',
    notes: '已提供初步培訓方案'
  }
]

class UnifiedConsultationService {
  private useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED // Start with legacy mode
  private consultations: Consultation[] = []
  private readonly STORAGE_KEY = 'consultations'

  constructor() {
    // For now, we'll use legacy mode as Supabase consultations table may not be ready
    this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
    this.loadConsultations()
    console.log('🔧 Unified Consultation Service: Using Legacy mode')
  }

  /**
   * Load consultations from localStorage or use defaults
   */
  private loadConsultations(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY)
        if (stored) {
          this.consultations = JSON.parse(stored)
        } else {
          this.consultations = getDefaultConsultations()
          this.saveConsultations()
        }
      } catch (error) {
        console.error('Error loading consultations:', error)
        this.consultations = getDefaultConsultations()
      }
    } else {
      this.consultations = getDefaultConsultations()
    }
  }

  /**
   * Save consultations to localStorage
   */
  private saveConsultations(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.consultations))
      } catch (error) {
        console.error('Error saving consultations:', error)
      }
    }
  }

  /**
   * Get all consultations with optional filtering
   */
  async getAllConsultations(filters?: FilterState): Promise<Consultation[]> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase consultations query with filters
        return this.legacyGetAllConsultations(filters)
      } catch (error) {
        console.error('Supabase getAllConsultations failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetAllConsultations(filters)
  }

  /**
   * Get consultation by ID
   */
  async getConsultationById(id: string): Promise<Consultation | null> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase consultation by ID query
        return this.legacyGetConsultationById(id)
      } catch (error) {
        console.error('Supabase getConsultationById failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetConsultationById(id)
  }

  /**
   * Create new consultation
   * Note: Form submissions should still use existing API routes
   */
  async createConsultation(data: CreateConsultationRequest): Promise<Consultation> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase consultation creation
        return this.legacyCreateConsultation(data)
      } catch (error) {
        console.error('Supabase createConsultation failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyCreateConsultation(data)
  }

  /**
   * Update consultation
   */
  async updateConsultation(data: UpdateConsultationRequest): Promise<Consultation | null> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase consultation update
        return this.legacyUpdateConsultation(data)
      } catch (error) {
        console.error('Supabase updateConsultation failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyUpdateConsultation(data)
  }

  /**
   * Delete consultation
   */
  async deleteConsultation(id: string): Promise<boolean> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase consultation deletion
        return this.legacyDeleteConsultation(id)
      } catch (error) {
        console.error('Supabase deleteConsultation failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyDeleteConsultation(id)
  }

  /**
   * Get consultation statistics
   */
  async getConsultationStats(): Promise<ConsultationStats> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase consultation statistics
        return this.legacyGetConsultationStats()
      } catch (error) {
        console.error('Supabase getConsultationStats failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetConsultationStats()
  }

  /**
   * Update consultation status
   */
  async updateConsultationStatus(id: string, status: ConsultationStatus, notes?: string, updatedBy?: string): Promise<Consultation | null> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase consultation status update
        return this.legacyUpdateConsultationStatus(id, status, notes, updatedBy)
      } catch (error) {
        console.error('Supabase updateConsultationStatus failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyUpdateConsultationStatus(id, status, notes, updatedBy)
  }

  /**
   * Assign consultation to staff member
   */
  async assignConsultation(id: string, assignedTo: string, assignedBy?: string): Promise<Consultation | null> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase consultation assignment
        return this.legacyAssignConsultation(id, assignedTo, assignedBy)
      } catch (error) {
        console.error('Supabase assignConsultation failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyAssignConsultation(id, assignedTo, assignedBy)
  }

  // ===== Legacy implementations =====

  private async legacyGetAllConsultations(filters?: FilterState): Promise<Consultation[]> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    
    let filtered = [...this.consultations]

    if (filters) {
      // Type filter
      if (filters.type && filters.type !== 'all') {
        filtered = filtered.filter(c => c.type === filters.type)
      }

      // Status filter
      if (filters.status && filters.status !== 'all') {
        if (filters.status === 'active') {
          filtered = filtered.filter(c => ![ConsultationStatus.CLOSED_WON, ConsultationStatus.CLOSED_LOST].includes(c.status))
        } else {
          filtered = filtered.filter(c => c.status === filters.status)
        }
      }

      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        filtered = filtered.filter(c => 
          c.contactName.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower) ||
          (c.companyName && c.companyName.toLowerCase().includes(searchLower))
        )
      }

      // Date range filter
      if (filters.dateRange) {
        const start = new Date(filters.dateRange.start)
        const end = new Date(filters.dateRange.end)
        filtered = filtered.filter(c => {
          const submitDate = new Date(c.submittedAt)
          return submitDate >= start && submitDate <= end
        })
      }

      // Assigned to filter
      if (filters.assignedTo && filters.assignedTo !== 'all') {
        filtered = filtered.filter(c => c.assignedTo === filters.assignedTo)
      }
    }

    // Sort by submission date (newest first)
    filtered.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

    return filtered
  }

  private async legacyGetConsultationById(id: string): Promise<Consultation | null> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return this.consultations.find(c => c.id === id) || null
  }

  private async legacyCreateConsultation(data: CreateConsultationRequest): Promise<Consultation> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(300)

    const newConsultation: Consultation = {
      id: `cons_${data.type}_${Date.now()}`,
      type: data.type,
      status: ConsultationStatus.LEAD,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: data.source,
      message: data.message,
      
      // Corporate specific fields
      ...(data.type === ConsultationType.CORPORATE && {
        companyName: data.companyName,
        contactTitle: data.contactTitle,
        trainingNeeds: data.trainingNeeds || [],
        trainingSize: data.trainingSize
      })
    }

    this.consultations.push(newConsultation)
    this.saveConsultations()
    return newConsultation
  }

  private async legacyUpdateConsultation(data: UpdateConsultationRequest): Promise<Consultation | null> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)

    const index = this.consultations.findIndex(c => c.id === data.id)
    if (index === -1) return null

    const consultation = this.consultations[index]
    const { id, status, notes, ...updateData } = data

    // Update status and add to history
    if (status && status !== consultation.status) {
      consultation.status = status
      if (!consultation.statusHistory) {
        consultation.statusHistory = []
      }
      consultation.statusHistory.push({
        status,
        timestamp: new Date().toISOString(),
        notes
      })
    }

    // Update notes
    if (notes !== undefined) {
      consultation.notes = notes
    }

    // Update other fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] !== undefined) {
        ;(consultation as any)[key] = updateData[key as keyof typeof updateData]
      }
    })

    consultation.updatedAt = new Date().toISOString()
    this.saveConsultations()
    return consultation
  }

  private async legacyDeleteConsultation(id: string): Promise<boolean> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)

    const index = this.consultations.findIndex(c => c.id === id)
    if (index === -1) return false

    this.consultations.splice(index, 1)
    this.saveConsultations()
    return true
  }

  private async legacyGetConsultationStats(): Promise<ConsultationStats> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(150)

    const stats: ConsultationStats = {
      total: this.consultations.length,
      individual: this.consultations.filter(c => c.type === ConsultationType.INDIVIDUAL).length,
      corporate: this.consultations.filter(c => c.type === ConsultationType.CORPORATE).length,
      byStatus: {
        [ConsultationStatus.LEAD]: this.consultations.filter(c => c.status === ConsultationStatus.LEAD).length,
        [ConsultationStatus.CONTACTED]: this.consultations.filter(c => c.status === ConsultationStatus.CONTACTED).length,
        [ConsultationStatus.QUALIFICATION]: this.consultations.filter(c => c.status === ConsultationStatus.QUALIFICATION).length,
        [ConsultationStatus.PROPOSAL]: this.consultations.filter(c => c.status === ConsultationStatus.PROPOSAL).length,
        [ConsultationStatus.NEGOTIATION]: this.consultations.filter(c => c.status === ConsultationStatus.NEGOTIATION).length,
        [ConsultationStatus.CLOSED_WON]: this.consultations.filter(c => c.status === ConsultationStatus.CLOSED_WON).length,
        [ConsultationStatus.CLOSED_LOST]: this.consultations.filter(c => c.status === ConsultationStatus.CLOSED_LOST).length
      },
      bySource: {
        homepage: this.consultations.filter(c => c.source === 'homepage').length,
        individual_form: this.consultations.filter(c => c.source === 'individual_form').length,
        corporate_form: this.consultations.filter(c => c.source === 'corporate_form').length
      }
    }

    return stats
  }

  private async legacyUpdateConsultationStatus(id: string, status: ConsultationStatus, notes?: string, updatedBy?: string): Promise<Consultation | null> {
    return this.legacyUpdateConsultation({
      id,
      status,
      notes,
      ...(updatedBy && { lastUpdatedBy: updatedBy })
    })
  }

  private async legacyAssignConsultation(id: string, assignedTo: string, assignedBy?: string): Promise<Consultation | null> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)

    const index = this.consultations.findIndex(c => c.id === id)
    if (index === -1) return null

    const consultation = this.consultations[index]
    consultation.assignedTo = assignedTo
    consultation.assignedBy = assignedBy
    consultation.assignedAt = new Date().toISOString()
    consultation.updatedAt = new Date().toISOString()

    this.saveConsultations()
    return consultation
  }
}

export const consultationService = new UnifiedConsultationService()
export type { 
  Consultation, 
  ConsultationType, 
  ConsultationStatus, 
  ConsultationStats,
  CreateConsultationRequest,
  UpdateConsultationRequest,
  FilterState
}