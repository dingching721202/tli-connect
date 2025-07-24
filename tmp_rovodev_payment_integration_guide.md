# Mock 金流服務串接指南

## 📋 API 規格實現

### 1. 建立付款 API

**端點:** `POST /api/payment/create`

**請求格式:**
```json
{
  "order_id": "ord_123",
  "amount": 1999,
  "description": "一年期會員方案",
  "return_url": "https://myapp.local/payment-result"
}
```

**成功回應 (200 OK):**
```json
{
  "success": true,
  "data": {
    "payment_id": "pay_abc789",
    "payment_url": "https://myapp.local/payment-result?payment_id=pay_abc789&status=successful&order_id=ord_123",
    "order_id": "ord_123",
    "amount": 1999,
    "status": "successful"
  }
}
```

**失敗回應 (400/500):**
```json
{
  "success": false,
  "error": "錯誤訊息",
  "data": {
    "payment_id": "pay_abc789",
    "order_id": "ord_123",
    "status": "failed"
  }
}
```

## 🔧 已實現功能

### 1. PaymentService (`/src/services/paymentService.ts`)
- ✅ 符合 API 規格的請求/回應格式
- ✅ 模擬 80% 成功率
- ✅ 完整的錯誤處理
- ✅ 請求驗證 (必要欄位、金額驗證)
- ✅ 模擬網路延遲 (1-3秒)
- ✅ 詳細的 Console 日誌

### 2. API 路由 (`/src/app/api/payment/create/route.ts`)
- ✅ 訂單狀態驗證
- ✅ 訂單過期檢查
- ✅ 付款成功後更新訂單狀態
- ✅ 生成付款結果頁面 URL

### 3. 付款結果頁面 (`/src/app/payment-result/page.tsx`)
- ✅ 顯示付款成功/失敗狀態
- ✅ 重試付款功能
- ✅ 自動跳轉到首頁

## 🧪 測試方式

### 1. 使用測試頁面
開啟 `tmp_rovodev_payment_demo.html` 進行互動式測試

### 2. 使用瀏覽器控制台
```javascript
// 測試正常付款
fetch('/api/payment/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    order_id: 'ord_test_123',
    amount: 1999,
    description: '測試付款',
    return_url: window.location.origin + '/payment-result'
  })
}).then(r => r.json()).then(console.log);
```

### 3. 測試案例
1. **正常付款** - 所有欄位完整
2. **缺少欄位** - 測試驗證邏輯
3. **無效金額** - 負數或零
4. **多次付款** - 測試成功率

## 🔄 付款流程

1. **創建訂單** → 呼叫訂單 API
2. **發起付款** → 呼叫 `/api/payment/create`
3. **處理回應** → 根據 `success` 狀態處理
4. **跳轉結果頁** → 使用 `payment_url`
5. **顯示結果** → 成功/失敗頁面

## 📝 注意事項

- Mock 服務有 80% 成功率，模擬真實情況
- 所有請求都有 1-3 秒隨機延遲
- 付款 ID 格式: `pay_` + 9位隨機字符
- 訂單必須是 `CREATED` 狀態才能付款
- 過期訂單會自動標記為 `CANCELED`

## 🚀 啟動測試

1. 啟動開發伺服器: `npm run dev`
2. 開啟測試頁面: `http://localhost:8080/tmp_rovodev_payment_demo.html`
3. 執行各種測試案例
4. 檢查 Console 日誌查看詳細資訊