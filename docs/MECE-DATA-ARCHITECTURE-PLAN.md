# TLI Connect 統一資料管理重構計畫書

## 📋 專案概述

### 目標
對TLI Connect系統進行MECE（Mutually Exclusive, Collectively Exhaustive）原則的資料統一管理重構，整合至Supabase資料庫，消除資料重複，建立單一資料流，保持所有現有功能完整性。

### 範圍
- 保持100%現有功能邏輯不變
- 重新設計合理的API架構
- 統一資料模型和儲存
- 整合多重資料來源
- 建立清晰的資料流向
- 設計Supabase整合架構

## 🔍 現況分析

### 系統架構現況
- **框架**: Next.js 15.4.2 with App Router + TypeScript
- **UI**: Tailwind CSS + Radix UI
- **資料儲存**: localStorage（主要）+ 多個mock data文件
- **狀態管理**: React Context (AuthContext)

### 現有核心功能模組

#### 1. 多角色認證系統
```
角色類型: STUDENT, TEACHER, CORPORATE_CONTACT, AGENT, STAFF, ADMIN
功能:
- 多角色用戶支援
- 角色切換機制
- 角色權限控制
- 登入來源追蹤
```

#### 2. 會員管理系統
```
會員類型:
- 個人會員 (Individual): 季度/年度方案
- 企業會員 (Corporate): 企業訂閱+席次管理
狀態流程: inactive → activated → expired
```

#### 3. 課程預約系統 (4層架構)
```
CourseTemplate → CourseSchedule → CourseSession → CourseEnrollment
- 課程模板定義
- 排期管理
- 時段預約
- 預約記錄
```

#### 4. 企業管理系統
```
- 企業客戶管理
- 企業訂閱管理
- 席次分配系統
- 企業會員發放
```

#### 5. 其他系統
```
- 代理推薦系統
- 教師請假管理
- 銷售記錄追蹤
- 系統設定管理
```

### 現有API問題識別

#### 資料重複問題
- `src/data/users.ts` (已廢棄)
- `dataService.ts` 中的用戶陣列
- localStorage 中的用戶資料
- AuthContext 中的用戶狀態
- `src/data/memberships.ts` vs `src/lib/memberCardStore.ts`
- 企業會員資料分散在多處

#### API設計問題
- **不一致的回應格式**: 有些API返回`{ success, data, error }`，有些直接返回資料
- **混亂的端點命名**: `/member-cards/admin/[id]` vs `/v1/users/[id]/roles` 
- **重複的功能端點**: 會員管理有多套API
- **缺乏版本控制**: API端點沒有統一的版本管理
- **不合理的HTTP方法**: 某些更新操作使用GET
- **嵌套太深的路由**: 路由層級過多，不易維護

#### 服務層問題
- **服務職責不清**: `dataService.ts` 包含所有業務邏輯
- **資料存取混亂**: localStorage、memory、mock data混用
- **缺乏錯誤處理**: 錯誤處理不統一，用戶體驗差
- **沒有快取策略**: 重複查詢相同資料
- **缺乏型別安全**: API回應沒有完整的型別檢查

## 🎯 MECE統一架構設計

### 第一層：核心實體 (5大主表)

#### 1. `users` - 統一用戶系統
```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  account_status TEXT NOT NULL DEFAULT 'ACTIVE',
  membership_status TEXT NOT NULL DEFAULT 'non_member',
  campus TEXT NOT NULL DEFAULT '羅斯福校',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. `organizations` - 企業/機構管理
```sql
CREATE TABLE organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  address TEXT,
  industry TEXT,
  employee_count TEXT,
  status TEXT NOT NULL DEFAULT 'non_member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. `memberships` - 統一會員資格
```sql
CREATE TABLE memberships (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  organization_id TEXT REFERENCES organizations(id),
  plan_id BIGINT NOT NULL,
  membership_type TEXT NOT NULL, -- 'individual', 'corporate'
  status TEXT NOT NULL DEFAULT 'inactive',
  purchase_date TIMESTAMPTZ NOT NULL,
  activation_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  activation_deadline TIMESTAMPTZ,
  amount_paid DECIMAL,
  auto_renewal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. `courses` - 課程體系
```sql
-- 課程模板
CREATE TABLE course_templates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  level TEXT NOT NULL,
  format TEXT NOT NULL,
  total_sessions INTEGER NOT NULL,
  session_duration_minutes INTEGER NOT NULL,
  default_capacity INTEGER NOT NULL,
  base_pricing JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 課程排期
CREATE TABLE course_schedules (
  id TEXT PRIMARY KEY,
  template_id TEXT REFERENCES course_templates(id),
  instructor_id BIGINT REFERENCES users(id),
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  capacity INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 課程時段
CREATE TABLE course_sessions (
  id TEXT PRIMARY KEY,
  schedule_id TEXT REFERENCES course_schedules(id),
  session_number INTEGER NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  max_capacity INTEGER NOT NULL,
  current_enrollments INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'SCHEDULED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 5. `transactions` - 交易記錄
```sql
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  organization_id TEXT REFERENCES organizations(id),
  plan_id BIGINT NOT NULL,
  amount DECIMAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'CREATED',
  payment_method TEXT,
  payment_id TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔧 重新設計的API架構

### RESTful API設計原則

#### 1. 統一的回應格式
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    pagination?: PaginationMeta;
    timestamp: string;
  };
}
```

#### 2. 重新設計的API端點結構

```
/api/v1/
├── auth/
│   ├── POST /login
│   ├── POST /register
│   ├── POST /logout
│   ├── GET /me
│   └── PUT /me
├── users/
│   ├── GET /users
│   ├── POST /users
│   ├── GET /users/{id}
│   ├── PUT /users/{id}
│   ├── DELETE /users/{id}
│   ├── PUT /users/{id}/roles
│   └── PUT /users/{id}/status
├── memberships/
│   ├── GET /memberships
│   ├── POST /memberships
│   ├── GET /memberships/{id}
│   ├── PUT /memberships/{id}
│   ├── POST /memberships/{id}/activate
│   └── GET /memberships/expiring
├── organizations/
│   ├── GET /organizations
│   ├── POST /organizations
│   ├── GET /organizations/{id}
│   ├── PUT /organizations/{id}
│   ├── GET /organizations/{id}/subscriptions
│   └── GET /organizations/{id}/members
├── courses/
│   ├── GET /courses/templates
│   ├── POST /courses/templates
│   ├── GET /courses/schedules
│   ├── POST /courses/schedules
│   ├── GET /courses/sessions
│   └── GET /courses/sessions/available
├── enrollments/
│   ├── GET /enrollments
│   ├── POST /enrollments
│   ├── POST /enrollments/batch
│   ├── PUT /enrollments/{id}
│   └── DELETE /enrollments/{id}
├── orders/
│   ├── GET /orders
│   ├── POST /orders
│   ├── GET /orders/{id}
│   └── PUT /orders/{id}/status
└── admin/
    ├── GET /admin/analytics
    ├── GET /admin/reports
    └── POST /admin/system/reset
```

#### 3. HTTP狀態碼標準
```
200 OK - 成功獲取或更新資源
201 Created - 成功創建新資源
204 No Content - 成功刪除或無內容回應
400 Bad Request - 請求參數錯誤
401 Unauthorized - 未認證
403 Forbidden - 已認證但無權限
404 Not Found - 資源不存在
409 Conflict - 資源衝突（如重複創建）
422 Unprocessable Entity - 資料驗證失敗
429 Too Many Requests - 請求頻率過高
500 Internal Server Error - 服務器錯誤
```

#### 4. 查詢參數標準化
```typescript
interface ListQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  filter?: Record<string, unknown>;
  search?: string;
}
```

### 第二層：關聯實體 (7大關聯表)

#### 1. `user_roles` - 角色權限
```sql
CREATE TABLE user_roles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  role TEXT NOT NULL,
  granted_by BIGINT REFERENCES users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);
```

#### 2. `course_enrollments` - 預約記錄
```sql
CREATE TABLE course_enrollments (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES course_sessions(id),
  user_id BIGINT REFERENCES users(id),
  membership_id BIGINT REFERENCES memberships(id),
  status TEXT NOT NULL DEFAULT 'CONFIRMED',
  enrollment_source TEXT NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. `corporate_subscriptions` - 企業訂閱
```sql
CREATE TABLE corporate_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  plan_id BIGINT NOT NULL,
  seats_total INTEGER NOT NULL,
  seats_used INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'inactive',
  purchase_date TIMESTAMPTZ NOT NULL,
  activation_deadline TIMESTAMPTZ,
  amount_paid DECIMAL NOT NULL,
  auto_renewal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. `agents` - 代理系統
```sql
CREATE TABLE agents (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  agent_code TEXT UNIQUE NOT NULL,
  commission_rate DECIMAL DEFAULT 0.05,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 5. `leave_requests` - 請假管理
```sql
CREATE TABLE leave_requests (
  id TEXT PRIMARY KEY,
  teacher_id BIGINT REFERENCES users(id),
  session_id TEXT REFERENCES course_sessions(id),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by BIGINT REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 6. `system_settings` - 系統設定
```sql
CREATE TABLE system_settings (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by BIGINT REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 7. `activity_logs` - 活動日誌
```sql
CREATE TABLE activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🚀 實施計畫

### Phase 1: 資料模型標準化 (2-3天)

#### 任務 1.1: 統一型別定義
- [ ] 重構 `src/types/unified/` 目錄
- [ ] 整合所有分散的型別定義
- [ ] 消除重複的介面宣告
- [ ] 建立 Supabase 相容的型別

#### 任務 1.2: Schema 設計文件
- [ ] 完整的 Supabase SQL schema
- [ ] 資料關聯圖設計
- [ ] 索引策略規劃
- [ ] 資料遷移計畫

#### 任務 1.3: 重新設計API架構
- [ ] 設計RESTful API端點結構 (`/api/v1/`)
- [ ] 統一 API 回應格式與錯誤處理
- [ ] 建立型別安全的 API 客戶端
- [ ] 設計合理的HTTP狀態碼使用
- [ ] 制定查詢參數標準
- [ ] 移除不合理的API端點

### Phase 2: Supabase 整合 (3-4天)

#### 任務 2.1: 資料庫建立
- [ ] Supabase 專案初始化
- [ ] 執行 SQL schema 建立
- [ ] 設定 Row Level Security (RLS)
- [ ] 建立資料庫索引

#### 任務 2.2: 資料遷移
- [ ] localStorage 資料匯出
- [ ] Mock 資料清理與轉換
- [ ] 資料一致性驗證
- [ ] 測試資料建立

#### 任務 2.3: Supabase 客戶端設定
- [ ] 安裝 Supabase 客戶端
- [ ] 環境變數設定
- [ ] 型別自動生成設定
- [ ] 連線池設定

### Phase 3: 服務層重構 (4-5天)

#### 任務 3.1: 核心服務重構
- [ ] 重寫 `authService` 使用 Supabase Auth
- [ ] 重構 `memberCardService` 統一會員管理
- [ ] 改寫 `bookingService` 課程預約邏輯
- [ ] 整合 `dashboardService` 資料來源

#### 任務 3.2: 企業服務整合
- [ ] 統一企業客戶管理
- [ ] 整合企業訂閱系統
- [ ] 合併企業會員管理
- [ ] 代理系統 Supabase 整合

#### 任務 3.3: 輔助服務遷移
- [ ] 請假管理系統遷移
- [ ] 教師管理整合
- [ ] 系統設定遷移
- [ ] 活動日誌系統

### Phase 4: 前端整合與測試 (2-3天)

#### 任務 4.1: 組件更新
- [ ] 更新所有資料獲取邏輯
- [ ] 修改表單提交邏輯
- [ ] 整合即時更新功能
- [ ] 錯誤處理改善

#### 任務 4.2: 功能測試
- [ ] 用戶註冊/登入流程測試
- [ ] 會員購買/啟用流程測試
- [ ] 課程預約/取消流程測試
- [ ] 企業管理功能測試

#### 任務 4.3: 效能優化
- [ ] 查詢效能優化
- [ ] 快取策略實施
- [ ] 載入狀態改善
- [ ] 錯誤邊界處理

## 📊 資料流向圖

### 現有資料流
```
用戶操作 → Component → dataService → localStorage ← Mock Data
                                   ↘ Memory Arrays
```

### 目標資料流
```
用戶操作 → Component → Unified Service → Supabase Client → PostgreSQL
                                    ↘ Real-time Subscriptions
```

## 🔒 風險管理

### 技術風險
- **資料遺失風險**: 實施完整的資料備份與回滾機制
- **效能風險**: 建立效能監控與優化策略
- **API破壞性變更風險**: 建立API版本控制與遷移策略

### 業務風險
- **功能中斷風險**: 採用漸進式遷移，確保零停機
- **用戶體驗風險**: 維持所有現有使用流程不變
- **API相容性風險**: 前端需同步更新API調用邏輯
- **資料一致性風險**: 建立完整的資料驗證機制

## 📈 成功指標

### 技術指標
- [ ] 100% 現有功能邏輯保持運作
- [ ] 資料查詢效能提升 50%
- [ ] 程式碼重複率降低 80%
- [ ] API 回應時間 < 200ms
- [ ] API端點數量減少 40%
- [ ] 型別安全覆蓋率 100%

### 業務指標
- [ ] 用戶操作流程無變化
- [ ] 資料一致性 100%
- [ ] 系統可用性 > 99.9%
- [ ] 開發效率提升 60%
- [ ] API使用更直觀易懂

## 📅 時程規劃

```
Week 1: Phase 1 - 資料模型標準化
├── Day 1-2: 統一型別定義
├── Day 3: Schema 設計
└── Day 4-5: 重新設計API架構

Week 2: Phase 2 - Supabase 整合
├── Day 1-2: 資料庫建立
├── Day 3-4: 資料遷移
└── Day 5: 客戶端設定

Week 3: Phase 3 - 服務層重構
├── Day 1-3: 核心服務重構
├── Day 4: 企業服務整合
└── Day 5: 輔助服務遷移

Week 4: Phase 4 - 整合測試
├── Day 1-2: 前端整合
├── Day 3: 功能測試
└── Day 4-5: 效能優化與部署
```

## 💡 後續優化建議

### 短期優化 (1-2個月)
- 實施 Supabase Edge Functions
- 增加即時通知功能
- 建立詳細的分析儀表板

### 長期優化 (3-6個月)
- 導入 AI 推薦系統
- 實施微服務架構
- 建立完整的 API 生態系統

---

**專案負責人**: Claude Code Assistant  
**最後更新**: 2025-01-14  
**版本**: 1.0