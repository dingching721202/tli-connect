# 會員卡啟用完整流程指南

## 🔄 會員卡生命週期

### 1. 無會員卡狀態
**情況：** 用戶尚未購買任何會員方案
**顯示：** 
- 提示「尚未購買會員方案」
- 顯示「購買會員方案」按鈕
- 引導用戶到 `/membership` 頁面

**操作：**
```javascript
// 用戶點擊購買按鈕
window.location.href = '/membership'
```

### 2. 已購買但未啟用 (PURCHASED)
**情況：** 用戶已購買會員方案，但尚未啟用
**顯示：**
- 會員卡狀態：「待啟用」(黃色背景)
- 顯示「立即啟用」按鈕
- 提示啟用後開始計算期限

**操作：**
```javascript
// 啟用會員卡
POST /api/member-cards/{id}/activate
```

### 3. 已啟用 (ACTIVE)
**情況：** 會員卡已啟用，正在使用中
**顯示：**
- 會員卡狀態：「已啟用」(綠色背景)
- 顯示剩餘天數
- 顯示到期日期
- 會員權益說明

### 4. 已過期 (EXPIRED)
**情況：** 會員卡已過期
**顯示：**
- 會員卡狀態：「已過期」(紅色背景)
- 提示續費或購買新方案

## 🎯 啟用會員卡的三種方式

### 方式 1: Dashboard 中啟用
1. 登入系統
2. 進入 Dashboard
3. 在會員卡組件中點擊「立即啟用」
4. 確認啟用成功

### 方式 2: API 直接啟用
```bash
# 獲取 JWT Token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# 啟用會員卡
curl -X POST http://localhost:8080/api/member-cards/{membership_id}/activate \
  -H "Authorization: Bearer {jwt_token}"
```

### 方式 3: 購買後立即啟用
在購買流程中添加「立即啟用」選項（未來功能）

## 🚫 啟用限制和錯誤處理

### 1. 重複啟用檢查
**錯誤：** `ACTIVE_CARD_EXISTS` (422)
**原因：** 用戶已有啟用中的會員卡
**處理：** 提示用戶已有啟用卡，無法重複啟用

### 2. 會員卡不存在
**錯誤：** `MEMBERSHIP_NOT_FOUND` (404)
**原因：** 找不到指定的會員卡或狀態不是 PURCHASED
**處理：** 提示找不到可啟用的會員卡

### 3. 未登入
**錯誤：** `Unauthorized` (401)
**原因：** JWT Token 無效或過期
**處理：** 重新導向到登入頁面

## 📱 UI/UX 設計考量

### 會員卡狀態顏色
- **待啟用 (PURCHASED):** 黃色 (`bg-yellow-50`, `text-yellow-600`)
- **已啟用 (ACTIVE):** 綠色 (`bg-green-50`, `text-green-600`)
- **已過期 (EXPIRED):** 紅色 (`bg-red-50`, `text-red-600`)
- **無會員卡:** 灰色 (`bg-gray-50`, `text-gray-500`)

### 互動元素
- 啟用按鈕有 loading 狀態
- 成功/失敗訊息提示
- 剩餘天數警告 (≤7天顯示警告)
- 會員權益說明

### 響應式設計
- 手機版優化佈局
- 平板和桌面版多欄顯示
- 適當的間距和字體大小

## 🧪 測試場景

### 場景 1: 新用戶首次使用
1. 註冊新帳號
2. 登入 Dashboard
3. 看到「尚未購買會員方案」提示
4. 點擊購買按鈕跳轉到會員方案頁面

### 場景 2: 購買後啟用
1. 用戶購買會員方案 (狀態變為 PURCHASED)
2. 在 Dashboard 看到「待啟用」狀態
3. 點擊「立即啟用」按鈕
4. 確認啟用成功，狀態變為 ACTIVE

### 場景 3: 重複啟用測試
1. 用戶已有 ACTIVE 會員卡
2. 嘗試啟用另一張會員卡
3. 系統阻止並顯示錯誤訊息

### 場景 4: 會員卡到期
1. 會員卡接近到期 (≤7天)
2. 顯示到期警告
3. 會員卡過期後狀態變為 EXPIRED
4. 提示續費或購買新方案

## 💡 改進建議

### 短期改進
1. 添加會員卡到期提醒功能
2. 支援延期啟用 (設定未來啟用日期)
3. 添加會員卡使用統計

### 長期改進
1. 自動續費功能
2. 會員等級制度
3. 推薦朋友獲得延期
4. 企業批量會員卡管理

## 🔗 相關頁面和組件

- `/dashboard` - 主要會員卡管理頁面
- `/membership` - 會員方案購買頁面
- `MembershipCard.tsx` - 會員卡顯示組件
- `PurchaseModal.tsx` - 購買流程組件
- `/api/member-cards/{id}/activate` - 啟用 API