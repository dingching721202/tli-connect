// 諮詢狀態枚舉
export enum ConsultationStatus {
  LEAD = 'lead',                           // 潛在客戶
  CONTACTED = 'contacted',                 // 初步接觸
  QUALIFICATION = 'qualification',         // 需求分析
  PROPOSAL = 'proposal',                   // 方案展示
  NEGOTIATION = 'negotiation',             // 談判/審查
  CLOSED_WON = 'closed_won',              // 成功
  CLOSED_LOST = 'closed_lost'             // 失敗
}

// 諮詢類型枚舉
export enum ConsultationType {
  INDIVIDUAL = 'individual',
  CORPORATE = 'corporate'
}

// 統一諮詢介面 - 包含所有可能的欄位
export interface Consultation {
  id: string;
  type: ConsultationType;
  status: ConsultationStatus;
  
  // 基本聯絡資訊（兩種類型共用）
  contactName: string;
  email: string;
  phone?: string;
  
  // 企業專用欄位（個人諮詢時為 undefined）
  companyName?: string;
  contactTitle?: string;
  trainingNeeds?: string[];
  trainingSize?: string;
  message?: string;
  
  // 元數據
  submittedAt: string;
  updatedAt: string;
  source?: string; // 記錄來源：'homepage', 'membership', 'corporate_form'
  
  // 狀態歷史
  statusHistory?: StatusHistoryEntry[];
  
  // 備註
  notes?: string;
  
  // 處理者資訊
  assignedTo?: string; // 指派給哪個OPS處理
  assignedBy?: string; // 誰指派的
  assignedAt?: string; // 指派時間
  
  // 最後更新者資訊
  lastUpdatedBy?: string; // 最後更新者
}

// 狀態歷史記錄
export interface StatusHistoryEntry {
  status: ConsultationStatus;
  timestamp: string;
  updatedBy?: string;
  notes?: string;
}

// 狀態配置
export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon: string;
  description: string;
}

// 狀態配置映射
export const STATUS_CONFIG: Record<ConsultationStatus, StatusConfig> = {
  [ConsultationStatus.LEAD]: {
    label: '潛在客戶',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    icon: 'FiUser',
    description: '新的潛在客戶，尚未聯繫'
  },
  [ConsultationStatus.CONTACTED]: {
    label: '初步接觸',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: 'FiPhone',
    description: '已進行初步聯繫'
  },
  [ConsultationStatus.QUALIFICATION]: {
    label: '需求分析',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    icon: 'FiSearch',
    description: '正在了解客戶需求'
  },
  [ConsultationStatus.PROPOSAL]: {
    label: '方案展示',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: 'FiFileText',
    description: '已提供解決方案'
  },
  [ConsultationStatus.NEGOTIATION]: {
    label: '談判/審查',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    icon: 'FiMessageCircle',
    description: '正在協商細節'
  },
  [ConsultationStatus.CLOSED_WON]: {
    label: '成功',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: 'FiCheckCircle',
    description: '成功簽約'
  },
  [ConsultationStatus.CLOSED_LOST]: {
    label: '失敗',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: 'FiXCircle',
    description: '未能達成合作'
  }
};

// 篩選狀態
export interface FilterState {
  type: ConsultationType | 'all';
  status: ConsultationStatus | 'all';
  searchTerm: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

// 創建諮詢請求格式
export interface CreateConsultationRequest {
  type: ConsultationType;
  contactName: string;
  email: string;
  phone?: string;
  source?: string;
  
  // 企業諮詢專用欄位
  companyName?: string;
  contactTitle?: string;
  trainingNeeds?: string[];
  trainingSize?: string;
  message?: string;
}

// 更新諮詢請求格式
export interface UpdateConsultationRequest {
  id: string;
  status?: ConsultationStatus;
  notes?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  contactTitle?: string;
  trainingNeeds?: string[];
  trainingSize?: string;
  message?: string;
}

// API 回應格式
export interface ConsultationApiResponse {
  success: boolean;
  data?: Consultation[];
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

// 統計數據格式
export interface ConsultationStats {
  total: number;
  individual: number;
  corporate: number;
  byStatus: Record<ConsultationStatus, number>;
  bySource?: Record<string, number>;
}