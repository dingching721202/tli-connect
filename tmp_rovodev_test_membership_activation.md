# 會員卡啟用功能測試指南 (User Story 04)

## 🎯 功能概述

實現學員對已購買的會員卡設定生效日期或立即啟用功能，讓期限正式開始倒數，並可進行課程預約。

## ✅ 已實現功能

### 1. API 端點
- `POST /api/member-cards/{id}/activate` - 啟用會員卡

### 2. 業務邏輯
- ✅ 只能對狀態 `PURCHASED` 的卡進行啟用
- ✅ 若已有 `ACTIVE` 會員卡 → 回傳 422 `ACTIVE_CARD_EXISTS`
- ✅ 啟用成功後：
  - status → `ACTIVE`
  - activated_at = today
  - expire_at = activated_at + duration_days

### 3. 前端組件
- ✅ `MembershipCard` 組件顯示會員卡狀態
- ✅ Dashboard 即時顯示卡片到期日
- ✅ 啟用按鈕和狀態管理

## 🧪 測試步驟

### 準備測試資料

1. **修改測試用戶的會員資料**
   - 編輯 `src/data/memberships.ts`
   - 將 user_id: 2 的會員狀態改為 `PURCHASED`

```typescript
{
  id: 2,
  created_at: "2025-07-14T12:00:00+00:00",
  member_card_id: 1,
  duration_in_days: 90,
  start_time: null,
  expire_time: null,
  activated: false,
  activate_expire_time: "2025-08-13T12:00:00+00:00",
  user_id: 2,
  status: 'PURCHASED' // 改為 PURCHASED 狀態
}
```

### 測試案例

#### 案例 1: 正常啟用會員卡
1. 登入 user_id: 2 的帳號
2. 進入 Dashboard
3. 查看會員卡組件顯示 "待啟用" 狀態
4. 點擊 "立即啟用" 按鈕
5. 驗證啟用成功訊息
6. 確認會員卡狀態變為 "已啟用"
7. 確認顯示正確的到期日期

#### 案例 2: 重複啟用檢查
1. 使用已有 ACTIVE 會員卡的用戶
2. 嘗試啟用另一張會員卡
3. 應收到 "您已有啟用中的會員卡" 錯誤訊息

#### 案例 3: 無效會員卡
1. 嘗試啟用不存在的會員卡 ID
2. 應收到 "找不到可啟用的會員卡" 錯誤訊息

## 🔧 API 測試

### 使用 curl 測試

```bash
# 獲取 JWT Token (先登入)
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@example.com","password":"password"}'

# 啟用會員卡 (替換 {token} 和 {membership_id})
curl -X POST http://localhost:8080/api/member-cards/2/activate \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

### 預期回應

**成功啟用 (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "status": "ACTIVE",
    "activated_at": "2025-01-20T10:30:00.000Z",
    "expire_at": "2025-04-20T10:30:00.000Z",
    "duration_days": 90
  },
  "message": "會員卡啟用成功"
}
```

**已有啟用卡 (422 Unprocessable Entity):**
```json
{
  "success": false,
  "error": "ACTIVE_CARD_EXISTS",
  "message": "您已有啟用中的會員卡"
}
```

## 🎨 UI 狀態

### 會員卡狀態顯示
- **待啟用 (PURCHASED)**: 黃色背景，顯示啟用按鈕
- **已啟用 (ACTIVE)**: 綠色背景，顯示剩餘天數
- **已過期 (EXPIRED)**: 紅色背景，顯示過期訊息
- **無會員卡**: 灰色背景，提示購買會員方案

### 互動元素
- 啟用按鈕有 loading 狀態
- 成功/失敗訊息提示
- 即時更新 Dashboard 資料

## 🚀 啟動測試

1. 啟動開發伺服器: `npm run dev`
2. 登入測試帳號
3. 進入 Dashboard 查看會員卡組件
4. 執行上述測試案例

## 📝 注意事項

- 確保測試用戶有 `PURCHASED` 狀態的會員卡
- JWT Token 需要有效
- 啟用後會立即計算到期日期
- 一個用戶同時只能有一張 `ACTIVE` 會員卡