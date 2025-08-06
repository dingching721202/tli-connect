# 企業會員管理架構設計

## 設計原則
- **MECE**: 互相排斥、完全窮盡
- **資料流單一**: 避免重複的 schema 和 API
- **向前兼容**: 整合現有個人和企業會員系統

## 核心實體關係

```
Company (企業主體)
├── CorporateSubscriptions (企業訂閱方案) 1:N
│   ├── plan_id (方案ID)
│   ├── seats_total (總席次)
│   ├── seats_used (已使用席次)
│   ├── purchase_date
│   ├── activation_deadline
│   ├── start_date / end_date
│   └── status
└── CorporateMembers (企業會員) 1:N
    ├── user_id
    ├── subscription_id (關聯到企業訂閱)
    ├── assigned_date (分配日期)
    └── status (active/inactive)
```

## 統一的會員系統架構

### 1. 會員分類
- **個人會員**: 直接購買個人方案
- **企業會員**: 由企業主體管理，從企業訂閱分配席次

### 2. 資料結構

#### Company (企業主體) - 擴展現有
```typescript
interface Company {
  id: string | number;
  name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  address?: string;
  industry: string;
  employee_count: string;
  status: 'active' | 'inactive' | 'expired';
  created_at: string;
  updated_at?: string;
}
```

#### CorporateSubscription (企業訂閱) - 新增
```typescript
interface CorporateSubscription {
  id: number;
  company_id: string | number;
  plan_id: number;
  order_id?: number;
  
  // 席次管理
  seats_total: number;        // 總席次
  seats_used: number;         // 已使用席次
  seats_available: number;    // 可用席次 (計算得出)
  
  // 時間管理
  purchase_date: string;
  activation_deadline: string;
  start_date?: string;
  end_date?: string;
  
  // 狀態和金額
  status: 'purchased' | 'activated' | 'expired' | 'cancelled';
  amount_paid: number;
  auto_renewal: boolean;
  
  // 系統字段
  created_at: string;
  updated_at: string;
  
  // 快取字段 (避免頻繁 join)
  company_name?: string;
  plan_title?: string;
  plan_type?: 'corporate';
  duration_type?: 'season' | 'annual';
  duration_days?: number;
}
```

#### Membership (統一會員記錄) - 修改現有
```typescript
interface Membership {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  
  // 個人會員字段
  plan_id?: number;           // 個人方案ID
  member_card_id?: number;    // 個人會員卡ID
  order_id?: number;          // 個人訂單ID
  
  // 企業會員字段
  company_id?: string | number;           // 企業主體ID
  corporate_subscription_id?: number;     // 企業訂閱ID
  assigned_date?: string;                 // 席次分配日期
  
  // 共用字段
  membership_type: 'individual' | 'corporate';  // 會員類型
  status: 'purchased' | 'activated' | 'expired' | 'cancelled' | 'test';
  
  // 時間字段 (個人用)
  purchase_date?: string;
  activation_date?: string;
  expiry_date?: string;
  activation_deadline?: string;
  
  // 金額字段 (個人用)
  amount_paid?: number;
  auto_renewal?: boolean;
  
  // 企業特有
  company_name?: string;      // 冗餘字段，便於顯示
  
  // 系統字段
  created_at: string;
  updated_at: string;
  
  // 快取字段
  plan_title?: string;
  plan_type?: 'individual' | 'corporate';
  duration_type?: 'season' | 'annual';
  duration_days?: number;
}
```

## API 設計

### 企業管理
- `GET /api/companies` - 獲取企業列表
- `POST /api/companies` - 創建企業
- `PUT /api/companies/:id` - 更新企業
- `DELETE /api/companies/:id` - 刪除企業

### 企業訂閱管理
- `GET /api/companies/:id/subscriptions` - 獲取企業訂閱
- `POST /api/companies/:id/subscriptions` - 為企業購買方案
- `PUT /api/subscriptions/:id` - 更新訂閱狀態
- `POST /api/subscriptions/:id/activate` - 啟用企業訂閱

### 企業會員管理
- `GET /api/companies/:id/members` - 獲取企業會員列表
- `POST /api/companies/:id/members` - 分配席次給用戶
- `DELETE /api/companies/:companyId/members/:userId` - 取消席次分配

### 統一會員查詢
- `GET /api/memberships` - 獲取所有會員 (個人+企業)
- `GET /api/memberships?type=individual` - 僅個人會員
- `GET /api/memberships?type=corporate` - 僅企業會員
- `GET /api/memberships?company_id=123` - 特定企業的會員

## 數據流程

### 企業購買方案
1. 企業購買某個方案 → 創建 `CorporateSubscription`
2. 系統初始化 seats_total, seats_used=0
3. 企業管理員可分配席次給用戶

### 席次分配
1. 檢查 subscription 的可用席次
2. 創建 `Membership` 記錄 (membership_type='corporate')
3. 更新 subscription 的 seats_used
4. 發送通知給用戶

### 統一查詢
個人會員和企業會員通過 `membership_type` 區分，便於統一管理和顯示。

## 實現步驟

1. **階段一**: 創建 CorporateSubscription 實體和 API
2. **階段二**: 修改 Membership 實體，添加企業會員支持
3. **階段三**: 更新前端會員管理界面，支持企業會員查看
4. **階段四**: 實現企業會員管理界面 (席次分配等)
5. **階段五**: 數據遷移和測試