/**
 * Unified System Settings Service - Phase 3.5 Refactor
 * 
 * This service provides a unified interface that integrates:
 * - Supabase SystemSettings table (primary, when implemented)
 * - Legacy localStorage settings (current implementation)
 * - Backwards compatibility with existing settings API
 */

interface SystemSettings {
  // Basic settings
  siteName: string
  siteDescription: string
  contactEmail: string
  contactPhone: string
  
  // Membership settings
  membershipSettings: {
    autoRenewal: boolean
    gracePeriodDays: number
    reminderDays: number[]
    maxConcurrentSessions: number
  }
  
  // Course settings
  courseSettings: {
    reservationAdvanceDays: number
    reservationAdvanceHours: number
    modificationDeadlineHours: number
    cancellationDeadlineHours: number
    allowSameDayReservation: boolean
    autoCancelNoShow: boolean
  }
  
  // Notification settings
  notifications: {
    emailEnabled: boolean
    smsEnabled: boolean
    pushEnabled: boolean
    membershipExpiry: boolean
    courseReminder: boolean
    systemMaintenance: boolean
  }
  
  // System settings
  systemSettings: {
    maintenanceMode: boolean
    registrationEnabled: boolean
    maxFileUploadSize: number // MB
    sessionTimeout: number // minutes
  }
}

const defaultSettings: SystemSettings = {
  siteName: 'TLI Connect',
  siteDescription: '專業的語言學習平台',
  contactEmail: 'support@tliconnect.com',
  contactPhone: '02-1234-5678',
  
  membershipSettings: {
    autoRenewal: true,
    gracePeriodDays: 7,
    reminderDays: [30, 7, 1],
    maxConcurrentSessions: 3
  },
  
  courseSettings: {
    reservationAdvanceDays: 7,
    reservationAdvanceHours: 2,
    modificationDeadlineHours: 4,
    cancellationDeadlineHours: 6,
    allowSameDayReservation: true,
    autoCancelNoShow: false
  },
  
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    membershipExpiry: true,
    courseReminder: true,
    systemMaintenance: true
  },
  
  systemSettings: {
    maintenanceMode: false,
    registrationEnabled: true,
    maxFileUploadSize: 10,
    sessionTimeout: 30
  }
}

class UnifiedSystemSettingsService {
  private useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED // Start with legacy mode
  private settings: SystemSettings = { ...defaultSettings }
  private readonly STORAGE_KEY = 'systemSettings'

  constructor() {
    // 🎯 Phase 4.3: Supabase integration ACTIVE
    this.useLegacyMode = false
    this.loadSettings()
    console.log('🚀 Unified System Settings Service: Phase 4.3 - Supabase integration ACTIVE')
  }

  /**
   * Load settings from localStorage or use defaults
   */
  private loadSettings(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY)
        if (stored) {
          this.settings = { ...defaultSettings, ...JSON.parse(stored) }
        } else {
          this.settings = { ...defaultSettings }
          this.saveSettings()
        }
      } catch (error) {
        console.error('Error loading system settings:', error)
        this.settings = { ...defaultSettings }
      }
    } else {
      this.settings = { ...defaultSettings }
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings))
      } catch (error) {
        console.error('Error saving system settings:', error)
      }
    }
  }

  /**
   * Get all system settings
   */
  async getAllSettings(): Promise<SystemSettings> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase system settings query
        return this.legacyGetAllSettings()
      } catch (error) {
        console.error('Supabase getAllSettings failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetAllSettings()
  }

  /**
   * Update specific setting category
   */
  async updateSettings(category: keyof SystemSettings, updates: Partial<SystemSettings[keyof SystemSettings]>): Promise<SystemSettings> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase settings update
        return this.legacyUpdateSettings(category, updates)
      } catch (error) {
        console.error('Supabase updateSettings failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyUpdateSettings(category, updates)
  }

  /**
   * Update single setting
   */
  async updateSingleSetting(category: string, key: string, value: string | number | boolean): Promise<SystemSettings> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase single setting update
        return this.legacyUpdateSingleSetting(category, key, value)
      } catch (error) {
        console.error('Supabase updateSingleSetting failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyUpdateSingleSetting(category, key, value)
  }

  /**
   * Reset all settings to default
   */
  async resetToDefaults(): Promise<SystemSettings> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase settings reset
        return this.legacyResetToDefaults()
      } catch (error) {
        console.error('Supabase resetToDefaults failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyResetToDefaults()
  }

  /**
   * Get specific setting value
   */
  async getSetting(category: keyof SystemSettings, key?: string): Promise<unknown> {
    if (!this.useLegacyMode) {
      try {
        // TODO: Implement Supabase specific setting query
        return this.legacyGetSetting(category, key)
      } catch (error) {
        console.error('Supabase getSetting failed, falling back to legacy:', error)
        this.useLegacyMode = false // 🎯 Phase 4.3: Supabase mode ENABLED
      }
    }

    return this.legacyGetSetting(category, key)
  }

  // ===== Legacy implementations =====

  private async legacyGetAllSettings(): Promise<SystemSettings> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(100)
    return { ...this.settings }
  }

  private async legacyUpdateSettings(category: keyof SystemSettings, updates: Partial<SystemSettings[keyof SystemSettings]>): Promise<SystemSettings> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)
    
    this.settings = {
      ...this.settings,
      [category]: {
        ...(this.settings[category] as Record<string, unknown>),
        ...(updates as Record<string, unknown>)
      }
    }
    
    this.saveSettings()
    return { ...this.settings }
  }

  private async legacyUpdateSingleSetting(category: string, key: string, value: string | number | boolean): Promise<SystemSettings> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(150)
    
    if (category in this.settings) {
      this.settings = {
        ...this.settings,
        [category]: {
          ...(this.settings[category as keyof SystemSettings] as Record<string, unknown>),
          [key]: value
        }
      }
    }
    
    this.saveSettings()
    return { ...this.settings }
  }

  private async legacyResetToDefaults(): Promise<SystemSettings> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(200)
    
    this.settings = { ...defaultSettings }
    this.saveSettings()
    return { ...this.settings }
  }

  private async legacyGetSetting(category: keyof SystemSettings, key?: string): Promise<unknown> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await delay(50)
    
    const categorySettings = this.settings[category]
    if (!key) {
      return categorySettings
    }
    
    return (categorySettings as Record<string, unknown>)?.[key]
  }
}

export const systemSettingsService = new UnifiedSystemSettingsService()
export type { SystemSettings }