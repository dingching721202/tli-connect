# 登入頁面測試帳號指南

## 🎯 會員卡測試帳號

登入頁面現在顯示專門的會員卡測試帳號，方便測試不同的會員卡狀態：

### 會員卡狀態測試帳號

| 帳號 | 姓名 | 會員卡狀態 | 測試用途 |
|------|------|-----------|----------|
| `alice@example.com` | Alice Wang | ✅ ACTIVE | 已啟用會員卡，查看完整功能 |
| `user2@example.com` | Bob Chen | ⏳ PURCHASED | 待啟用會員卡，測試啟用功能 |
| `charlie@example.com` | Charlie Lin | ✅ ACTIVE | 已啟用會員卡，測試重複啟用 |
| `david@example.com` | David Wilson | 🚫 無會員卡 | 完全沒有會員卡，測試購買流程 |

### 其他角色測試帳號

| 帳號 | 姓名 | 角色 | 用途 |
|------|------|------|------|
| `daisy@example.com` | Daisy Hsu | 教師 | 測試教師功能 |
| `frank@taiwantech.com` | Frank Liu | 企業窗口 | 測試企業管理功能 |
| `olivia@example.com` | Olivia Kao | 營運 | 測試營運管理功能 |
| `admin@example.com` | Admin User | 管理員 | 測試管理員功能 |

## 🚀 使用方式

1. **開啟登入頁面**
   ```
   http://localhost:8080/login
   ```

2. **選擇測試帳號**
   - 在登入表單下方會看到「會員卡測試帳號」區塊
   - 點擊任一帳號按鈕，會自動填入 email 和密碼
   - 點擊「登入」按鈕完成登入

3. **測試不同狀態**
   - **無會員卡狀態**: 使用 `david@example.com`
   - **待啟用狀態**: 使用 `user2@example.com`
   - **已啟用狀態**: 使用 `alice@example.com` 或 `charlie@example.com`

## 🎨 UI 改進

### 會員卡測試帳號區塊
- 清楚顯示會員卡狀態 (✅ ACTIVE, ⏳ PURCHASED, 🚫 無會員卡)
- 包含帳號描述，說明測試用途
- 視覺上與其他角色測試帳號分開

### 其他角色測試帳號區塊
- 簡潔顯示角色類型
- 顏色編碼區分不同角色
- 較小的卡片設計，節省空間

## 🧪 測試流程建議

### 完整會員卡測試流程
1. **登入無會員卡用戶** (`david@example.com`)
   - 查看 Dashboard 顯示「尚未購買會員方案」
   - 測試購買按鈕跳轉

2. **登入待啟用用戶** (`user2@example.com`)
   - 查看 Dashboard 顯示「待啟用」會員卡
   - 測試啟用功能

3. **登入已啟用用戶** (`alice@example.com`)
   - 查看 Dashboard 顯示完整會員資訊
   - 測試各種會員功能

4. **測試重複啟用保護** (`charlie@example.com`)
   - 嘗試啟用已啟用的會員卡
   - 驗證錯誤處理

## 💡 開發者提示

- 所有測試帳號密碼都是 `password`
- 帳號資料定義在 `src/data/users.ts`
- 會員卡資料定義在 `src/data/memberships.ts`
- 登入組件位於 `src/components/Login.tsx`

## 🔄 快速切換測試

現在可以在登入頁面快速切換不同的測試帳號，無需記住複雜的 email 地址，大大提升了測試效率！

每個帳號都有清楚的標示說明其會員卡狀態和測試用途，讓測試人員能夠快速理解並選擇合適的帳號進行測試。