# TLI Connect 系統功能資料結構與流程規劃文件

## 📋 目錄
- [技術規格總覽](#技術規格總覽tech-stack)
- [一、功能模組總覽](#一功能模組總覽依-app-區分)
- [二、各功能模組細節](#二各功能模組細節)
- [三、資料流設計](#三資料流設計mece-原則)
- [四、API 設計標準](#四api-設計標準)
- [五、錯誤碼與例外處理標準](#五錯誤碼與例外處理標準)

---

## 🔧 技術規格總覽（Tech Stack）

### 🚀 前端技術棧

| 類別 | 指定版本／建議 | 備註 |
|---|---|---|
| **Next.js** | v14 LTS（≥14.2.0） | 使用 App Router｜Pages Router 亦可，但 App Router 加分 |
| **React** | 隨 Next.js 版本 | React 18+ 支援 Server Components 和並發功能 |
| **TypeScript** | ^5.x | 預設隨 Next.js 安裝啟用，提供完整型別安全 |
| **樣式框架** | Tailwind CSS ^3.x | 或任選 CSS-in-JS，但需保持簡潔、可讀 |
| **日期函式庫** | date-fns ^3.x | 處理格式化、比對等日期相關操作 |
| **月曆元件** | react-calendar ^4.x | 或 FullCalendar React，惟需維持月視圖呈現 |
| **前端元件庫** | Shadcn/ui latest | 高品質 React 元件庫，基於 Radix UI |
| **元件客製工具** | Tweakcn latest | 用來自定義 Shadcn 元件樣式和行為 |

### 🛠️ 開發工具與庫

| 類別 | 指定版本／建議 | 備註 |
|---|---|---|
| **狀態管理** | Zustand ^4.x 或 Context API | 輕量級狀態管理，避免過度工程化 |
| **表單處理** | React Hook Form ^7.x | 高效能表單庫，搭配 Zod 驗證 |
| **資料驗證** | Zod ^3.x | TypeScript-first 的資料驗證庫 |
| **HTTP 客戶端** | Fetch API 或 Axios ^1.x | 原生 Fetch 優先，複雜需求可用 Axios |
| **動畫庫** | Framer Motion ^10.x | 流暢的動畫和手勢庫 |
| **圖示庫** | Lucide React ^0.x 或 React Icons | 現代化的 SVG 圖示庫 |

### 🗄️ 後端與資料庫

| 類別 | 指定版本／建議 | 備註 |
|---|---|---|
| **運行環境** | Node.js ≥18.17.0 | 支援 Next.js 14 的最低版本要求 |
| **API 路由** | Next.js API Routes | 使用 Next.js 內建 API 功能 |
| **資料庫** | 根據需求選擇 | PostgreSQL（推薦）、MySQL 或 SQLite |
| **ORM** | Prisma ^5.x 或 Drizzle ORM | 類型安全的資料庫 ORM |
| **認證系統** | NextAuth.js ^4.x 或自建 JWT | 支援多種登入方式 |

### 🔐 安全性與部署

| 類別 | 指定版本／建議 | 備註 |
|---|---|---|
| **環境變數管理** | dotenv ^16.x | 安全的環境變數處理 |
| **CSRF 防護** | 內建或 csrf ^3.x | 防止跨站請求偽造攻擊 |
| **CORS 設定** | Next.js 內建 | API 路由的跨域請求控制 |
| **部署平台** | Vercel（推薦）或 Netlify | 原生支援 Next.js 的部署平台 |

### 📱 移動端支援

| 類別 | 指定版本／建議 | 備註 |
|---|---|---|
| **響應式設計** | Tailwind CSS Responsive | 移動端優先的響應式設計 |
| **PWA 支援** | next-pwa ^5.x | 漸進式網頁應用支援（可選） |
| **觸控手勢** | 瀏覽器原生支援 | 基本觸控操作支援 |

### 📊 開發與測試工具

| 類別 | 指定版本／建議 | 備註 |
|---|---|---|
| **代碼品質** | ESLint ^8.x + Prettier ^3.x | 代碼規範和格式化 |
| **測試框架** | Jest ^29.x + Testing Library | 單元測試和整合測試 |
| **端到端測試** | Playwright ^1.x（可選） | 完整的 E2E 測試解決方案 |
| **型別檢查** | TypeScript 編譯器 | 開發時即時型別檢查 |

### 🔄 版本控制與 CI/CD

| 類別 | 指定版本／建議 | 備註 |
|---|---|---|
| **版本控制** | Git + GitHub/GitLab | 代碼版本管理和協作 |
| **包管理器** | npm ^9.x 或 pnpm ^8.x | 推薦使用 pnpm 提升安裝速度 |
| **持續集成** | GitHub Actions 或 GitLab CI | 自動化測試和部署 |

### 📋 技術選型原則

1. **穩定性優先**：選擇 LTS 版本和成熟的技術棧
2. **性能考量**：優先選擇輕量級、高性能的解決方案
3. **開發效率**：使用提供良好開發體驗的工具和庫
4. **可維護性**：選擇有良好文檔和社群支援的技術
5. **安全性**：確保所有依賴項目都有安全更新支援
6. **可擴展性**：技術棧應支援未來的功能擴展需求

---

## 一、功能模組總覽（依 APP 區分）

### 📱 APP 名稱：Student Portal
- 用戶註冊與登入
- 學員Dashboard
- 會員方案管理
- 課程瀏覽與預約
- 我的學習記錄
- 個人資料管理
- 推薦系統
- 聯繫我們表單

### 👨‍🏫 APP 名稱：Teacher Portal
- 教學排程管理
- 學生名單管理
- 請假申請系統
- 課程準備工具
- 學生互動記錄

### 🔧 APP 名稱：Admin Portal
- 用戶管理系統
- 課程內容管理
- 課程排程管理
- 課務管理系統（管理員版）
- 教師資源管理
- 訂單與付款管理
- 系統設定管理
- 數據分析報表
- 案件管理系統

### 📋 APP 名稱：Staff Portal
- 課務管理系統
- 學員管理
- 用戶資料編輯
- 課程時段管理
- 預約管理
- 基本報表查看

### 🏢 APP 名稱：Corporate Portal
- 企業客戶管理
- 批量購買方案
- 員工學習追蹤
- 企業專案管理

---

## 二、各功能模組細節

### 📌 功能名稱：用戶註冊與登入
**所屬 APP**：Student Portal  
**功能描述**：提供用戶註冊、登入、驗證等基礎認證功能

#### User Story
| id | 標題 | 內容 | Acceptance Criteria |
|---|---|---|---|
| US-AUTH-001 | 學員註冊並登入 | 作為未註冊訪客，我希望使用Email完成註冊並登入，以便可以進入Dashboard使用所有學員功能 | 唯一性：若Email已存在，系統應回傳409 EMAIL_ALREADY_EXISTS；成功：註冊成功即自動登入，HTTP 200回傳user_id與JWT；登入失敗：密碼錯誤回傳401 INVALID_CREDENTIALS |
| US-AUTH-002 | 用戶登入 | 作為註冊用戶，我希望能夠安全登入系統，以便存取個人功能 | 系統驗證email和密碼；登入成功後導向dashboard；密碼錯誤回傳401 INVALID_CREDENTIALS |
| US-AUTH-003 | 忘記密碼 | 作為用戶，我希望能夠重設密碼，以便在忘記密碼時重新登入 | 系統發送重設連結至用戶email；連結有效期24小時；重設成功後可正常登入 |

#### 資料 Schema (TypeScript Interface)
```typescript
interface User {
  id: string;                    // UUID
  email: string;                 // 電子郵件 (唯一)
  name: string;                  // 用戶姓名
  phone: string;                 // 電話號碼
  password_hash: string;         // 加密密碼
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'STAFF' | 'CORPORATE'; // 用戶角色
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';         // 帳號狀態
  email_verified: boolean;       // Email驗證狀態
  created_at: string;           // ISO 8601 格式
  updated_at: string;           // ISO 8601 格式
  last_login_at?: string;       // ISO 8601 格式
}

interface UserSession {
  id: string;                   // Session ID
  user_id: string;             // 用戶ID
  jwt_token: string;           // JWT Token
  device_info?: string;        // 設備資訊
  ip_address: string;          // IP位址
  expires_at: string;          // ISO 8601 格式
  created_at: string;          // ISO 8601 格式
}
```

#### API 設計
- `POST /api/v1/auth/register`：用戶註冊
- `POST /api/v1/auth/login`：用戶登入
- `POST /api/v1/auth/logout`：用戶登出
- `POST /api/v1/auth/refresh`：刷新Token
- `POST /api/v1/auth/forgot-password`：忘記密碼
- `POST /api/v1/auth/reset-password`：重設密碼

---

### 📌 功能名稱：會員方案管理
**所屬 APP**：Student Portal  
**功能描述**：提供會員方案瀏覽、購買、啟用等完整會員制度功能

#### User Story
| id | 標題 | 內容 | Acceptance Criteria |
|---|---|---|---|
| US-MEMBER-001 | 學員瀏覽並挑選會員方案 | 作為學員，我希望查看所有上架中的MemberCardPlan(季/年)，以便我能決定要買哪一種卡 | 呼叫/member-card-plans僅回傳status=PUBLISHED之方案；每筆資料欄位包含：plan_id, title, type(SEASON\|YEAR), duration_days, price；UI需顯示不同版本會員方案的標籤，以利辨識 |
| US-MEMBER-002 | 購買會員卡 | 作為學員，我希望線上付款購買指定會員方案，以便付款完成即可擁有會員資格 | 送出/orders時需帶plan_id，系統建立Order(status=CREATED)；第三方金流成功→Order.status→COMPLETED；付款失敗或逾時→Order.status→CANCELED，不得產生會員卡 |
| US-MEMBER-003 | 啟用會員卡 | 作為學員，我希望對已購買的會員卡設定生效日期或立即啟用，以便期限正式開始倒數，並可進行課程預約 | 學員只能對狀態PURCHASED的卡呼叫/member-cards/{id}/activate；若該學員已有ACTIVE會員卡→回傳422 ACTIVE_CARD_EXISTS；啟用成功：status→ACTIVATE, activate_at=today, expire_at=activate_at+duration_days；Dashboard應即時顯示卡片到期日 |

#### 資料 Schema (TypeScript Interface)
```typescript
interface MemberCardPlan {
  plan_id: string;              // UUID (renamed from id)
  title: string;                // 方案名稱
  description: string;          // 方案描述
  type: 'SEASON' | 'YEAR';      // 期間類型 (renamed from duration_type)
  duration_days: number;        // 有效天數
  price: number;               // 售價 (TWD) (unified from original_price/sale_price)
  original_price?: number;      // 原價 (TWD) (optional for display)
  features: string[];          // 功能特色列表
  course_access: string[];     // 可存取課程ID列表
  is_popular: boolean;         // 是否熱門方案
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; // 發布狀態 (renamed from is_published)
  version_tag?: string;        // 版本標籤，用於UI辨識
  created_at: string;          // ISO 8601 格式
  updated_at: string;          // ISO 8601 格式
}

interface MemberCard {
  id: string;                  // UUID
  user_id: string;            // 用戶ID
  plan_id: string;            // 方案ID
  order_id: string;           // 訂單ID
  status: 'PURCHASED' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED'; // 會員狀態
  activate_at?: string;       // 啟用日期 ISO 8601
  expire_at?: string;         // 到期日期 ISO 8601
  activate_deadline: string;   // 啟用截止日 ISO 8601
  duration_days: number;      // 有效天數（從plan複製過來）
  auto_renew: boolean;        // 是否自動續約
  created_at: string;         // ISO 8601 格式
  updated_at: string;         // ISO 8601 格式
}
```

#### API 設計
- `GET /api/v1/member-card-plans`：取得所有已發布方案（僅回傳status=PUBLISHED）
- `GET /api/v1/member-card-plans/:id`：取得特定方案詳情
- `POST /api/v1/orders`：建立訂單（需帶plan_id）
- `GET /api/v1/member-cards/my`：取得我的會員卡
- `POST /api/v1/member-cards/:id/activate`：啟用會員卡
- `PUT /api/v1/member-cards/:id/auto-renew`：設定自動續約

---

### 📌 功能名稱：課程瀏覽與預約
**所屬 APP**：Student Portal  
**功能描述**：基於課程排程提供學生瀏覽已開課程、查看詳細資訊、預約時段等學習相關功能

#### User Story
| id | 標題 | 內容 | Acceptance Criteria |
|---|---|---|---|
| US-COURSE-001 | 查看課程日曆 | 作為學員，我希望於日曆檢視所有可預約課程時段，以便能快速挑選仍有名額的課程 | 僅列出Timeslot.status=CREATED且reserved_count<capacity之時段；額滿(reserved_count≥capacity)之時段以灰色呈現並Disable點擊；距離開課<24h的時段，無論是否額滿，都顯示為鎖定狀態並不可點擊 |
| US-COURSE-002 | 一次預約多堂課程 | 作為已啟用會員卡的學員，我希望批量選取多個時段並一次送出預約，以便即便部分時段額滿，我仍能先搶到剩餘可用時段，並立刻知道哪些沒搶到 | /bookings/batch接收timeslot_ids[]；逐筆驗證：各時段start_time≥NOW+24h，各時段Timeslot.status=CREATED且reserved_count<capacity，學員擁有訂閱會員身份；可預約成功的時段→建立Booking(status=BOOKED)，並reserved_count+=1；驗證失敗的時段不建立Booking，記錄失敗原因：FULL/WITHIN_24H/MEMBERSHIP_EXPIRED；API回傳success/failed格式；前端彈窗顯示預約結果；日曆同步更新狀態 |
| US-COURSE-003 | 取消單筆預約(>24h) | 作為學員，我希望在開課24h之前取消已預約時段，以便可釋出名額給其他學員 | 僅接受距離開課>24h取消預約；取消成功→課程可容納人數+1，預約紀錄狀態調成取消；開課<24h→前端沒有取消按鈕，api需要回傳403 CANNOT_CANCEL_WITHIN_24H |

#### 資料 Schema (TypeScript Interface)
```typescript
// 課程時段（User Story中稱為Timeslot）
interface Timeslot {
  id: string;                  // UUID
  schedule_id: string;         // 課程排程ID
  module_id: string;          // 課程模組ID
  lesson_id?: string;         // 對應課堂ID
  session_number: number;     // 第幾堂課
  title: string;              // 課堂標題
  date: string;               // 上課日期 YYYY-MM-DD
  start_time: string;         // 開始時間 HH:mm
  end_time: string;           // 結束時間 HH:mm
  teacher_id: string;         // 教師ID
  location: string;           // 上課地點
  capacity: number;           // 容量
  reserved_count: number;     // 已預約人數 (renamed from enrolled_count)
  waitlist_count: number;     // 候補人數
  status: 'CREATED' | 'FULL' | 'CANCELLED' | 'COMPLETED'; // 時段狀態
  booking_deadline: string;   // 預約截止時間 ISO 8601
  is_within_24h: boolean;     // 是否距離開課小於24小時（計算欄位）
  special_instructions?: string; // 特殊說明
  materials_needed: string[]; // 需要的教材
  created_at: string;         // ISO 8601 格式
  updated_at: string;         // ISO 8601 格式
}

interface Booking {
  id: string;                  // UUID
  user_id: string;            // 用戶ID
  timeslot_id: string;        // 課程時段ID (renamed from session_id)
  member_card_id: string;     // 會員卡ID (renamed from membership_id)
  status: 'BOOKED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'; // 預約狀態
  booking_source: 'WEB' | 'MOBILE' | 'ADMIN';     // 預約來源
  cancellation_reason?: string;  // 取消原因
  cancellation_allowed: boolean; // 是否允許取消（>24h規則）
  special_requests?: string;   // 特殊需求
  created_at: string;         // ISO 8601 格式
  updated_at: string;         // ISO 8601 格式
  cancelled_at?: string;      // 取消時間 ISO 8601
  completed_at?: string;      // 完成時間 ISO 8601
}

// 批量預約回應格式
interface BatchBookingResponse {
  success: Array<{
    timeslot_id: string;
    booking_id: string;
  }>;
  failed: Array<{
    timeslot_id: string;
    reason: 'FULL' | 'WITHIN_24H' | 'MEMBERSHIP_EXPIRED' | 'INVALID_TIMESLOT';
  }>;
}

interface StudentProgress {
  id: string;                 // UUID
  user_id: string;           // 學生ID
  booking_id: string;        // 預約ID
  schedule_id: string;       // 排程ID
  module_id: string;         // 模組ID
  total_sessions: number;    // 總堂數
  attended_sessions: number; // 已出席堂數
  completed_sessions: number; // 已完成堂數
  progress_percentage: number; // 進度百分比
  last_attended_date?: string; // 最後出席日期 ISO 8601
  next_session_date?: string;  // 下次課程日期 ISO 8601
  certificates_earned: string[]; // 獲得的證書
  learning_notes?: string;    // 學習筆記
  created_at: string;        // ISO 8601 格式
  updated_at: string;        // ISO 8601 格式
}

interface CourseReview {
  id: string;                // UUID
  user_id: string;          // 評價者ID
  schedule_id: string;      // 排程ID
  booking_id: string;       // 預約ID
  rating: number;           // 評分 (1-5)
  title: string;            // 評價標題
  content: string;          // 評價內容
  pros: string[];           // 優點
  cons: string[];           // 缺點
  difficulty_rating: number; // 難度評分 (1-5)
  instructor_rating: number; // 教師評分 (1-5)
  material_rating: number;   // 教材評分 (1-5)
  would_recommend: boolean;  // 是否推薦
  is_verified: boolean;     // 是否驗證過的評價
  helpful_votes: number;    // 有用票數
  created_at: string;       // ISO 8601 格式
  updated_at: string;       // ISO 8601 格式
}
```

#### API 設計

**課程日曆相關**
- `GET /api/v1/timeslots/calendar`：取得日曆格式的課程時段（僅status=CREATED且reserved_count<capacity）
- `GET /api/v1/timeslots/:id`：取得特定時段詳情
- `GET /api/v1/timeslots/available`：取得所有可預約時段

**預約管理相關**
- `POST /api/v1/bookings/batch`：批量預約多個時段（接收timeslot_ids[]）
- `GET /api/v1/bookings/my`：取得我的預約記錄
- `GET /api/v1/bookings/:id`：取得預約詳情
- `DELETE /api/v1/bookings/:id`：取消預約（>24h限制）

**學習追蹤相關**
- `GET /api/v1/students/my-courses`：取得我的課程清單
- `GET /api/v1/students/progress/:schedule_id`：取得特定課程進度

---

### 📌 功能名稱：課程內容管理
**所屬 APP**：Admin Portal  
**功能描述**：提供管理員管理課程模組、課程大綱、教學素材等課程內容的完整功能

#### User Story
| id | 標題 | 內容 | Acceptance Criteria |
|---|---|---|---|
| US-COURSEMOD-001 | 建立課程模組 | 作為管理員，我希望能夠建立標準化的課程模組，以便為不同排程使用 | 系統提供課程模組建立功能；包含課程資訊、大綱設定；支援多語言設定 |
| US-COURSEMOD-002 | 編輯課程模組內容 | 作為管理員，我希望能夠編輯課程模組的詳細內容，以便維護課程品質 | 系統提供完整編輯功能；包含描述、大綱、教材、先修條件；支援版本控制 |
| US-COURSEMOD-003 | 管理課程模組狀態 | 作為管理員，我希望能夠管理課程模組的發布狀態，以便控制課程可見性 | 系統提供啟用/停用功能；支援預覽模式；記錄狀態變更歷史 |
| US-COURSEMOD-004 | 複製課程模組 | 作為管理員，我希望能夠複製現有課程模組，以便快速建立相似課程 | 系統提供複製功能；可選擇複製內容範圍；自動產生新的模組ID |
| US-COURSEMOD-005 | 查看課程模組使用狀況 | 作為管理員，我希望能夠查看課程模組的使用狀況，以便了解課程熱門度 | 系統顯示關聯排程數量；顯示學生報名統計；提供使用趨勢分析 |

#### 資料 Schema (TypeScript Interface)
```typescript
interface CourseModule {
  id: string;                   // UUID
  title: string;                // 課程模組標題
  description: string;          // 詳細描述
  short_description: string;    // 簡短描述
  language: 'ENGLISH' | 'CHINESE' | 'JAPANESE';    // 教學語言
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'; // 難度等級
  categories: string[];         // 分類標籤
  target_audience: string;      // 目標學員
  learning_objectives: string[]; // 學習目標
  course_outline: CourseLesson[]; // 課程大綱
  materials: CourseMaterial[];   // 教學材料
  prerequisites: string;        // 先修要求
  estimated_duration_hours: number; // 預估總時數
  max_students_recommended: number; // 建議最大學生數
  difficulty_tags: string[];    // 難度標籤
  skills_covered: string[];     // 涵蓋技能
  cover_image_url: string;      // 封面圖片URL
  preview_video_url?: string;   // 預覽影片URL
  instructor_notes: string;     // 教師備註
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; // 模組狀態
  version: number;              // 版本號
  created_by: string;           // 建立者ID
  last_modified_by: string;     // 最後修改者ID
  created_at: string;           // ISO 8601 格式
  updated_at: string;           // ISO 8601 格式
  published_at?: string;        // 發布時間 ISO 8601
}

interface CourseLesson {
  id: string;                   // UUID
  module_id: string;           // 課程模組ID
  lesson_number: number;       // 課堂編號
  title: string;               // 課堂標題
  description: string;         // 課堂描述
  duration_minutes: number;    // 課堂時長（分鐘）
  learning_points: string[];   // 學習重點
  activities: string[];        // 課堂活動
  homework?: string;           // 作業內容
  resources: string[];         // 相關資源連結
  created_at: string;          // ISO 8601 格式
  updated_at: string;          // ISO 8601 格式
}

interface CourseMaterial {
  id: string;                  // UUID
  module_id: string;          // 課程模組ID
  title: string;              // 材料標題
  type: 'PDF' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'LINK' | 'INTERACTIVE'; // 材料類型
  file_url?: string;          // 檔案URL
  external_url?: string;      // 外部連結
  description: string;        // 材料描述
  is_required: boolean;       // 是否必需
  access_level: 'PUBLIC' | 'STUDENT_ONLY' | 'INSTRUCTOR_ONLY'; // 存取權限
  file_size?: number;         // 檔案大小（bytes）
  duration?: number;          // 影音長度（秒）
  created_at: string;         // ISO 8601 格式
  updated_at: string;         // ISO 8601 格式
}

interface CourseModuleVersion {
  id: string;                 // UUID
  module_id: string;         // 課程模組ID
  version_number: number;    // 版本號
  change_summary: string;    // 變更摘要
  changes_detail: Record<string, any>; // 詳細變更內容
  created_by: string;        // 建立者ID
  created_at: string;        // ISO 8601 格式
}
```

#### API 設計
- `GET /api/v1/admin/course-modules`：取得課程模組清單（支援篩選）
- `POST /api/v1/admin/course-modules`：建立課程模組
- `GET /api/v1/admin/course-modules/:id`：取得課程模組詳情
- `PUT /api/v1/admin/course-modules/:id`：更新課程模組
- `DELETE /api/v1/admin/course-modules/:id`：刪除課程模組
- `POST /api/v1/admin/course-modules/:id/duplicate`：複製課程模組
- `PUT /api/v1/admin/course-modules/:id/status`：更新模組狀態
- `GET /api/v1/admin/course-modules/:id/usage`：取得模組使用狀況
- `GET /api/v1/admin/course-modules/:id/versions`：取得版本歷史
- `POST /api/v1/admin/course-modules/:id/lessons`：新增課堂
- `PUT /api/v1/admin/course-modules/:id/lessons/:lesson_id`：更新課堂
- `DELETE /api/v1/admin/course-modules/:id/lessons/:lesson_id`：刪除課堂
- `POST /api/v1/admin/course-modules/:id/materials`：新增教材
- `PUT /api/v1/admin/course-modules/:id/materials/:material_id`：更新教材
- `DELETE /api/v1/admin/course-modules/:id/materials/:material_id`：刪除教材

---

### 📌 功能名稱：課程排程管理
**所屬 APP**：Admin Portal  
**功能描述**：基於課程模組建立具體的課程排程，設定開課日期、頻率、教師指派等排程相關功能

#### User Story
| id | 標題 | 內容 | Acceptance Criteria |
|---|---|---|---|
| US-SCHEDULE-001 | 基於模組建立排程 | 作為管理員，我希望能夠選擇課程模組來建立具體排程，以便安排實際授課 | 系統提供模組選擇功能；設定開課資訊；指派教師；計算課程時段 |
| US-SCHEDULE-002 | 設定排程參數 | 作為管理員，我希望能夠設定排程的詳細參數，以便符合實際需求 | 系統支援多種頻率設定；可設定容量限制；支援地點安排；處理時間衝突 |
| US-SCHEDULE-003 | 管理排程狀態 | 作為管理員，我希望能夠管理排程的狀態，以便控制課程開放報名 | 系統提供狀態切換功能；支援排程暫停/恢復；自動處理相關預約 |
| US-SCHEDULE-004 | 批量建立排程 | 作為管理員，我希望能夠批量建立多個排程，以便提高工作效率 | 系統支援批量操作；可設定排程模板；自動分配教師資源 |
| US-SCHEDULE-005 | 排程衝突檢測 | 作為管理員，我希望系統能夠檢測排程衝突，以便避免資源重複分配 | 系統自動檢測教師時間衝突；檢查教室使用衝突；提供衝突解決建議 |

#### 資料 Schema (TypeScript Interface)
```typescript
interface CourseSchedule {
  id: string;                   // UUID
  module_id: string;           // 課程模組ID
  title: string;               // 排程標題（可自訂或繼承模組標題）
  teacher_id: string;          // 指派教師ID
  location: string;            // 上課地點
  capacity: number;            // 容量限制
  start_date: string;          // 開始日期 YYYY-MM-DD
  end_date: string;            // 結束日期 YYYY-MM-DD
  schedule_pattern: SchedulePattern; // 排程模式
  pricing: SchedulePricing;    // 價格設定
  enrollment_start: string;    // 報名開始時間 ISO 8601
  enrollment_end: string;      // 報名結束時間 ISO 8601
  cancellation_deadline: string; // 取消截止時間 ISO 8601
  status: 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'; // 排程狀態
  special_notes?: string;      // 特殊備註
  tags: string[];             // 標籤
  is_featured: boolean;       // 是否推薦課程
  created_by: string;         // 建立者ID
  created_at: string;         // ISO 8601 格式
  updated_at: string;         // ISO 8601 格式
  published_at?: string;      // 發布時間 ISO 8601
}

interface SchedulePattern {
  frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'CUSTOM'; // 頻率
  days_of_week: number[];     // 星期幾 (0=週日, 1=週一...)
  time_slots: TimeSlot[];     // 時段設定
  duration_per_session: number; // 每堂課時長（分鐘）
  total_sessions: number;     // 總堂數
  exclude_dates?: string[];   // 排除日期 YYYY-MM-DD
  custom_dates?: string[];    // 自訂日期 YYYY-MM-DD (當frequency為CUSTOM時)
}

interface TimeSlot {
  start_time: string;         // 開始時間 HH:mm
  end_time: string;           // 結束時間 HH:mm
}

interface SchedulePricing {
  base_price: number;         // 基礎價格 (TWD)
  member_discount: number;    // 會員折扣百分比
  early_bird_price?: number;  // 早鳥價格 (TWD)
  early_bird_deadline?: string; // 早鳥截止日 ISO 8601
  group_discount_rules?: GroupDiscountRule[]; // 團體折扣規則
}

interface GroupDiscountRule {
  min_students: number;       // 最少學生數
  discount_percentage: number; // 折扣百分比
}

interface CourseSession {
  id: string;                 // UUID
  schedule_id: string;        // 排程ID
  module_id: string;          // 課程模組ID
  lesson_id?: string;         // 對應課堂ID
  session_number: number;     // 第幾堂課
  title: string;              // 課堂標題
  date: string;               // 上課日期 YYYY-MM-DD
  start_time: string;         // 開始時間 HH:mm
  end_time: string;           // 結束時間 HH:mm
  teacher_id: string;         // 教師ID
  location: string;           // 上課地點
  capacity: number;           // 容量
  enrolled_count: number;     // 已報名人數
  waitlist_count: number;     // 候補人數
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED'; // 時段狀態
  booking_deadline: string;   // 預約截止時間 ISO 8601
  special_instructions?: string; // 特殊說明
  materials_needed: string[]; // 需要的教材
  created_at: string;         // ISO 8601 格式
  updated_at: string;         // ISO 8601 格式
}
```

#### API 設計
- `GET /api/v1/admin/course-schedules`：取得課程排程清單（支援篩選）
- `POST /api/v1/admin/course-schedules`：建立課程排程
- `GET /api/v1/admin/course-schedules/:id`：取得排程詳情
- `PUT /api/v1/admin/course-schedules/:id`：更新課程排程
- `DELETE /api/v1/admin/course-schedules/:id`：刪除課程排程
- `POST /api/v1/admin/course-schedules/batch`：批量建立排程
- `PUT /api/v1/admin/course-schedules/:id/status`：更新排程狀態
- `GET /api/v1/admin/course-schedules/:id/sessions`：取得排程的所有時段
- `POST /api/v1/admin/course-schedules/:id/generate-sessions`：生成課程時段
- `PUT /api/v1/admin/course-schedules/:id/sessions/:session_id`：更新特定時段
- `POST /api/v1/admin/course-schedules/conflict-check`：檢查排程衝突
- `GET /api/v1/admin/course-schedules/templates`：取得排程模板
- `POST /api/v1/admin/course-schedules/templates`：建立排程模板

---

### 📌 功能名稱：課務管理系統
**所屬 APP**：Staff Portal, Admin Portal  
**功能描述**：提供校務人員與管理員管理課程時段、學員預約等日常營運功能。校務人員權限範圍限於指定課程營運管理，管理員擁有完整權限

#### User Story
| id | 標題 | 內容 | Acceptance Criteria |
|---|---|---|---|
| US-STAFF-001 | 課務取消課程 | 作為校務人員，我希望取消整個課程時段，以便老師臨時請假時能通知所有學員 | /timeslots/{id}/cancel將Timeslot.status→CANCELED；系統自動批次：將相關Timeslot狀態改成Canceled |
| US-STAFF-002 | 查看學員預約狀況 | 作為校務人員，我希望查看特定課程的學員預約狀況，以便協助處理預約問題 | 系統顯示課程預約清單；可查看學員資訊；可協助取消預約；可編輯學員基本資料 |
| US-STAFF-003 | 管理課程時段狀態 | 作為校務人員，我希望管理課程時段的狀態，以便處理突發狀況 | 可修改時段狀態；可調整容量；不可刪除已有預約的時段；不可修改全域課程設定 |
| US-STAFF-004 | 編輯學員個人資料 | 作為校務人員，我希望能夠編輯學員的個人資料，以便協助學員更新資訊或處理資料問題 | 可編輯姓名、電話、地址等基本資料；不可修改email、密碼；記錄修改歷史；需要修改原因 |

#### 資料 Schema (TypeScript Interface)
```typescript
interface TimeslotCancellation {
  id: string;                  // UUID
  timeslot_id: string;        // 時段ID
  cancelled_by: string;       // 取消者ID（課務人員）
  cancellation_reason: string; // 取消原因
  notification_sent: boolean; // 是否已發送通知
  affected_bookings: string[]; // 受影響的預約ID列表
  compensation_offered?: string; // 補償方案
  created_at: string;         // ISO 8601 格式
}

interface StudentNotification {
  id: string;                 // UUID
  user_id: string;           // 學員ID
  timeslot_id: string;       // 時段ID
  booking_id: string;        // 預約ID
  notification_type: 'CANCELLATION' | 'RESCHEDULE' | 'REMINDER'; // 通知類型
  title: string;             // 通知標題
  content: string;           // 通知內容
  sent_via: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP'; // 發送方式
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED'; // 發送狀態
  sent_at?: string;          // 發送時間 ISO 8601
  created_at: string;        // ISO 8601 格式
}

interface StaffPermission {
  id: string;                 // UUID
  staff_id: string;          // 校務人員ID
  permission_scope: 'TIMESLOT_MANAGEMENT' | 'BOOKING_MANAGEMENT' | 'STUDENT_VIEW' | 'USER_EDIT' | 'BASIC_REPORTS'; // 權限範圍
  resource_restrictions?: {   // 資源限制
    allowed_course_ids?: string[];  // 可管理的課程ID
    allowed_locations?: string[];   // 可管理的地點
    can_modify_capacity: boolean;   // 是否可修改容量
    can_cancel_bookings: boolean;   // 是否可取消預約
    can_edit_user_profile: boolean; // 是否可編輯用戶資料
  };
  granted_by: string;        // 授權者ID (管理員)
  granted_at: string;        // 授權時間 ISO 8601
  expires_at?: string;       // 過期時間 ISO 8601
  is_active: boolean;        // 是否啟用
}

interface UserProfileEdit {
  id: string;                // UUID
  user_id: string;          // 被編輯的用戶ID
  edited_by: string;        // 編輯者ID
  editor_role: 'STAFF' | 'ADMIN'; // 編輯者角色
  field_changes: Array<{    // 欄位變更記錄
    field_name: string;     // 欄位名稱
    old_value: string;      // 原值
    new_value: string;      // 新值
  }>;
  edit_reason: string;      // 編輯原因
  approved_by?: string;     // 審核者ID（如需審核）
  status: 'PENDING' | 'APPROVED' | 'REJECTED'; // 狀態
  created_at: string;       // ISO 8601 格式
  approved_at?: string;     // 審核時間 ISO 8601
}
```

#### API 設計

**校務人員API（權限限制版）**

**課程時段管理**
- `PUT /api/v1/staff/timeslots/:id/cancel`：取消課程時段（需權限檢查）
- `PUT /api/v1/staff/timeslots/:id/status`：更新時段狀態（需權限檢查）
- `PUT /api/v1/staff/timeslots/:id/capacity`：調整時段容量（需權限檢查）
- `GET /api/v1/staff/timeslots/my-managed`：取得我可管理的時段清單

**學員預約管理**
- `GET /api/v1/staff/bookings/by-timeslot/:id`：查看特定時段的預約狀況
- `DELETE /api/v1/staff/bookings/:id/cancel`：協助取消學員預約（需權限檢查）
- `GET /api/v1/staff/students/:id/profile`：查看學員完整資訊

**用戶資料管理**
- `PUT /api/v1/staff/users/:id/profile`：編輯用戶基本資料（需權限檢查）
- `GET /api/v1/staff/users/:id/edit-history`：查看用戶資料編輯歷史
- `GET /api/v1/staff/users/search`：搜尋用戶（依姓名、電話、email）

**通知管理**
- `POST /api/v1/staff/notifications/batch`：批量發送通知給學員
- `GET /api/v1/staff/notifications/:timeslot_id/status`：查看通知發送狀態

**基本報表**
- `GET /api/v1/staff/reports/timeslot-utilization`：時段使用率報表（限制範圍）
- `GET /api/v1/staff/reports/booking-statistics`：預約統計報表（限制範圍）

**管理員API（完整權限版）**

**課程時段管理**
- `PUT /api/v1/admin/timeslots/:id/cancel`：取消課程時段（無權限限制）
- `PUT /api/v1/admin/timeslots/:id/status`：更新時段狀態（無權限限制）
- `PUT /api/v1/admin/timeslots/:id/capacity`：調整時段容量（無權限限制）
- `DELETE /api/v1/admin/timeslots/:id/force-delete`：強制刪除時段（即使有預約）
- `GET /api/v1/admin/timeslots/all`：取得所有時段清單

**學員預約管理**
- `GET /api/v1/admin/bookings/all`：查看所有預約狀況
- `DELETE /api/v1/admin/bookings/:id/force-cancel`：強制取消學員預約
- `GET /api/v1/admin/students/:id/full-info`：查看學員完整資訊
- `PUT /api/v1/admin/bookings/:id/override`：覆寫預約設定

**通知管理**
- `POST /api/v1/admin/notifications/system-wide`：發送全系統通知
- `GET /api/v1/admin/notifications/all-status`：查看所有通知狀態

**完整報表**
- `GET /api/v1/admin/reports/comprehensive-utilization`：完整使用率報表
- `GET /api/v1/admin/reports/all-booking-statistics`：所有預約統計報表

---

### 📌 功能名稱：學員Dashboard
**所屬 APP**：Student Portal  
**功能描述**：提供學員查看會員卡狀態、下次課程安排等個人化資訊

#### User Story
| id | 標題 | 內容 | Acceptance Criteria |
|---|---|---|---|
| US-DASHBOARD-001 | Dashboard即時資訊 | 作為學員，我希望在首頁即時看到會員卡到期日與下次課程，以便隨時掌握我的使用狀況 | Dashboard能顯示會員資格(方案, 到期日)；顯示已預訂課程，按照上課時間排序(近→遠) |

#### 資料 Schema (TypeScript Interface)
```typescript
interface DashboardInfo {
  user_id: string;            // 用戶ID
  member_card?: {             // 會員卡資訊
    id: string;
    plan_title: string;       // 方案名稱
    type: 'SEASON' | 'YEAR';  // 方案類型
    status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
    expire_at: string;        // 到期日 ISO 8601
    days_remaining: number;   // 剩餘天數
  };
  upcoming_classes: Array<{   // 即將到來的課程
    booking_id: string;
    timeslot_id: string;
    title: string;            // 課程標題
    date: string;             // 上課日期 YYYY-MM-DD
    start_time: string;       // 開始時間 HH:mm
    end_time: string;         // 結束時間 HH:mm
    location: string;         // 上課地點
    teacher_name: string;     // 教師姓名
    can_cancel: boolean;      // 是否可取消
  }>;
  recent_activity: Array<{    // 最近活動
    type: 'BOOKING' | 'CANCELLATION' | 'COMPLETION';
    description: string;
    timestamp: string;        // ISO 8601 格式
  }>;
  generated_at: string;       // 資料生成時間 ISO 8601
}
```

#### API 設計
- `GET /api/v1/dashboard/my`：取得我的Dashboard資訊
- `GET /api/v1/dashboard/member-card-status`：取得會員卡狀態
- `GET /api/v1/dashboard/upcoming-classes`：取得即將到來的課程
- `GET /api/v1/dashboard/recent-activity`：取得最近活動記錄

---

### 📌 功能名稱：聯繫我們表單
**所屬 APP**：Student Portal  
**功能描述**：提供訪客及用戶從首頁聯繫我們按鈕填寫表單，提交諮詢或服務需求

#### User Story
| id | 標題 | 內容 | Acceptance Criteria |
|---|---|---|---|
| US-CONTACT-001 | 提交聯繫表單 | 作為網站訪客，我希望能夠透過聯繫表單提交諮詢，以便獲得相關服務資訊 | 系統提供完整聯繫表單；包含必填欄位驗證；提交成功後顯示確認訊息 |
| US-CONTACT-002 | 選擇諮詢類型 | 作為訪客，我希望能夠選擇不同的諮詢類型，以便系統分配給對應的專員處理 | 系統提供諮詢類型選項；不同類型有對應的處理流程；自動分配處理人員 |
| US-CONTACT-003 | 預約回覆時間 | 作為訪客，我希望能夠選擇偏好的聯繫時間，以便在方便的時候接聽電話 | 系統提供時間偏好選項；記錄聯繫時間需求；處理人員可查看時間偏好 |

#### 資料 Schema (TypeScript Interface)
```typescript
interface ContactInquiry {
  id: string;                    // UUID
  inquiry_type: 'COURSE_INFO' | 'MEMBERSHIP' | 'CORPORATE' | 'TECHNICAL' | 'OTHER'; // 諮詢類型
  contact_person: string;        // 聯繫人姓名
  email: string;                 // 聯繫信箱
  phone: string;                 // 聯繫電話
  company_name?: string;         // 公司名稱 (企業諮詢)
  subject: string;               // 諮詢主題
  message: string;               // 詳細訊息
  preferred_contact_method: 'EMAIL' | 'PHONE' | 'BOTH'; // 偏好聯繫方式
  preferred_contact_time?: string; // 偏好聯繫時間
  source: 'WEBSITE' | 'MOBILE_APP' | 'REFERRAL' | 'ADVERTISEMENT'; // 來源
  user_id?: string;              // 關聯用戶ID (如果是登入用戶)
  ip_address: string;            // 提交者IP位址
  user_agent: string;            // 瀏覽器資訊
  utm_source?: string;           // UTM來源追踪
  utm_medium?: string;           // UTM媒介追踪
  utm_campaign?: string;         // UTM活動追踪
  status: 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'REPLIED' | 'CLOSED'; // 處理狀態
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'; // 優先級
  assigned_to?: string;          // 指派處理人員ID
  assigned_at?: string;          // 指派時間 ISO 8601
  first_response_at?: string;    // 首次回應時間 ISO 8601
  resolved_at?: string;          // 解決時間 ISO 8601
  created_at: string;            // ISO 8601 格式
  updated_at: string;            // ISO 8601 格式
}

interface ContactResponse {
  id: string;                    // UUID
  inquiry_id: string;            // 聯繫案件ID
  responder_id: string;          // 回應者ID
  responder_name: string;        // 回應者姓名
  response_type: 'EMAIL' | 'PHONE' | 'INTERNAL_NOTE'; // 回應類型
  content: string;               // 回應內容
  is_internal: boolean;          // 是否為內部備註
  attachments?: string[];        // 附件URL列表
  created_at: string;            // ISO 8601 格式
}
```

#### API 設計
- `POST /api/v1/contact-inquiries`：提交聯繫表單
- `GET /api/v1/contact-inquiries/:id`：取得特定諮詢案件詳情
- `PUT /api/v1/contact-inquiries/:id/status`：更新案件狀態
- `POST /api/v1/contact-inquiries/:id/responses`：新增回應記錄

---

### 📌 功能名稱：案件管理系統
**所屬 APP**：Admin Portal  
**功能描述**：提供管理員管理所有聯繫諮詢案件，包含案件分配、回應處理、狀態追蹤等功能

#### User Story
| id | 標題 | 內容 | Acceptance Criteria |
|---|---|---|---|
| US-CASE-001 | 查看案件清單 | 作為客服人員，我希望能夠查看所有待處理的諮詢案件，以便及時回應客戶需求 | 系統顯示所有案件清單；支援狀態、類型、優先級篩選；顯示處理時效 |
| US-CASE-002 | 案件分配管理 | 作為主管，我希望能夠將案件分配給合適的處理人員，以便提高處理效率 | 系統提供案件指派功能；可選擇處理人員；自動發送通知；記錄分配歷史 |
| US-CASE-003 | 回應客戶諮詢 | 作為客服人員，我希望能夠回應客戶諮詢，以便解決客戶問題 | 系統提供回應編輯功能；支援多種回應方式；自動記錄回應時間；更新案件狀態 |
| US-CASE-004 | 案件統計報表 | 作為主管，我希望能夠查看案件處理統計，以便評估團隊績效 | 系統提供統計報表；顯示處理時效、解決率；支援時間區間篩選；可匯出報表 |

#### 資料 Schema (TypeScript Interface)
```typescript
interface CaseAssignment {
  id: string;                    // UUID
  inquiry_id: string;            // 案件ID
  assigned_from?: string;        // 原處理人員ID
  assigned_to: string;           // 新處理人員ID
  assigned_by: string;           // 指派者ID
  assignment_reason?: string;    // 指派原因
  previous_status: string;       // 原狀態
  new_status: string;           // 新狀態
  created_at: string;           // ISO 8601 格式
}

interface CaseWorklog {
  id: string;                    // UUID
  inquiry_id: string;            // 案件ID
  staff_id: string;             // 處理人員ID
  staff_name: string;           // 處理人員姓名
  action_type: 'CREATED' | 'ASSIGNED' | 'RESPONDED' | 'STATUS_CHANGED' | 'CLOSED'; // 動作類型
  description: string;           // 動作描述
  time_spent?: number;          // 花費時間(分鐘)
  created_at: string;           // ISO 8601 格式
}

interface CaseStatistics {
  period: string;               // 統計期間 YYYY-MM
  total_cases: number;          // 總案件數
  new_cases: number;           // 新增案件數
  resolved_cases: number;      // 已解決案件數
  pending_cases: number;       // 待處理案件數
  average_response_time: number; // 平均回應時間(小時)
  average_resolution_time: number; // 平均解決時間(小時)
  satisfaction_score?: number;   // 滿意度評分
  by_inquiry_type: Record<string, number>; // 依諮詢類型統計
  by_staff: Array<{             // 依人員統計
    staff_id: string;
    staff_name: string;
    cases_handled: number;
    avg_response_time: number;
    resolution_rate: number;
  }>;
  created_at: string;           // ISO 8601 格式
}

interface CaseTemplate {
  id: string;                   // UUID
  name: string;                 // 範本名稱
  inquiry_type: string;         // 適用諮詢類型
  subject: string;              // 主題範本
  content: string;              // 內容範本
  variables: string[];          // 可用變數列表
  is_active: boolean;           // 是否啟用
  created_by: string;           // 建立者ID
  created_at: string;           // ISO 8601 格式
  updated_at: string;           // ISO 8601 格式
}
```

#### API 設計
- `GET /api/v1/admin/contact-inquiries`：取得案件清單（支援篩選）
- `GET /api/v1/admin/contact-inquiries/:id`：取得案件詳情
- `PUT /api/v1/admin/contact-inquiries/:id/assign`：分配案件
- `POST /api/v1/admin/contact-inquiries/:id/responses`：新增回應
- `PUT /api/v1/admin/contact-inquiries/:id/status`：更新案件狀態
- `GET /api/v1/admin/case-statistics`：取得案件統計
- `GET /api/v1/admin/case-templates`：取得回應範本
- `POST /api/v1/admin/case-templates`：建立回應範本
- `GET /api/v1/admin/staff-workload`：取得人員工作負荷

---

### 📌 功能名稱：教學排程管理
**所屬 APP**：Teacher Portal  
**功能描述**：提供教師查看教學排程、管理學生名單、準備課程等功能

#### User Story
| id | 標題 | 內容 | Acceptance Criteria |
|---|---|---|---|
| US-TEACH-001 | 查看教學排程 | 作為教師，我希望能夠查看我的教學排程，以便安排教學準備 | 系統顯示一週內所有課程；包含時間、地點、學生人數；支援月曆檢視 |
| US-TEACH-002 | 管理學生名單 | 作為教師，我希望能夠查看每堂課的學生名單，以便課前準備 | 系統顯示已預約學生資訊；包含出席紀錄；支援匯出功能 |
| US-TEACH-003 | 記錄課程筆記 | 作為教師，我希望能夠記錄每堂課的教學筆記，以便追蹤教學進度 | 系統提供筆記編輯功能；自動儲存；支援檔案附件 |

#### 資料 Schema (TypeScript Interface)
```typescript
interface Teacher {
  id: string;                   // UUID
  user_id: string;             // 關聯用戶ID
  employee_id: string;         // 員工編號
  name: string;                // 教師姓名
  email: string;               // 電子郵件
  phone: string;               // 電話號碼
  specialties: string[];       // 專長領域
  languages: string[];         // 教學語言
  experience_years: number;    // 教學經驗年數
  bio: string;                // 個人簡介
  profile_image_url: string;   // 個人照片URL
  rating: number;             // 教師評分 (0-5)
  total_students: number;     // 累計教學學生數
  is_active: boolean;         // 是否在職
  created_at: string;         // ISO 8601 格式
  updated_at: string;         // ISO 8601 格式
}

interface TeachingSchedule {
  id: string;                 // UUID
  teacher_id: string;        // 教師ID
  session_id: string;        // 課程時段ID
  preparation_notes?: string; // 課前準備筆記
  teaching_notes?: string;    // 課後教學筆記
  attendance_recorded: boolean; // 是否已記錄出席
  materials_prepared: boolean;  // 是否已準備教材
  created_at: string;        // ISO 8601 格式
  updated_at: string;        // ISO 8601 格式
}

interface StudentAttendance {
  id: string;                // UUID
  booking_id: string;       // 預約ID
  session_id: string;       // 課程時段ID
  student_id: string;       // 學生ID
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; // 出席狀態
  arrival_time?: string;    // 到達時間 HH:mm
  notes?: string;           // 備註
  recorded_by: string;      // 記錄者ID
  recorded_at: string;      // 記錄時間 ISO 8601
}
```

#### API 設計
- `GET /api/v1/teachers/:id/schedule`：取得教師排程
- `GET /api/v1/sessions/:id/students`：取得課程學生名單
- `POST /api/v1/sessions/:id/attendance`：記錄學生出席
- `PUT /api/v1/sessions/:id/notes`：更新課程筆記
- `GET /api/v1/teachers/:id/statistics`：取得教師統計資料

---

### 📌 功能名稱：請假申請系統
**所屬 APP**：Teacher Portal  
**功能描述**：提供教師請假申請、審核流程、代課安排等功能

#### User Story
| id | 標題 | 內容 | Acceptance Criteria |
|---|---|---|---|
| US-LEAVE-001 | 申請請假 | 作為教師，我希望能夠申請請假，以便處理個人事務 | 系統提供請假表單；選擇影響課程；自動計算影響範圍；發送審核通知 |
| US-LEAVE-002 | 查看請假狀態 | 作為教師，我希望能夠查看請假申請狀態，以便了解審核進度 | 系統顯示所有請假記錄；包含審核狀態；提供取消功能 |
| US-LEAVE-003 | 審核請假申請 | 作為管理員，我希望能夠審核教師請假申請，以便維護教學品質 | 系統顯示待審核申請；提供批准/拒絕選項；自動通知申請者 |

#### 資料 Schema (TypeScript Interface)
```typescript
interface LeaveRequest {
  id: string;                 // UUID
  teacher_id: string;        // 教師ID
  leave_type: 'SICK' | 'PERSONAL' | 'EMERGENCY' | 'ANNUAL' | 'MATERNITY'; // 請假類型
  start_date: string;        // 開始日期 ISO 8601
  end_date: string;          // 結束日期 ISO 8601
  reason: string;            // 請假原因
  affected_sessions: string[]; // 影響的課程時段ID
  substitute_teacher_id?: string; // 代課教師ID
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'; // 申請狀態
  submitted_at: string;      // 提交時間 ISO 8601
  reviewed_at?: string;      // 審核時間 ISO 8601
  reviewer_id?: string;      // 審核者ID
  review_notes?: string;     // 審核備註
  impact_level: 'LOW' | 'MEDIUM' | 'HIGH'; // 影響程度
}

interface SubstituteArrangement {
  id: string;                // UUID
  leave_request_id: string;  // 請假申請ID
  original_teacher_id: string; // 原教師ID
  substitute_teacher_id: string; // 代課教師ID
  session_id: string;        // 課程時段ID
  arrangement_status: 'PENDING' | 'CONFIRMED' | 'DECLINED'; // 安排狀態
  notes?: string;            // 安排備註
  created_at: string;        // ISO 8601 格式
  updated_at: string;        // ISO 8601 格式
}
```

#### API 設計
- `POST /api/v1/leave-requests`：提交請假申請
- `GET /api/v1/leave-requests/my`：取得我的請假記錄
- `PUT /api/v1/leave-requests/:id/cancel`：取消請假申請
- `GET /api/v1/leave-requests`：取得所有請假申請（管理員）
- `PUT /api/v1/leave-requests/:id/review`：審核請假申請
- `POST /api/v1/substitute-arrangements`：安排代課

---

### 📌 功能名稱：用戶管理系統
**所屬 APP**：Admin Portal  
**功能描述**：提供管理員管理所有用戶帳號、權限、狀態等功能

#### User Story
| id | 標題 | 內容 | Acceptance Criteria |
|---|---|---|---|
| US-ADMIN-001 | 查看用戶清單 | 作為管理員，我希望能夠查看所有用戶清單，以便管理用戶帳號 | 系統顯示所有用戶資訊；支援角色、狀態篩選；提供搜尋功能 |
| US-ADMIN-002 | 管理用戶狀態 | 作為管理員，我希望能夠管理用戶帳號狀態，以便維護系統安全 | 系統提供啟用/停用功能；記錄異動歷史；自動通知用戶 |
| US-ADMIN-003 | 重設用戶密碼 | 作為管理員，我希望能夠重設用戶密碼，以便協助忘記密碼的用戶 | 系統生成臨時密碼；發送至用戶信箱；要求首次登入修改 |
| US-ADMIN-004 | 管理校務人員權限 | 作為管理員，我希望能夠管理校務人員的權限範圍，以便控制其操作權限 | 系統提供權限設定介面；可指定管理範圍；可設定權限到期時間；記錄權限變更歷史 |
| US-ADMIN-005 | 執行所有課務操作 | 作為管理員，我希望能夠執行所有校務人員可做的操作，並且沒有權限限制 | 管理員可使用所有/admin/和/staff/ API；無資源存取限制；可強制執行緊急操作 |
| US-ADMIN-006 | 管理員課務操作 | 作為管理員，我希望擁有所有課務功能的完整權限，以便處理各種緊急狀況 | 擁有所有校務人員功能；可跨越權限限制；可修改全域設定；可強制取消預約；可查看完整學員資料 |

#### 資料 Schema (TypeScript Interface)
```typescript
interface UserManagement {
  id: string;                // UUID
  user_id: string;          // 用戶ID
  admin_id: string;         // 管理員ID
  action_type: 'CREATE' | 'UPDATE' | 'SUSPEND' | 'ACTIVATE' | 'DELETE'; // 操作類型
  previous_values?: Record<string, any>; // 變更前數值
  new_values?: Record<string, any>;     // 變更後數值
  reason?: string;          // 操作原因
  ip_address: string;       // 操作IP
  created_at: string;       // ISO 8601 格式
}

interface SystemRole {
  id: string;               // UUID
  name: string;            // 角色名稱
  display_name: string;    // 顯示名稱
  description: string;     // 角色描述
  permissions: string[];   // 權限列表
  is_system_role: boolean; // 是否為系統預設角色
  created_at: string;      // ISO 8601 格式
  updated_at: string;      // ISO 8601 格式
}

interface UserRole {
  id: string;              // UUID
  user_id: string;        // 用戶ID
  role_id: string;        // 角色ID
  assigned_by: string;    // 指派者ID
  assigned_at: string;    // 指派時間 ISO 8601
  expires_at?: string;    // 過期時間 ISO 8601
}
```

#### API 設計

**用戶管理**
- `GET /api/v1/admin/users`：取得用戶清單
- `GET /api/v1/admin/users/:id`：取得用戶詳情
- `PUT /api/v1/admin/users/:id/status`：更新用戶狀態
- `POST /api/v1/admin/users/:id/reset-password`：重設密碼
- `GET /api/v1/admin/users/:id/activity-log`：取得用戶活動記錄

**角色與權限管理**
- `POST /api/v1/admin/roles`：建立角色
- `PUT /api/v1/admin/users/:id/roles`：指派角色
- `GET /api/v1/admin/staff-permissions`：取得校務人員權限清單
- `POST /api/v1/admin/staff-permissions`：建立校務人員權限
- `PUT /api/v1/admin/staff-permissions/:id`：更新校務人員權限
- `DELETE /api/v1/admin/staff-permissions/:id`：撤銷校務人員權限
- `GET /api/v1/admin/staff-permissions/:staff_id/history`：取得權限變更歷史

**用戶資料管理（繼承校務人員功能）**
- `PUT /api/v1/admin/users/:id/profile`：編輯用戶基本資料（無權限限制）
- `GET /api/v1/admin/users/:id/edit-history`：查看用戶資料編輯歷史
- `GET /api/v1/admin/users/search`：搜尋用戶（依姓名、電話、email）
- `POST /api/v1/admin/users/:id/force-profile-update`：強制更新用戶資料（緊急情況）

---

### 📌 功能名稱：訂單與付款管理
**所屬 APP**：Admin Portal  
**功能描述**：提供管理員管理所有訂單、付款狀態、退款處理等功能

#### User Story
| id | 標題 | 內容 | Acceptance Criteria |
|---|---|---|---|
| US-ORDER-001 | 查看訂單清單 | 作為管理員，我希望能夠查看所有訂單，以便管理交易狀況 | 系統顯示所有訂單；支援狀態、日期篩選；顯示付款資訊 |
| US-ORDER-002 | 處理退款申請 | 作為管理員，我希望能夠處理退款申請，以便維護客戶關係 | 系統提供退款處理介面；記錄退款原因；自動更新訂單狀態 |
| US-ORDER-003 | 查看付款統計 | 作為管理員，我希望能夠查看付款統計資料，以便了解營收狀況 | 系統提供營收報表；支援時間區間篩選；顯示趨勢圖表 |

#### 資料 Schema (TypeScript Interface)
```typescript
interface Order {
  id: string;                    // UUID
  order_number: string;          // 訂單編號
  user_id: string;              // 用戶ID
  user_email?: string;          // 非登入用戶email
  user_name?: string;           // 非登入用戶姓名
  item_type: 'MEMBERSHIP' | 'COURSE' | 'MATERIAL'; // 購買項目類型
  item_id: string;              // 項目ID
  item_name: string;            // 項目名稱
  quantity: number;             // 數量
  unit_price: number;           // 單價 (TWD)
  total_amount: number;         // 總金額 (TWD)
  discount_amount: number;      // 折扣金額 (TWD)
  final_amount: number;         // 最終金額 (TWD)
  currency: string;             // 貨幣代碼
  status: 'CREATED' | 'PAID' | 'CANCELLED' | 'REFUNDED' | 'EXPIRED'; // 訂單狀態
  payment_method?: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CASH' | 'OTHER'; // 付款方式
  payment_status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'; // 付款狀態
  payment_id?: string;          // 第三方付款ID
  expires_at: string;           // 過期時間 ISO 8601
  created_at: string;           // ISO 8601 格式
  updated_at: string;           // ISO 8601 格式
  paid_at?: string;             // 付款時間 ISO 8601
}

interface PaymentTransaction {
  id: string;                   // UUID
  order_id: string;            // 訂單ID
  transaction_id: string;      // 交易ID
  gateway: 'STRIPE' | 'NEWEBPAY' | 'ECPAY' | 'PAYPAL'; // 付款閘道
  amount: number;              // 金額 (TWD)
  currency: string;            // 貨幣代碼
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'; // 交易狀態
  gateway_response: Record<string, any>; // 閘道回應資料
  processed_at: string;        // 處理時間 ISO 8601
  created_at: string;          // ISO 8601 格式
}

interface RefundRequest {
  id: string;                  // UUID
  order_id: string;           // 訂單ID
  user_id: string;            // 申請用戶ID
  amount: number;             // 退款金額 (TWD)
  reason: string;             // 退款原因
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED'; // 申請狀態
  admin_notes?: string;       // 管理員備註
  processed_by?: string;      // 處理者ID
  requested_at: string;       // 申請時間 ISO 8601
  processed_at?: string;      // 處理時間 ISO 8601
}
```

#### API 設計
- `GET /api/v1/admin/orders`：取得訂單清單
- `GET /api/v1/admin/orders/:id`：取得訂單詳情
- `PUT /api/v1/admin/orders/:id/status`：更新訂單狀態
- `POST /api/v1/admin/orders/:id/refund`：處理退款
- `GET /api/v1/admin/payments/statistics`：取得付款統計
- `GET /api/v1/admin/refund-requests`：取得退款申請清單
- `PUT /api/v1/admin/refund-requests/:id/review`：審核退款申請

---

### 📌 功能名稱：企業客戶管理
**所屬 APP**：Corporate Portal, Admin Portal  
**功能描述**：提供企業方案諮詢申請、管理員指派企業方案、企業窗口席次管理、學員會員卡啟用等完整企業學習管理功能

#### User Story
| id | 標題 | 內容 | Acceptance Criteria |
|---|---|---|---|
| US-CORP-001 | 企業方案諮詢申請 | 作為企業客戶，我希望能夠透過諮詢申請企業學習方案，以便為員工提供學習資源 | 系統提供企業諮詢表單；包含企業資訊及需求；自動轉給管理員處理 |
| US-CORP-002 | 管理員指派企業方案 | 作為管理員，我希望能夠為企業客戶指派適合的方案和席次，以便提供客製化服務 | 系統提供企業方案指派功能；可設定席次數量；設定方案使用期限；建立企業窗口帳號 |
| US-CORP-003 | 企業窗口管理學員席次 | 作為企業窗口，我希望能夠為員工開通學習帳號，以便員工使用學習資源 | 系統檢查剩餘席次；為學員建立會員卡；記錄開通時間；自動計算結束時間；扣除席次 |
| US-CORP-004 | 企業窗口查看席次使用狀況 | 作為企業窗口，我希望能夠查看席次使用狀況，以便合理分配學習資源 | 系統顯示總席次、已使用席次、剩餘席次；顯示方案期限；列出已開通學員清單 |
| US-CORP-005 | 學員啟用企業會員卡 | 作為被分配的學員，我希望能夠啟用企業提供的會員卡，以便使用學習權益 | 系統驗證學員身份；啟用會員卡；設定開始和結束時間；更新會員狀態為ACTIVE |
| US-CORP-006 | 員工學習追蹤 | 作為企業窗口，我希望能夠追蹤員工學習進度，以便評估培訓效果 | 系統提供學習報表；顯示完課率；支援匯出功能；顯示使用期限狀態 |

#### 資料 Schema (TypeScript Interface)
```typescript
interface CorporateClient {
  id: string;                    // UUID
  company_name: string;          // 公司名稱
  business_registration: string; // 商業登記號碼
  industry: string;             // 行業別
  contact_person: string;       // 聯絡人
  contact_email: string;        // 聯絡信箱
  contact_phone: string;        // 聯絡電話
  address: string;              // 公司地址
  employee_count: number;       // 員工人數
  account_manager_id?: string;  // 業務負責人ID
  corporate_admin_id: string;   // 企業窗口管理員ID
  inquiry_id?: string;          // 關聯的企業諮詢案件ID
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'; // 客戶狀態
  billing_info: CorporateBilling; // 帳單資訊
  created_at: string;           // ISO 8601 格式
  updated_at: string;           // ISO 8601 格式
}

interface CorporateBilling {
  company_name: string;         // 帳單公司名稱
  tax_id: string;              // 統一編號
  billing_address: string;     // 帳單地址
  billing_email: string;       // 帳單信箱
  payment_terms: number;       // 付款條件(天數)
  preferred_payment_method: 'INVOICE' | 'BANK_TRANSFER' | 'CREDIT_CARD'; // 偏好付款方式
}

interface CorporateSubscription {
  id: string;                  // UUID
  corporate_id: string;       // 企業ID
  plan_id: string;            // 方案ID
  assigned_by: string;        // 指派管理員ID
  total_seats: number;        // 總席次數
  used_seats: number;         // 已使用席次數
  remaining_seats: number;    // 剩餘席次數
  plan_start_date: string;    // 方案開始日期 ISO 8601
  plan_end_date: string;      // 方案結束日期 ISO 8601
  seat_activation_deadline: string; // 席次開通截止日期 ISO 8601
  membership_duration_days: number; // 會員卡有效天數
  monthly_fee: number;        // 月費 (TWD)
  custom_features: string[];  // 客製化功能
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED'; // 訂閱狀態
  assigned_at: string;        // 指派時間 ISO 8601
  created_at: string;         // ISO 8601 格式
  updated_at: string;         // ISO 8601 格式
}

interface CorporateEmployee {
  id: string;                 // UUID
  corporate_id: string;      // 企業ID
  subscription_id: string;   // 企業訂閱ID
  employee_id: string;       // 員工ID (企業內部編號)
  employee_name: string;     // 員工姓名
  employee_email: string;    // 員工信箱
  user_id?: string;          // 對應系統用戶ID
  department: string;        // 部門
  seat_assigned_by: string;  // 席次分配者ID (企業窗口)
  seat_assigned_at: string;  // 席次分配時間 ISO 8601
  membership_activated: boolean; // 會員卡是否已啟用
  membership_activated_at?: string; // 會員卡啟用時間 ISO 8601
  membership_start_date?: string;   // 會員卡開始日期 ISO 8601
  membership_end_date?: string;     // 會員卡結束日期 ISO 8601
  membership_status: 'ASSIGNED' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED'; // 會員狀態
  courses_enrolled: number;  // 報名課程數
  courses_completed: number; // 完成課程數
  total_study_hours: number; // 總學習時數
  last_activity?: string;    // 最後活動時間 ISO 8601
  created_at: string;        // ISO 8601 格式
  updated_at: string;        // ISO 8601 格式
}

interface CorporateInquiry {
  id: string;                // UUID
  company_name: string;      // 公司名稱
  contact_person: string;    // 聯絡人
  contact_email: string;     // 聯絡信箱
  contact_phone: string;     // 聯絡電話
  employee_count: number;    // 預估員工人數
  industry: string;          // 行業別
  learning_requirements: string; // 學習需求描述
  preferred_plan_type: string;   // 偏好方案類型
  budget_range?: string;     // 預算範圍
  status: 'NEW' | 'PROCESSING' | 'QUOTED' | 'APPROVED' | 'REJECTED'; // 諮詢狀態
  assigned_to?: string;      // 指派處理人員ID
  admin_notes?: string;      // 管理員備註
  created_at: string;        // ISO 8601 格式
  updated_at: string;        // ISO 8601 格式
  processed_at?: string;     // 處理時間 ISO 8601
}
```

#### API 設計

**企業諮詢相關**
- `POST /api/v1/corporate/inquiries`：提交企業方案諮詢申請
- `GET /api/v1/admin/corporate/inquiries`：取得企業諮詢清單（管理員）
- `PUT /api/v1/admin/corporate/inquiries/:id/assign`：指派企業方案和席次（管理員）
- `PUT /api/v1/admin/corporate/inquiries/:id/status`：更新諮詢狀態（管理員）

**企業窗口管理相關**
- `GET /api/v1/corporate/my-subscription`：取得我的企業訂閱資訊（企業窗口）
- `GET /api/v1/corporate/seat-usage`：取得席次使用狀況（企業窗口）
- `POST /api/v1/corporate/employees`：為員工分配學習席次（企業窗口）
- `GET /api/v1/corporate/employees`：取得員工清單和狀態（企業窗口）
- `PUT /api/v1/corporate/employees/:id/suspend`：暫停員工會員資格（企業窗口）

**學員相關**
- `GET /api/v1/memberships/corporate`：取得企業分配的會員卡（學員）
- `POST /api/v1/memberships/corporate/:id/activate`：啟用企業會員卡（學員）

**管理員企業管理相關**
- `GET /api/v1/admin/corporate/clients`：取得企業客戶清單（管理員）
- `GET /api/v1/admin/corporate/clients/:id`：取得企業客戶詳情（管理員）
- `POST /api/v1/admin/corporate/subscriptions`：建立企業訂閱（管理員）
- `PUT /api/v1/admin/corporate/subscriptions/:id`：更新企業訂閱（管理員）
- `GET /api/v1/admin/corporate/:id/reports`：取得企業學習報表（管理員）

---

### 📌 功能名稱：代理管理系統
**所屬 APP**：Admin Portal  
**功能描述**：提供多角色代理管理、分紅制度設定、銷售追蹤等功能

#### User Story
| id | 標題 | 內容 | Acceptance Criteria |
|---|---|---|---|
| US-AGENT-001 | 查看代理清單 | 作為管理員，我希望能夠查看所有代理的清單，以便管理代理夥伴 | 系統顯示代理基本資訊、角色、業績；支援搜尋和篩選；可按代理類型分類顯示 |
| US-AGENT-002 | 新增代理 | 作為管理員，我希望能夠新增代理夥伴，以便擴展銷售網絡 | 支援個人和企業代理；可選擇代理角色和分紅比例；自動生成代理代碼和推廣連結 |
| US-AGENT-003 | 管理代理角色 | 作為管理員，我希望能夠設定不同的代理角色和分紅比例，以便靈活管理獎勵機制 | 可新增/編輯/刪除代理角色；設定分紅比例上限；總分紅比例不可超過100% |
| US-AGENT-004 | 查看銷售記錄 | 作為管理員，我希望能夠查看代理的銷售記錄，以便追蹤業績表現 | 顯示詳細銷售資訊；包含分紅計算；支援時間篩選；可匯出報表 |
| US-AGENT-005 | 代理業績統計 | 作為管理員，我希望能夠查看代理業績統計，以便評估代理表現 | 提供總銷售額、分紅金額、排行榜；月度業績比較；最佳代理獎勵顯示 |

#### 資料 Schema (TypeScript Interface)
```typescript
interface Agent {
  id: string;                    // UUID
  name: string;                  // 代理名稱
  email: string;                 // 聯絡信箱
  phone: string;                 // 聯絡電話
  agent_type: 'AGENT' | 'CONSULTANT' | 'TEACHER' | 'STUDENT' | 'CORPORATE'; // 代理類型
  role_id: string;              // 代理角色ID
  role_name: string;            // 代理角色名稱
  role_percentage: number;      // 分紅比例
  agent_code: string;           // 代理代碼
  referral_link: string;        // 推廣連結
  is_company: boolean;          // 是否為企業代理
  company_name?: string;        // 公司名稱
  contact_person?: string;      // 聯絡人
  bank_account?: string;        // 銀行帳號
  tax_id?: string;             // 統一編號
  address?: string;            // 地址
  join_date: string;           // 加入日期 ISO 8601
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'; // 狀態
  total_sales: number;         // 總銷售額
  month_sales: number;         // 月銷售額
  total_commission: number;    // 總分紅
  month_commission: number;    // 月分紅
  sales_count: number;         // 銷售筆數
  month_sales_count: number;   // 月銷售筆數
  last_sale_date?: string;     // 最後銷售日期 ISO 8601
  notes?: string;              // 備註
  created_at: string;          // ISO 8601 格式
  updated_at: string;          // ISO 8601 格式
}

interface AgentRole {
  id: string;                  // UUID
  agent_type: 'AGENT' | 'CONSULTANT' | 'TEACHER' | 'STUDENT' | 'CORPORATE'; // 代理類型
  name: string;               // 角色名稱
  percentage: number;         // 分紅比例
  description: string;        // 角色描述
  is_active: boolean;         // 是否啟用
  created_at: string;         // ISO 8601 格式
  updated_at: string;         // ISO 8601 格式
}

interface CommissionSetting {
  id: string;                 // UUID
  agent_type: 'AGENT' | 'CONSULTANT' | 'TEACHER' | 'STUDENT' | 'CORPORATE'; // 代理類型
  name: string;              // 設定名稱
  total_commission: number;  // 總分紅比例上限
  is_active: boolean;        // 是否啟用
  created_at: string;        // ISO 8601 格式
  updated_at: string;        // ISO 8601 格式
}

interface SalesRecord {
  id: string;                 // UUID
  agent_id: string;          // 代理ID
  agent_code: string;        // 代理代碼
  customer_name: string;     // 客戶姓名
  customer_email: string;    // 客戶信箱
  product_type: 'INDIVIDUAL' | 'CORPORATE'; // 產品類型
  plan_name: string;         // 方案名稱
  sale_amount: number;       // 銷售金額
  commission: number;        // 分紅金額
  commission_rate: number;   // 分紅比例
  sale_date: string;         // 銷售日期 ISO 8601
  payment_status: 'PAID' | 'PENDING' | 'FAILED'; // 付款狀態
  referral_method: 'LINK' | 'CODE'; // 推廣方式
  order_number: string;      // 訂單編號
  notes?: string;           // 備註
  created_at: string;       // ISO 8601 格式
}
```

#### API 設計

**代理管理**
- `GET /api/v1/admin/agents`：取得代理清單
- `POST /api/v1/admin/agents`：新增代理
- `GET /api/v1/admin/agents/:id`：取得代理詳情
- `PUT /api/v1/admin/agents/:id`：更新代理資料
- `DELETE /api/v1/admin/agents/:id`：刪除代理
- `PUT /api/v1/admin/agents/:id/status`：更新代理狀態

**角色管理**
- `GET /api/v1/admin/agent-roles`：取得代理角色清單
- `POST /api/v1/admin/agent-roles`：新增代理角色
- `PUT /api/v1/admin/agent-roles/:id`：更新代理角色
- `DELETE /api/v1/admin/agent-roles/:id`：刪除代理角色

**分紅設定**
- `GET /api/v1/admin/commission-settings`：取得分紅設定
- `PUT /api/v1/admin/commission-settings/:type`：更新分紅設定

**銷售記錄**
- `GET /api/v1/admin/sales-records`：取得銷售記錄
- `GET /api/v1/admin/agents/:id/sales`：取得特定代理銷售記錄
- `GET /api/v1/admin/sales-statistics`：取得銷售統計

**數據匯出**
- `GET /api/v1/admin/agents/export`：匯出代理數據
- `GET /api/v1/admin/sales-records/export`：匯出銷售記錄

---

### 📌 功能名稱：推薦系統
**所屬 APP**：Student Portal, Admin Portal  
**功能描述**：提供推薦代碼生成、使用追蹤、佣金計算等功能

#### User Story
| id | 標題 | 內容 | Acceptance Criteria |
|---|---|---|---|
| US-REFERRAL-001 | 查看推薦代碼 | 作為用戶，我希望能夠查看我的推薦代碼，以便分享給朋友獲得佣金 | 顯示個人專屬推薦代碼；提供複製功能；顯示使用統計和佣金收益 |
| US-REFERRAL-002 | 生成推薦連結 | 作為用戶，我希望能夠生成推薦連結，以便透過不同管道分享 | 自動生成推薦連結；可複製連結；支援UTM參數追蹤 |
| US-REFERRAL-003 | 查看推薦統計 | 作為用戶，我希望能夠查看推薦統計數據，以便了解推薦成效 | 顯示總推薦數、成功推薦、佣金收益；提供成功率和平均佣金統計 |
| US-REFERRAL-004 | 使用推薦代碼 | 作為新用戶，我希望能夠使用推薦代碼享受折扣，以便節省費用 | 註冊時可輸入推薦代碼；自動計算折扣；驗證代碼有效性 |
| US-REFERRAL-005 | 管理推薦系統 | 作為管理員，我希望能夠管理推薦系統，以便控制推薦政策 | 可設定折扣比例；管理代碼有效期；查看全站推薦統計；處理佣金發放 |

#### 資料 Schema (TypeScript Interface)
```typescript
interface ReferralCode {
  id: string;                    // UUID
  code: string;                  // 推薦代碼
  referrer_id: string;          // 推薦人ID
  referrer_name: string;        // 推薦人姓名
  referrer_email: string;       // 推薦人信箱
  discount_percentage: number;   // 折扣比例
  max_uses: number;             // 最大使用次數 (-1為無限制)
  current_uses: number;         // 當前使用次數
  expiry_date?: string;         // 到期日期 ISO 8601
  is_active: boolean;           // 是否啟用
  created_at: string;           // ISO 8601 格式
  updated_at: string;           // ISO 8601 格式
}

interface ReferralUsage {
  id: string;                   // UUID
  referral_code_id: string;     // 推薦代碼ID
  referral_code: string;        // 推薦代碼
  referrer_id: string;          // 推薦人ID
  referred_user_id: string;     // 被推薦人ID
  referred_user_name: string;   // 被推薦人姓名
  referred_user_email: string;  // 被推薦人信箱
  order_id: string;             // 訂單ID
  original_amount: number;      // 原價
  discount_amount: number;      // 折扣金額
  final_amount: number;         // 最終金額
  commission: number;           // 佣金金額
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'; // 狀態
  used_at: string;              // 使用時間 ISO 8601
  completed_at?: string;        // 完成時間 ISO 8601
}

interface ReferralReward {
  id: string;                   // UUID
  referrer_id: string;          // 推薦人ID
  referral_usage_id: string;    // 推薦使用記錄ID
  reward_type: 'COMMISSION' | 'BONUS' | 'DISCOUNT'; // 獎勵類型
  amount: number;               // 獎勵金額
  currency: 'TWD';              // 幣別
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED'; // 狀態
  description: string;          // 描述
  earned_at: string;            // 獲得時間 ISO 8601
  paid_at?: string;             // 支付時間 ISO 8601
}

interface ReferralLink {
  id: string;                   // UUID
  referrer_id: string;          // 推薦人ID
  url: string;                  // 推薦連結
  short_url: string;            // 短連結
  utm_source?: string;          // UTM來源
  utm_medium?: string;          // UTM媒介
  utm_campaign?: string;        // UTM活動
  click_count: number;          // 點擊次數
  conversion_count: number;     // 轉換次數
  is_active: boolean;           // 是否啟用
  created_at: string;           // ISO 8601 格式
  updated_at: string;           // ISO 8601 格式
}
```

#### API 設計

**用戶推薦功能**
- `GET /api/v1/referrals/my-codes`：取得我的推薦代碼
- `POST /api/v1/referrals/generate-link`：生成推薦連結
- `GET /api/v1/referrals/statistics`：取得推薦統計
- `GET /api/v1/referrals/rewards`：取得獎勵記錄

**推薦代碼驗證與使用**
- `POST /api/v1/referrals/validate`：驗證推薦代碼
- `POST /api/v1/referrals/apply`：使用推薦代碼
- `GET /api/v1/referrals/link/:token`：推薦連結追蹤

**管理員推薦管理**
- `GET /api/v1/admin/referrals/codes`：취득所有推薦代碼
- `GET /api/v1/admin/referrals/statistics`：取得推薦統計
- `GET /api/v1/admin/referrals/usage`：取得使用記錄
- `GET /api/v1/admin/referrals/rewards`：取得獎勵記錄
- `PUT /api/v1/admin/referrals/rewards/:id/status`：更新獎勵狀態
- `GET /api/v1/admin/referrals/settings`：取得推薦設定
- `PUT /api/v1/admin/referrals/settings`：更新推薦設定

---

### 📌 功能名稱：通知與消息系統
**所屬 APP**：All Portals  
**功能描述**：提供統一的通知推送、消息管理、系統公告等功能

#### User Story
| id | 標題 | 內容 | Acceptance Criteria |
|---|---|---|---|
| US-NOTIFICATION-001 | 接收系統通知 | 作為用戶，我希望能夠接收重要的系統通知，以便及時了解相關資訊 | 支援多種通知類型；可設定通知偏好；提供已讀/未讀狀態 |
| US-NOTIFICATION-002 | 課程相關通知 | 作為學員，我希望能夠接收課程相關通知，以便掌握課程動態 | 自動發送課程提醒；取消課程通知；新課程開放通知 |
| US-NOTIFICATION-003 | 推送個人化通知 | 作為系統，我希望能夠根據用戶行為推送個人化通知，以便提升用戶體驗 | 基於用戶偏好推送；支援即時和延遲通知；可追蹤通知效果 |
| US-NOTIFICATION-004 | 管理系統公告 | 作為管理員，我希望能夠發佈系統公告，以便向所有用戶傳達重要訊息 | 可設定公告範圍；支援富文本編輯；可設定公告有效期 |
| US-NOTIFICATION-005 | 通知設定管理 | 作為用戶，我希望能夠管理通知設定，以便控制接收的通知類型 | 可選擇通知類型；設定通知時間；選擇通知渠道 |

#### 資料 Schema (TypeScript Interface)
```typescript
interface Notification {
  id: string;                    // UUID
  user_id: string;              // 接收用戶ID
  type: 'SYSTEM' | 'COURSE' | 'BOOKING' | 'MEMBERSHIP' | 'PAYMENT' | 'AGENT' | 'REFERRAL'; // 通知類型
  title: string;                // 通知標題
  message: string;              // 通知內容
  data?: Record<string, any>;   // 附加數據
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'; // 優先級
  status: 'UNREAD' | 'READ' | 'ARCHIVED'; // 狀態
  channels: Array<'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH'>; // 推送渠道
  scheduled_at?: string;        // 預定發送時間 ISO 8601
  sent_at?: string;            // 實際發送時間 ISO 8601
  read_at?: string;            // 閱讀時間 ISO 8601
  expires_at?: string;         // 過期時間 ISO 8601
  action_url?: string;         // 點擊跳轉連結
  created_at: string;          // ISO 8601 格式
  updated_at: string;          // ISO 8601 格式
}

interface NotificationTemplate {
  id: string;                  // UUID
  name: string;               // 模板名稱
  type: 'SYSTEM' | 'COURSE' | 'BOOKING' | 'MEMBERSHIP' | 'PAYMENT' | 'AGENT' | 'REFERRAL'; // 模板類型
  title_template: string;     // 標題模板（支援變數）
  message_template: string;   // 內容模板（支援變數）
  default_channels: Array<'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH'>; // 預設推送渠道
  is_active: boolean;         // 是否啟用
  created_at: string;         // ISO 8601 格式
  updated_at: string;         // ISO 8601 格式
}

interface NotificationPreference {
  id: string;                 // UUID
  user_id: string;           // 用戶ID
  type: 'SYSTEM' | 'COURSE' | 'BOOKING' | 'MEMBERSHIP' | 'PAYMENT' | 'AGENT' | 'REFERRAL'; // 通知類型
  enabled: boolean;          // 是否啟用
  channels: Array<'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH'>; // 允許的推送渠道
  quiet_hours_start?: string; // 免打擾開始時間
  quiet_hours_end?: string;   // 免打擾結束時間
  created_at: string;         // ISO 8601 格式
  updated_at: string;         // ISO 8601 格式
}

interface SystemAnnouncement {
  id: string;                 // UUID
  title: string;             // 公告標題
  content: string;           // 公告內容（支援富文本）
  type: 'INFO' | 'WARNING' | 'MAINTENANCE' | 'FEATURE'; // 公告類型
  target_roles: Array<'STUDENT' | 'TEACHER' | 'ADMIN' | 'STAFF' | 'CORPORATE'>; // 目標角色
  is_active: boolean;        // 是否啟用
  start_date: string;        // 生效日期 ISO 8601
  end_date?: string;         // 結束日期 ISO 8601
  priority: 'LOW' | 'MEDIUM' | 'HIGH'; // 優先級
  show_popup: boolean;       // 是否彈窗顯示
  created_by: string;        // 建立者ID
  created_at: string;        // ISO 8601 格式
  updated_at: string;        // ISO 8601 格式
}
```

#### API 設計

**用戶通知**
- `GET /api/v1/notifications`：取得我的通知列表
- `PUT /api/v1/notifications/:id/read`：標記通知為已讀
- `DELETE /api/v1/notifications/:id`：刪除通知
- `PUT /api/v1/notifications/read-all`：標記所有通知為已讀

**通知偏好設定**
- `GET /api/v1/notifications/preferences`：取得通知偏好設定
- `PUT /api/v1/notifications/preferences`：更新通知偏好設定

**系統公告**
- `GET /api/v1/announcements`：取得系統公告
- `PUT /api/v1/announcements/:id/acknowledge`：確認已閱讀公告

**管理員通知管理**
- `POST /api/v1/admin/notifications/send`：發送通知
- `GET /api/v1/admin/notifications/templates`：取得通知模板
- `POST /api/v1/admin/notifications/templates`：建立通知模板
- `PUT /api/v1/admin/notifications/templates/:id`：更新通知模板

**管理員公告管理**
- `GET /api/v1/admin/announcements`：取得所有公告
- `POST /api/v1/admin/announcements`：建立系統公告
- `PUT /api/v1/admin/announcements/:id`：更新系統公告
- `DELETE /api/v1/admin/announcements/:id`：刪除系統公告

---

### 📌 功能名稱：學習進度追蹤系統
**所屬 APP**：Student Portal, Teacher Portal, Admin Portal  
**功能描述**：提供完整的學習進度追蹤、課程完成度統計、學習分析等功能

#### User Story
| id | 標題 | 內容 | Acceptance Criteria |
|---|---|---|---|
| US-PROGRESS-001 | 追蹤學習進度 | 作為學員，我希望能夠查看我的學習進度，以便了解課程完成狀況 | 顯示課程完成百分比；記錄觀看時長；標記完成的課程單元 |
| US-PROGRESS-002 | 學習統計分析 | 作為學員，我希望能夠查看學習統計數據，以便了解學習成效 | 提供學習時長統計；完課率分析；學習趨勢圖表 |
| US-PROGRESS-003 | 設定學習目標 | 作為學員，我希望能夠設定學習目標，以便督促自己持續學習 | 可設定每日/每週學習目標；進度提醒；目標達成慶祝 |
| US-PROGRESS-004 | 查看學員進度 | 作為教師，我希望能夠查看學員的學習進度，以便提供個人化指導 | 查看班級整體進度；個別學員詳細進度；識別需要協助的學員 |
| US-PROGRESS-005 | 進度報表管理 | 作為管理員，我希望能夠查看全站學習進度報表，以便分析課程效果 | 提供多維度進度統計；課程熱門度分析；學習行為洞察 |

#### 資料 Schema (TypeScript Interface)
```typescript
interface LearningProgress {
  id: string;                 // UUID
  user_id: string;           // 學員ID
  course_id: string;         // 課程ID
  lesson_id: string;         // 課程單元ID
  attachment_id?: string;    // 附件ID（影片、文件等）
  progress_percentage: number; // 進度百分比 (0-100)
  watch_duration: number;    // 觀看時長（秒）
  total_duration: number;    // 總時長（秒）
  is_completed: boolean;     // 是否完成
  last_position: number;     // 最後觀看位置（秒）
  completed_at?: string;     // 完成時間 ISO 8601
  created_at: string;        // ISO 8601 格式
  updated_at: string;        // ISO 8601 格式
}

interface CourseProgress {
  id: string;                // UUID
  user_id: string;          // 學員ID
  course_id: string;        // 課程ID
  total_lessons: number;    // 總課程單元數
  completed_lessons: number; // 已完成單元數
  progress_percentage: number; // 整體進度百分比
  study_time_minutes: number; // 學習時長（分鐘）
  enrollment_date: string;   // 註冊日期 ISO 8601
  last_access_date?: string; // 最後存取日期 ISO 8601
  completion_date?: string;  // 完課日期 ISO 8601
  certificate_issued: boolean; // 是否已發證書
  created_at: string;        // ISO 8601 格式
  updated_at: string;        // ISO 8601 格式
}

interface LearningGoal {
  id: string;               // UUID
  user_id: string;         // 學員ID
  goal_type: 'DAILY_MINUTES' | 'WEEKLY_LESSONS' | 'MONTHLY_COURSES' | 'COURSE_COMPLETION'; // 目標類型
  target_value: number;    // 目標數值
  current_value: number;   // 當前數值
  target_date?: string;    // 目標達成日期 ISO 8601
  is_active: boolean;      // 是否啟用
  is_achieved: boolean;    // 是否達成
  achieved_at?: string;    // 達成時間 ISO 8601
  created_at: string;      // ISO 8601 格式
  updated_at: string;      // ISO 8601 格式
}

interface StudySession {
  id: string;              // UUID
  user_id: string;        // 學員ID
  course_id: string;      // 課程ID
  lesson_id?: string;     // 課程單元ID
  start_time: string;     // 開始時間 ISO 8601
  end_time?: string;      // 結束時間 ISO 8601
  duration_minutes: number; // 學習時長（分鐘）
  activities: Array<{      // 學習活動記錄
    type: 'VIDEO_WATCH' | 'DOCUMENT_READ' | 'QUIZ_ATTEMPT' | 'DISCUSSION_POST';
    timestamp: string;     // 活動時間 ISO 8601
    data?: Record<string, any>; // 活動數據
  }>;
  created_at: string;     // ISO 8601 格式
}
```

#### API 設計

**學員進度查詢**
- `GET /api/v1/progress/courses`：取得我的課程進度
- `GET /api/v1/progress/courses/:id`：取得特定課程進度
- `PUT /api/v1/progress/lessons/:id`：更新課程單元進度
- `GET /api/v1/progress/statistics`：取得學習統計

**學習目標管理**
- `GET /api/v1/progress/goals`：取得我的學習目標
- `POST /api/v1/progress/goals`：建立學習目標
- `PUT /api/v1/progress/goals/:id`：更新學習目標
- `DELETE /api/v1/progress/goals/:id`：刪除學習目標

**學習記錄**
- `POST /api/v1/progress/sessions`：記錄學習活動
- `GET /api/v1/progress/sessions`：取得學習記錄

**教師進度查詢**
- `GET /api/v1/staff/students/:id/progress`：查看學員進度
- `GET /api/v1/staff/courses/:id/progress`：查看課程整體進度

**管理員進度報表**
- `GET /api/v1/admin/progress/overview`：取得進度總覽
- `GET /api/v1/admin/progress/courses/:id/analytics`：取得課程分析
- `GET /api/v1/admin/progress/export`：匯出進度報表

---

### 📌 功能名稱：系統設定管理
**所屬 APP**：Admin Portal  
**功能描述**：提供系統全域設定、參數配置、功能開關等管理功能

#### User Story
| id | 標題 | 內容 | Acceptance Criteria |
|---|---|---|---|
| US-SETTINGS-001 | 系統基本設定 | 作為管理員，我希望能夠管理系統基本設定，以便配置系統運行參數 | 可設定系統名稱、Logo、聯絡資訊；支援多環境配置；變更即時生效 |
| US-SETTINGS-002 | 功能開關管理 | 作為管理員，我希望能夠控制系統功能開關，以便靈活控制功能上線 | 可開關各模組功能；支援A/B測試；可設定用戶群組權限 |
| US-SETTINGS-003 | 業務參數配置 | 作為管理員，我希望能夠設定業務相關參數，以便調整業務規則 | 可設定預約規則、取消政策、分紅比例；支援即時更新；有變更歷史記錄 |
| US-SETTINGS-004 | 第三方服務設定 | 作為管理員，我希望能夠管理第三方服務設定，以便整合外部系統 | 可設定金流、簡訊、郵件服務；支援測試連接；加密敏感資訊 |
| US-SETTINGS-005 | 系統維護設定 | 作為管理員，我希望能夠管理系統維護相關設定，以便確保系統穩定運行 | 可設定維護時間；備份策略；日誌等級；效能監控 |

#### 資料 Schema (TypeScript Interface)
```typescript
interface SystemSetting {
  id: string;                    // UUID
  category: 'GENERAL' | 'BUSINESS' | 'INTEGRATION' | 'MAINTENANCE' | 'SECURITY'; // 設定分類
  key: string;                   // 設定鍵值
  name: string;                  // 設定名稱
  description: string;           // 設定描述
  value: string;                 // 設定值
  value_type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'ENCRYPTED'; // 值類型
  default_value: string;         // 預設值
  is_required: boolean;          // 是否必填
  is_sensitive: boolean;         // 是否敏感資訊
  validation_rule?: string;      // 驗證規則
  options?: Array<{              // 選項列表（用於下拉選單）
    label: string;
    value: string;
  }>;
  updated_by: string;           // 最後更新者ID
  created_at: string;           // ISO 8601 格式
  updated_at: string;           // ISO 8601 格式
}

interface FeatureFlag {
  id: string;                   // UUID
  name: string;                // 功能名稱
  key: string;                 // 功能鍵值
  description: string;         // 功能描述
  is_enabled: boolean;         // 是否啟用
  rollout_percentage: number;  // 開放百分比 (0-100)
  target_roles?: Array<'STUDENT' | 'TEACHER' | 'ADMIN' | 'STAFF' | 'CORPORATE'>; // 目標角色
  target_users?: string[];     // 目標用戶ID列表
  start_date?: string;         // 開始日期 ISO 8601
  end_date?: string;           // 結束日期 ISO 8601
  environment: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION'; // 環境
  created_by: string;          // 建立者ID
  created_at: string;          // ISO 8601 格式
  updated_at: string;          // ISO 8601 格式
}

interface ConfigurationHistory {
  id: string;                  // UUID
  setting_id: string;         // 設定ID
  action: 'CREATE' | 'UPDATE' | 'DELETE'; // 操作類型
  old_value?: string;         // 舊值
  new_value: string;          // 新值
  changed_by: string;         // 變更者ID
  reason?: string;            // 變更原因
  created_at: string;         // ISO 8601 格式
}

interface SystemMaintenanceWindow {
  id: string;                 // UUID
  title: string;             // 維護標題
  description: string;       // 維護描述
  type: 'SCHEDULED' | 'EMERGENCY' | 'ROUTINE'; // 維護類型
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; // 嚴重程度
  affected_services: string[]; // 受影響服務
  start_time: string;        // 開始時間 ISO 8601
  end_time: string;          // 結束時間 ISO 8601
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'; // 狀態
  notify_users: boolean;     // 是否通知用戶
  created_by: string;        // 建立者ID
  created_at: string;        // ISO 8601 格式
  updated_at: string;        // ISO 8601 格式
}
```

#### API 設計

**系統設定管理**
- `GET /api/v1/admin/settings`：取得系統設定列表
- `GET /api/v1/admin/settings/:category`：取得特定分類設定
- `PUT /api/v1/admin/settings/:key`：更新系統設定
- `GET /api/v1/admin/settings/:key/history`：取得設定變更歷史

**功能開關管理**
- `GET /api/v1/admin/feature-flags`：取得功能開關列表
- `POST /api/v1/admin/feature-flags`：建立功能開關
- `PUT /api/v1/admin/feature-flags/:id`：更新功能開關
- `DELETE /api/v1/admin/feature-flags/:id`：刪除功能開關

**用戶功能檢查**
- `GET /api/v1/features/enabled`：取得用戶可用功能列表
- `GET /api/v1/features/:key/status`：檢查特定功能狀態

**系統維護管理**
- `GET /api/v1/admin/maintenance-windows`：取得維護時段列表
- `POST /api/v1/admin/maintenance-windows`：建立維護時段
- `PUT /api/v1/admin/maintenance-windows/:id`：更新維護時段
- `GET /api/v1/maintenance/current`：取得當前維護狀態

**系統監控**
- `GET /api/v1/admin/system/health`：取得系統健康狀態
- `GET /api/v1/admin/system/metrics`：取得系統指標
- `GET /api/v1/admin/system/logs`：取得系統日誌

---

## 三、資料流設計（MECE 原則）

### 🔄 核心實體關係圖
```
User (用戶)
├── UserMembership (會員資格)
├── Booking (預約記錄)
├── Order (訂單)
├── ContactInquiry (聯繫諮詢) [關聯用戶，如果是登入用戶]
├── StudentProgress (學習進度)
├── CourseReview (課程評價)
└── CorporateClient (企業客戶) [僅企業用戶]

MembershipPlan (會員方案)
├── UserMembership (會員資格)
└── Order (訂單)

CourseModule (課程模組)
├── CourseLesson (課程課堂)
├── CourseMaterial (課程教材)
├── CourseModuleVersion (版本記錄)
└── CourseSchedule (課程排程)

CourseSchedule (課程排程)
├── CourseSession (課程時段)
├── Booking (預約記錄)
└── CourseReview (課程評價)

Teacher (教師)
├── CourseSchedule (課程排程)
├── TeachingSchedule (教學排程)
└── LeaveRequest (請假申請)

Booking (預約記錄)
├── StudentProgress (學習進度)
└── CourseReview (課程評價)

Order (訂單)
├── PaymentTransaction (付款交易)
└── RefundRequest (退款申請)

ContactInquiry (聯繫諮詢)
├── ContactResponse (諮詢回應)
├── CaseAssignment (案件分配)
└── CaseWorklog (案件工作日誌)

CorporateClient (企業客戶)
├── CorporateSubscription (企業訂閱)
├── CorporateEmployee (企業員工)
└── CorporateInquiry (企業諮詢)
```

### 📊 資料流向規則
1. **用戶認證流程**：`User` → `UserSession` → `JWT Token`
2. **會員購買流程**：`User` → `Order` → `PaymentTransaction` → `UserMembership`
3. **課程管理流程**：`CourseModule` → `CourseSchedule` → `CourseSession` → `Booking`
4. **學習追蹤流程**：`Booking` → `StudentProgress` → `StudentAttendance` → `CourseReview`
5. **教學管理流程**：`Teacher` + `CourseSchedule` → `TeachingSchedule` → `StudentAttendance`
6. **企業管理流程**：`CorporateInquiry` → `CorporateClient` → `CorporateSubscription` → `CorporateEmployee`
7. **客服案件流程**：`ContactInquiry` → `CaseAssignment` → `ContactResponse` → `CaseWorklog`

### 🔗 MECE 原則驗證
- **互斥性 (Mutually Exclusive)**：每個資料實體職責明確，無重疊功能
- **完整性 (Collectively Exhaustive)**：涵蓋所有業務流程和需求
- **一致性**：命名規則和資料格式統一標準化

---

## 四、API 設計標準

### 📋 統一響應格式
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    has_next?: boolean;
  };
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
```

### 🔢 HTTP 狀態碼規範
- **200 OK**：請求成功
- **201 Created**：資源建立成功
- **400 Bad Request**：請求格式錯誤
- **401 Unauthorized**：未授權
- **403 Forbidden**：權限不足
- **404 Not Found**：資源不存在
- **409 Conflict**：資源衝突
- **422 Unprocessable Entity**：資料驗證失敗
- **500 Internal Server Error**：伺服器錯誤

### 📄 分頁參數標準
```typescript
interface PaginationParams {
  page?: number;      // 頁碼 (預設: 1)
  limit?: number;     // 每頁筆數 (預設: 20, 最大: 100)
  sort?: string;      // 排序欄位
  order?: 'asc' | 'desc'; // 排序方向
}
```

### 🔐 認證標準
- **Bearer Token**：`Authorization: Bearer <JWT_TOKEN>`
- **Token 有效期**：24小時（可刷新）
- **權限檢查**：Role-based Access Control (RBAC)

---

## 五、錯誤碼與例外處理標準

### ❌ 4XX 用戶端錯誤
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "資料驗證失敗",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### 🔑 認證相關錯誤碼
- **AUTH_001**: `EMAIL_ALREADY_EXISTS` - Email已存在 (409)
- **AUTH_002**: `INVALID_CREDENTIALS` - 帳號密碼錯誤 (401)
- **AUTH_003**: `TOKEN_EXPIRED` - Token已過期
- **AUTH_004**: `INSUFFICIENT_PERMISSIONS` - 權限不足
- **AUTH_005**: `STAFF_PERMISSION_DENIED` - 校務人員權限不足 (403)
- **AUTH_006**: `RESOURCE_ACCESS_DENIED` - 資源存取被拒絕 (403)

### 💳 會員相關錯誤碼
- **MEMBER_001**: `MEMBERSHIP_NOT_FOUND` - 會員資格不存在
- **MEMBER_002**: `MEMBERSHIP_EXPIRED` - 會員資格已過期
- **MEMBER_003**: `ACTIVE_CARD_EXISTS` - 已有ACTIVE會員卡 (422)
- **MEMBER_004**: `CARD_NOT_PURCHASED` - 會員卡非PURCHASED狀態

### 📚 課程相關錯誤碼
- **COURSE_001**: `TIMESLOT_NOT_FOUND` - 課程時段不存在
- **COURSE_002**: `TIMESLOT_FULL` - 課程時段已滿 (FULL)
- **COURSE_003**: `WITHIN_24H` - 距離開課小於24小時 (WITHIN_24H)
- **COURSE_004**: `MEMBERSHIP_EXPIRED` - 會員資格過期 (MEMBERSHIP_EXPIRED)
- **COURSE_005**: `CANNOT_CANCEL_WITHIN_24H` - 開課前24小時內不可取消 (403)
- **COURSE_006**: `TIMESLOT_CANCELLED` - 課程時段已被取消

### 🛒 訂單相關錯誤碼
- **ORDER_001**: `ORDER_NOT_FOUND` - 訂單不存在
- **ORDER_002**: `ORDER_EXPIRED` - 訂單已過期
- **ORDER_003**: `PAYMENT_FAILED` - 付款失敗
- **ORDER_004**: `REFUND_NOT_ALLOWED` - 不允許退款

### 📞 聯繫案件相關錯誤碼
- **CONTACT_001**: `INQUIRY_NOT_FOUND` - 諮詢案件不存在
- **CONTACT_002**: `ALREADY_ASSIGNED` - 案件已被分配
- **CONTACT_003**: `INVALID_STATUS_TRANSITION` - 無效的狀態轉換
- **CONTACT_004**: `CASE_ALREADY_CLOSED` - 案件已關閉

### 🤝 代理管理相關錯誤碼
- **AGENT_001**: `AGENT_NOT_FOUND` - 代理不存在
- **AGENT_002**: `AGENT_CODE_EXISTS` - 代理代碼已存在
- **AGENT_003**: `INVALID_COMMISSION_RATE` - 無效的分紅比例
- **AGENT_004**: `COMMISSION_EXCEEDED` - 分紅比例超過限制
- **AGENT_005**: `AGENT_SUSPENDED` - 代理已被暫停
- **AGENT_006**: `ROLE_NOT_FOUND` - 代理角色不存在

### 🎁 推薦系統相關錯誤碼
- **REFERRAL_001**: `REFERRAL_CODE_NOT_FOUND` - 推薦代碼不存在
- **REFERRAL_002**: `REFERRAL_CODE_EXPIRED` - 推薦代碼已過期
- **REFERRAL_003**: `REFERRAL_CODE_DISABLED` - 推薦代碼已停用
- **REFERRAL_004**: `REFERRAL_LIMIT_EXCEEDED` - 推薦代碼使用次數已達上限
- **REFERRAL_005**: `SELF_REFERRAL_NOT_ALLOWED` - 不可使用自己的推薦代碼
- **REFERRAL_006**: `REFERRAL_ALREADY_USED` - 已使用過推薦代碼

### 🔔 通知系統相關錯誤碼
- **NOTIFICATION_001**: `NOTIFICATION_NOT_FOUND` - 通知不存在
- **NOTIFICATION_002**: `NOTIFICATION_TEMPLATE_NOT_FOUND` - 通知模板不存在
- **NOTIFICATION_003**: `INVALID_NOTIFICATION_CHANNEL` - 無效的通知渠道
- **NOTIFICATION_004**: `NOTIFICATION_SEND_FAILED` - 通知發送失敗
- **NOTIFICATION_005**: `NOTIFICATION_ALREADY_READ` - 通知已讀取
- **NOTIFICATION_006**: `ANNOUNCEMENT_EXPIRED` - 公告已過期

### 📚 學習進度相關錯誤碼
- **PROGRESS_001**: `PROGRESS_RECORD_NOT_FOUND` - 進度記錄不存在
- **PROGRESS_002**: `INVALID_PROGRESS_VALUE` - 無效的進度值
- **PROGRESS_003**: `LEARNING_GOAL_NOT_FOUND` - 學習目標不存在
- **PROGRESS_004**: `GOAL_ALREADY_ACHIEVED` - 目標已達成
- **PROGRESS_005**: `INVALID_STUDY_SESSION` - 無效的學習記錄
- **PROGRESS_006**: `COURSE_NOT_ENROLLED` - 未註冊此課程

### ⚙️ 系統設定相關錯誤碼
- **SETTINGS_001**: `SETTING_NOT_FOUND` - 設定項目不存在
- **SETTINGS_002**: `INVALID_SETTING_VALUE` - 無效的設定值
- **SETTINGS_003**: `SETTING_VALIDATION_FAILED` - 設定驗證失敗
- **SETTINGS_004**: `FEATURE_FLAG_NOT_FOUND` - 功能開關不存在
- **SETTINGS_005**: `MAINTENANCE_WINDOW_CONFLICT` - 維護時間衝突
- **SETTINGS_006**: `SYSTEM_IN_MAINTENANCE` - 系統維護中

### ⚠️ 5XX 伺服器端錯誤
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "伺服器內部錯誤"
  }
}
```

### 📝 錯誤處理最佳實踐
1. **統一錯誤格式**：所有API使用相同的錯誤響應結構
2. **語意化錯誤碼**：錯誤碼需清楚表達錯誤類型
3. **多語言支援**：錯誤訊息支援多語言
4. **詳細錯誤資訊**：提供足夠資訊協助除錯
5. **記錄錯誤日誌**：伺服器端記錄詳細錯誤資訊
6. **用戶友善訊息**：前端顯示用戶易懂的錯誤提示

---

## 📝 結語

此文件涵蓋了 TLI Connect 系統所有核心功能模組，遵循 MECE 原則設計資料結構，提供統一的 API 設計標準和錯誤處理機制。所有 schema 使用 TypeScript interface 定義，確保型別安全和開發效率。

### ✅ 完成項目檢核表
- [x] 所有功能完整列出，不遺漏現有功能
- [x] 資料流符合 MECE 原則，避免重複資料或交錯依賴
- [x] 命名一致、簡潔易懂
- [x] API 直觀好理解
- [x] 資料 Schema 使用 TypeScript Interface 定義
- [x] 每個功能均含完整 User Story 表格
- [x] 格式、錯誤處理、欄位設計統一標準
- [x] 新增聯繫我們表單與案件管理系統功能
- [x] 重新設計課程管理架構：課程模組 + 課程排程分離
- [x] 企業客戶管理流程：諮詢申請 → 管理員指派 → 企業窗口管理
- [x] 融入9個User Story需求：學員註冊登入、會員卡管理、課程預約、Dashboard等
- [x] 新增STAFF校務角色：權限範圍限於課程營運管理，不包含系統全域設定
- [x] 管理員權限繼承：管理員擁有所有校務人員功能，加上系統全域管理權限
- [x] 校務人員用戶資料編輯功能：可編輯學員個人資料，包含完整審計追蹤機制
- [x] 代理管理系統：多角色代理管理、分紅制度設定、銷售追蹤和業績統計
- [x] 推薦系統：推薦代碼生成、使用追蹤、佣金計算和獎勵發放機制
- [x] 通知與消息系統：統一通知推送、個人化通知、系統公告和偏好設定
- [x] 學習進度追蹤系統：完整進度追蹤、學習目標設定、統計分析和報表
- [x] 系統設定管理：全域設定、功能開關、業務參數和維護管理

---

**文件版本**：v1.5  
**最後更新**：2025-07-30  
**維護者**：TLI Connect 開發團隊