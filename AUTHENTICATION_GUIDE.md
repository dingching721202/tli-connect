# 🔐 TLI Connect 認證系統

## 📋 功能總覽

本系統實現了完整的學員註冊和登入功能，符合以下需求：

### 用戶故事
```
As 未註冊訪客
I want 使用 Email 完成註冊並登入
So that 可以進入 Dashboard 使用所有學員功能
```

## 🚀 主要功能

### 1. 註冊功能
- ✅ **Email 唯一性檢查**：若 Email 已存在，返回 `409 EMAIL_ALREADY_EXISTS`
- ✅ **自動登入**：註冊成功後自動登入，返回 `HTTP 200` + `user_id` + `JWT`
- ✅ **完整資料收集**：姓名、Email、電話、密碼

### 2. 登入功能
- ✅ **密碼驗證**：密碼錯誤返回 `401 INVALID_CREDENTIALS`
- ✅ **JWT 生成**：成功登入返回 `HTTP 200` + `user_id` + `JWT`
- ✅ **會員資料整合**：自動載入用戶會員狀態

### 3. 安全機制
- ✅ **JWT Token**：包含用戶 ID、Email、角色和過期時間
- ✅ **Token 驗證**：中間件驗證 API 請求
- ✅ **會話持久化**：localStorage 保存登入狀態

## 🛠 API 端點

### 註冊 API
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name",
  "phone": "0900-123-456"
}
```

**回應**：
- `200 OK`：註冊成功
  ```json
  {
    "success": true,
    "user_id": 123,
    "jwt": "eyJhbGciOiJIUzI1NiIs..."
  }
  ```
- `409 Conflict`：Email 已存在
  ```json
  {
    "success": false,
    "error": "EMAIL_ALREADY_EXISTS"
  }
  ```

### 登入 API
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**回應**：
- `200 OK`：登入成功
  ```json
  {
    "success": true,
    "user_id": 123,
    "jwt": "eyJhbGciOiJIUzI1NiIs..."
  }
  ```
- `401 Unauthorized`：認證失敗
  ```json
  {
    "success": false,
    "error": "INVALID_CREDENTIALS"
  }
  ```

### Token 驗證 API
```http
GET /api/auth/verify
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**回應**：
- `200 OK`：Token 有效
- `401 Unauthorized`：Token 無效或過期

## 🎯 使用流程

### 新用戶註冊流程
1. 用戶填寫註冊表單（姓名、Email、電話、密碼）
2. 系統檢查 Email 唯一性
3. 創建新用戶帳戶
4. 自動生成 JWT token
5. 自動登入並跳轉到 Dashboard

### 現有用戶登入流程
1. 用戶輸入 Email 和密碼
2. 系統驗證認證資訊
3. 生成 JWT token
4. 載入用戶資料和會員狀態
5. 跳轉到對應的 Dashboard

### 會話管理
- JWT token 有效期：24 小時
- localStorage 持久化會話
- 頁面刷新自動恢復登入狀態

## 🔧 開發者指南

### 使用 AuthContext
```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, login, register, logout, isAuthenticated } = useAuth();
  
  // 註冊用戶
  const handleRegister = async () => {
    const result = await register(email, password, name, phone);
    if (result.success) {
      // 註冊成功，自動跳轉
    } else {
      // 處理錯誤
      console.error(result.error);
    }
  };
}
```

### 保護路由
```typescript
import { validateJWT } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  const payload = validateJWT(request);
  if (!payload) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  // 繼續處理請求...
}
```

## 🧪 測試帳號

系統提供以下測試帳號（密碼：`password`）：

| 角色 | Email | 姓名 |
|------|-------|------|
| 學生 | alice@example.com | Alice Wang |
| 教師 | teacher@example.com | 王老師 | password |
| 營運 | olivia@example.com | Olivia Kao |
| 管理員 | admin@example.com | Admin User |
| 企業窗口 | frank@taiwantech.com | Frank Liu |

## ⚡ 快速開始

1. 訪問 `/login` 頁面
2. 選擇「立即註冊」
3. 填寫完整資料
4. 點擊「註冊」按鈕
5. 自動登入並跳轉到 Dashboard

或者使用測試帳號快速登入體驗系統功能。

## 🛡 安全考量

- 密碼使用模擬的 bcrypt 雜湊存儲
- JWT token 包含過期時間
- API 端點返回正確的 HTTP 狀態碼
- 輸入驗證防止惡意請求
- 會話自動過期保護

系統已準備好供學員使用完整的註冊和登入功能！