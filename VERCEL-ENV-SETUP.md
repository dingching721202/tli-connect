# Vercel 環境變數配置指南

## 必需的環境變數

請在 Vercel 專案設置中添加以下環境變數：

### 🔑 Supabase 配置

```bash
NEXT_PUBLIC_SUPABASE_URL=https://krkpmnlxklfhcijqpgdo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtya3Btbmx4a2xmaGNpanFwZ2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NzY4MzEsImV4cCI6MjA3MDU1MjgzMX0.QphJeGfsE6MbYzsKppeuvdtjgVDVS6Wgsvl1Ed0258M
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtya3Btbmx4a2xmaGNpanFwZ2RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk3NjgzMSwiZXhwIjoyMDcwNTUyODMxfQ.S0B_7WaI7oMTOx6vfyNgNJOiYV_z7aMJCwNHtCBEi9M
```

## 🚀 配置步驟

1. **登入 Vercel Dashboard**
   - 前往 https://vercel.com/dashboard
   - 選擇您的 `tli-connect` 專案

2. **進入專案設置**
   - 點擊專案名稱
   - 前往 **Settings** 標籤
   - 選擇 **Environment Variables**

3. **添加環境變數**
   - 依次添加上述三個環境變數
   - 確保每個變數都設置為 **Production**, **Preview**, 和 **Development** 環境

4. **重新部署**
   - 前往 **Deployments** 標籤
   - 重新部署最新的 commit

## ✅ 驗證配置

部署完成後，您應該看到：

- ✅ 所有16個統一服務顯示 `🚀 Supabase integration ACTIVE`
- ❌ 沒有任何 `🔧 Using Legacy mode` 消息
- ✅ 建置日誌中不再有 "Missing Supabase environment variables" 警告

## 📋 支援的服務

所有以下服務都已啟用 Supabase 整合：

1. 🚀 Unified Auth Service
2. 🚀 Unified Membership Service  
3. 🚀 Unified Booking Service
4. 🚀 Unified Corporate Service
5. 🚀 Unified Agent Service
6. 🚀 Unified Leave Service
7. 🚀 Unified Order Service
8. 🚀 Unified Timeslot Service
9. 🚀 Unified Staff Service
10. 🚀 Unified Teacher Service
11. 🚀 Unified Course Service
12. 🚀 Unified Member Card Plan Service
13. 🚀 Unified Consultation Service
14. 🚀 Unified System Settings Service
15. 🚀 Unified Referral Service

## 🔧 故障排除

如果您仍然看到 Legacy mode：

1. 檢查環境變數是否正確設置
2. 確保沒有拼寫錯誤
3. 重新部署專案
4. 檢查 Vercel 部署日誌

---

**📝 注意：** 此配置基於 TLI Connect Supabase 項目 (krkpmnlxklfhcijqpgdo) 設置。