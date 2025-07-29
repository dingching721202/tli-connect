# TLI Connect 系統功能資料結構與流程規劃文件

## 📋 目錄
- [一、功能模組總覽](#一功能模組總覽依-app-區分)
- [二、各功能模組細節](#二各功能模組細節)
- [三、資料流設計](#三資料流設計mece-原則)
- [四、API 設計標準](#四api-設計標準)
- [五、錯誤碼與例外處理標準](#五錯誤碼與例外處理標準)

---

## 一、功能模組總覽（依 APP 區分）

### 📱 APP 名稱：Student Portal
- 用戶註冊與登入
- 會員方案管理
- 課程瀏覽與預約
- 我的學習記錄
- 個人資料管理
- 推薦系統
- 聯繫我們表單

### 👨‍🏫 APP 名稱：Teacher Dashboard
- 教學排程管理
- 學生名單管理
- 請假申請系統
- 課程準備工具
- 學生互動記錄

### 🔧 APP 名稱：Admin Console
- 用戶管理系統
- 課程內容管理
- 教師資源管理
- 訂單與付款管理
- 系統設定管理
- 數據分析報表
- 案件管理系統

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
| US-AUTH-001 | 用戶註冊 | 作為新用戶，我希望能夠註冊帳號，以便使用學習平台 | 系統可接受email、姓名、電話、密碼；註冊成功後自動登入；發送歡迎信件 |
| US-AUTH-002 | 用戶登入 | 作為註冊用戶，我希望能夠安全登入系統，以便存取個人功能 | 系統驗證email和密碼；登入成功後導向dashboard；錯誤時顯示適當提示 |
| US-AUTH-003 | 忘記密碼 | 作為用戶，我希望能夠重設密碼，以便在忘記密碼時重新登入 | 系統發送重設連結至用戶email；連結有效期24小時；重設成功後可正常登入 |

#### 資料 Schema (TypeScript Interface)
```typescript
interface User {
  id: string;                    // UUID
  email: string;                 // 電子郵件 (唯一)
  name: string;                  // 用戶姓名
  phone: string;                 // 電話號碼
  password_hash: string;         // 加密密碼
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'CORPORATE'; // 用戶角色
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
| US-MEMBER-001 | 瀏覽會員方案 | 作為潛在客戶，我希望能夠瀏覽所有可用的會員方案，以便選擇適合的方案 | 系統顯示所有已發布方案；包含價格、特色、期限；支援個人/企業篩選 |
| US-MEMBER-002 | 購買會員方案 | 作為用戶，我希望能夠購買會員方案，以便獲得學習權益 | 系統建立訂單；整合付款流程；付款成功後生成會員資格 |
| US-MEMBER-003 | 啟用會員卡 | 作為已購買的用戶，我希望能夠啟用會員卡，以便開始使用權益 | 系統檢查購買狀態；啟用後設定有效期；更新會員狀態為ACTIVE |

#### 資料 Schema (TypeScript Interface)
```typescript
interface MembershipPlan {
  id: string;                   // UUID
  title: string;                // 方案名稱
  description: string;          // 方案描述
  user_type: 'INDIVIDUAL' | 'CORPORATE';           // 用戶類型
  duration_type: 'SEASON' | 'ANNUAL';              // 期間類型
  duration_days: number;        // 有效天數
  original_price: number;       // 原價 (TWD)
  sale_price: number;          // 售價 (TWD)
  features: string[];          // 功能特色列表
  course_access: string[];     // 可存取課程ID列表
  is_popular: boolean;         // 是否熱門方案
  is_published: boolean;       // 是否已發布
  created_at: string;          // ISO 8601 格式
  updated_at: string;          // ISO 8601 格式
}

interface UserMembership {
  id: string;                  // UUID
  user_id: string;            // 用戶ID
  plan_id: string;            // 方案ID
  order_id: string;           // 訂單ID
  status: 'PURCHASED' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED'; // 會員狀態
  start_date?: string;        // 開始日期 ISO 8601
  end_date?: string;          // 結束日期 ISO 8601
  activate_deadline: string;   // 啟用截止日 ISO 8601
  auto_renew: boolean;        // 是否自動續約
  created_at: string;         // ISO 8601 格式
  updated_at: string;         // ISO 8601 格式
}
```

#### API 設計
- `GET /api/v1/membership-plans`：取得所有已發布方案
- `GET /api/v1/membership-plans/:id`：取得特定方案詳情
- `GET /api/v1/memberships/my`：取得我的會員資格
- `POST /api/v1/memberships/:id/activate`：啟用會員卡
- `PUT /api/v1/memberships/:id/auto-renew`：設定自動續約

---

### 📌 功能名稱：課程瀏覽與預約
**所屬 APP**：Student Portal  
**功能描述**：提供課程瀏覽、時段查詢、預約管理等學習相關功能

#### User Story
| id | 標題 | 內容 | Acceptance Criteria |
|---|---|---|---|
| US-COURSE-001 | 瀏覽課程列表 | 作為學生，我希望能夠瀏覽所有可用課程，以便選擇感興趣的內容 | 系統顯示已發布課程；支援語言、難度、分類篩選；顯示教師資訊和評分 |
| US-COURSE-002 | 查看課程詳情 | 作為學生，我希望能夠查看課程詳細資訊，以便了解學習內容 | 系統顯示課程描述、大綱、教材、時程；包含教師介紹和學生評價 |
| US-COURSE-003 | 預約課程時段 | 作為會員，我希望能夠預約課程時段，以便安排學習時間 | 系統檢查會員權限；顯示可預約時段；預約成功後發送確認通知 |
| US-COURSE-004 | 批量預約課程 | 作為會員，我希望能夠一次預約多個時段，以便提高預約效率 | 系統支援多選時段；檢查時間衝突；批量處理預約結果 |

#### 資料 Schema (TypeScript Interface)
```typescript
interface Course {
  id: string;                   // UUID
  title: string;                // 課程標題
  description: string;          // 課程描述
  teacher_id: string;          // 教師ID
  language: 'ENGLISH' | 'CHINESE' | 'JAPANESE';    // 教學語言
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'; // 難度等級
  categories: string[];         // 分類標籤
  max_students: number;        // 最大學生數
  session_duration: number;    // 每堂課時長(分鐘)
  total_sessions: number;      // 總堂數
  price: number;              // 課程價格 (TWD)
  materials: string[];        // 所需教材
  prerequisites: string;      // 先修要求
  cover_image_url: string;    // 封面圖片URL
  rating: number;             // 課程評分 (0-5)
  review_count: number;       // 評價數量
  is_published: boolean;      // 是否已發布
  created_at: string;         // ISO 8601 格式
  updated_at: string;         // ISO 8601 格式
}

interface CourseSession {
  id: string;                 // UUID
  course_id: string;         // 課程ID
  session_number: number;    // 第幾堂課
  title: string;             // 課堂標題
  date: string;              // 上課日期 YYYY-MM-DD
  start_time: string;        // 開始時間 HH:mm
  end_time: string;          // 結束時間 HH:mm
  location: string;          // 上課地點
  capacity: number;          // 容量
  enrolled_count: number;    // 已報名人數
  waitlist_count: number;    // 候補人數
  status: 'AVAILABLE' | 'FULL' | 'CANCELLED' | 'COMPLETED'; // 時段狀態
  booking_deadline: string;  // 預約截止時間 ISO 8601
  created_at: string;        // ISO 8601 格式
  updated_at: string;        // ISO 8601 格式
}

interface Booking {
  id: string;                // UUID
  user_id: string;          // 用戶ID
  session_id: string;       // 課程時段ID
  membership_id: string;    // 會員資格ID
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'; // 預約狀態
  booking_source: 'WEB' | 'MOBILE' | 'ADMIN';     // 預約來源
  cancellation_reason?: string;  // 取消原因
  created_at: string;       // ISO 8601 格式
  updated_at: string;       // ISO 8601 格式
  cancelled_at?: string;    // 取消時間 ISO 8601
}
```

#### API 設計
- `GET /api/v1/courses`：取得課程列表（支援篩選）
- `GET /api/v1/courses/:id`：取得課程詳情
- `GET /api/v1/courses/:id/sessions`：取得課程可預約時段
- `POST /api/v1/bookings`：預約課程時段
- `POST /api/v1/bookings/batch`：批量預約
- `GET /api/v1/bookings/my`：取得我的預約記錄
- `DELETE /api/v1/bookings/:id`：取消預約

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
**所屬 APP**：Admin Console  
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
**所屬 APP**：Teacher Dashboard  
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
**所屬 APP**：Teacher Dashboard  
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
**所屬 APP**：Admin Console  
**功能描述**：提供管理員管理所有用戶帳號、權限、狀態等功能

#### User Story
| id | 標題 | 內容 | Acceptance Criteria |
|---|---|---|---|
| US-ADMIN-001 | 查看用戶清單 | 作為管理員，我希望能夠查看所有用戶清單，以便管理用戶帳號 | 系統顯示所有用戶資訊；支援角色、狀態篩選；提供搜尋功能 |
| US-ADMIN-002 | 管理用戶狀態 | 作為管理員，我希望能夠管理用戶帳號狀態，以便維護系統安全 | 系統提供啟用/停用功能；記錄異動歷史；自動通知用戶 |
| US-ADMIN-003 | 重設用戶密碼 | 作為管理員，我希望能夠重設用戶密碼，以便協助忘記密碼的用戶 | 系統生成臨時密碼；發送至用戶信箱；要求首次登入修改 |

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
- `GET /api/v1/admin/users`：取得用戶清單
- `GET /api/v1/admin/users/:id`：取得用戶詳情
- `PUT /api/v1/admin/users/:id/status`：更新用戶狀態
- `POST /api/v1/admin/users/:id/reset-password`：重設密碼
- `GET /api/v1/admin/users/:id/activity-log`：取得用戶活動記錄
- `POST /api/v1/admin/roles`：建立角色
- `PUT /api/v1/admin/users/:id/roles`：指派角色

---

### 📌 功能名稱：訂單與付款管理
**所屬 APP**：Admin Console  
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
**所屬 APP**：Corporate Portal  
**功能描述**：提供企業客戶管理、批量採購、員工學習追蹤等功能

#### User Story
| id | 標題 | 內容 | Acceptance Criteria |
|---|---|---|---|
| US-CORP-001 | 企業客戶註冊 | 作為企業客戶，我希望能夠註冊企業帳號，以便管理員工學習 | 系統提供企業註冊表單；驗證企業資訊；建立管理員帳號 |
| US-CORP-002 | 批量購買方案 | 作為企業客戶，我希望能夠批量購買學習方案，以便員工使用 | 系統提供批量購買介面；支援客製化方案；提供報價功能 |
| US-CORP-003 | 員工學習追蹤 | 作為企業管理員，我希望能夠追蹤員工學習進度，以便評估培訓效果 | 系統提供學習報表；顯示完課率；支援匯出功能 |

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
  contract_start: string;       // 合約開始日 ISO 8601
  contract_end: string;         // 合約結束日 ISO 8601
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'; // 客戶狀態
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
  employee_limit: number;     // 員工使用限制
  start_date: string;         // 開始日期 ISO 8601
  end_date: string;           // 結束日期 ISO 8601
  monthly_fee: number;        // 月費 (TWD)
  custom_features: string[];  // 客製化功能
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED'; // 訂閱狀態
  auto_renew: boolean;        // 自動續約
  created_at: string;         // ISO 8601 格式
  updated_at: string;         // ISO 8601 格式
}

interface EmployeeLearningRecord {
  id: string;                 // UUID
  corporate_id: string;      // 企業ID
  employee_id: string;       // 員工ID (企業內部編號)
  employee_name: string;     // 員工姓名
  employee_email: string;    // 員工信箱
  user_id?: string;          // 對應系統用戶ID
  department: string;        // 部門
  courses_enrolled: number;  // 報名課程數
  courses_completed: number; // 完成課程數
  total_study_hours: number; // 總學習時數
  last_activity: string;     // 最後活動時間 ISO 8601
  created_at: string;        // ISO 8601 格式
  updated_at: string;        // ISO 8601 格式
}
```

#### API 設計
- `POST /api/v1/corporate/register`：企業客戶註冊
- `GET /api/v1/corporate/clients`：取得企業客戶清單
- `GET /api/v1/corporate/clients/:id`：取得企業客戶詳情
- `POST /api/v1/corporate/subscriptions`：建立企業訂閱
- `GET /api/v1/corporate/:id/employees`：取得員工學習記錄
- `GET /api/v1/corporate/:id/reports`：取得學習報表
- `PUT /api/v1/corporate/clients/:id`：更新企業資訊

---

## 三、資料流設計（MECE 原則）

### 🔄 核心實體關係圖
```
User (用戶)
├── UserMembership (會員資格)
├── Booking (預約記錄)
├── Order (訂單)
├── ContactInquiry (聯繫諮詢) [關聯用戶，如果是登入用戶]
└── CorporateClient (企業客戶) [僅企業用戶]

MembershipPlan (會員方案)
├── UserMembership (會員資格)
└── Order (訂單)

Course (課程)
├── CourseSession (課程時段)
└── Booking (預約記錄)

Teacher (教師)
├── Course (課程)
├── TeachingSchedule (教學排程)
└── LeaveRequest (請假申請)

Order (訂單)
├── PaymentTransaction (付款交易)
└── RefundRequest (退款申請)

ContactInquiry (聯繫諮詢)
├── ContactResponse (諮詢回應)
├── CaseAssignment (案件分配)
└── CaseWorklog (案件工作日誌)
```

### 📊 資料流向規則
1. **用戶認證流程**：`User` → `UserSession` → `JWT Token`
2. **會員購買流程**：`User` → `Order` → `PaymentTransaction` → `UserMembership`
3. **課程預約流程**：`User` + `UserMembership` → `CourseSession` → `Booking`
4. **教學管理流程**：`Teacher` → `TeachingSchedule` → `StudentAttendance`
5. **企業管理流程**：`CorporateClient` → `CorporateSubscription` → `EmployeeLearningRecord`
6. **客服案件流程**：`ContactInquiry` → `CaseAssignment` → `ContactResponse` → `CaseWorklog`

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
- **AUTH_001**: `USER_NOT_FOUND` - 用戶不存在
- **AUTH_002**: `INVALID_CREDENTIALS` - 帳號密碼錯誤
- **AUTH_003**: `TOKEN_EXPIRED` - Token已過期
- **AUTH_004**: `INSUFFICIENT_PERMISSIONS` - 權限不足

### 💳 會員相關錯誤碼
- **MEMBER_001**: `MEMBERSHIP_NOT_FOUND` - 會員資格不存在
- **MEMBER_002**: `MEMBERSHIP_EXPIRED` - 會員資格已過期
- **MEMBER_003**: `ALREADY_ACTIVATED` - 會員卡已啟用

### 📚 課程相關錯誤碼
- **COURSE_001**: `COURSE_NOT_FOUND` - 課程不存在
- **COURSE_002**: `SESSION_FULL` - 課程時段已滿
- **COURSE_003**: `BOOKING_DEADLINE_PASSED` - 已超過預約期限
- **COURSE_004**: `ALREADY_BOOKED` - 已預約該時段

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

---

**文件版本**：v1.1  
**最後更新**：2025-01-29  
**維護者**：TLI Connect 開發團隊