# 課程模板與課程排程同步機制

## 功能概述

當課程模板被編輯時，所有相關的課程排程（不論是草稿或已發布狀態）都會自動同步更新。

## 同步觸發條件

以下課程模板變更會觸發同步：

1. **課程標題變更** - 更新所有相關排程的標題
2. **總堂數變更** - 重新生成課程時間表
3. **課程內容變更** - 更新現有時間表的課程內容
4. **滿班人數變更** - 記錄變更（可擴展至容量管理）

## 同步流程

### 1. 課程模板更新
```typescript
// 在 CourseTemplateManagement 中編輯模板
updateCourseTemplate(templateId, {
  title: "新的課程名稱",
  totalSessions: 12, // 從 10 堂改為 12 堂
  sessions: [
    { sessionNumber: 1, title: "Updated Lesson 1", ... },
    // ... 更多課程內容
  ]
});
```

### 2. 自動檢測變更
系統會自動檢測以下變更：
- `titleChanged`: 標題是否變更
- `totalSessionsChanged`: 總堂數是否變更
- `sessionsChanged`: 課程內容是否變更
- `capacityChanged`: 滿班人數是否變更

### 3. 同步相關排程
```typescript
// 找到所有使用該模板的課程排程
const relatedSchedules = schedules.filter(schedule => 
  schedule.templateId === templateId
);

// 對每個相關排程進行同步
relatedSchedules.forEach(schedule => {
  // 1. 同步標題
  if (titleChanged) {
    schedule.templateTitle = updatedTemplate.title;
  }
  
  // 2. 重新生成時間表（如果總堂數變更）
  if (totalSessionsChanged) {
    schedule.generatedSessions = generateScheduledSessions(...);
    schedule.endDate = calculateEndDate(...);
  }
  
  // 3. 更新課程內容（如果內容變更）
  if (sessionsChanged) {
    schedule.generatedSessions = updateSessionContent(...);
  }
});
```

### 4. 通知相關系統
- 觸發 `courseSchedulesUpdated` 事件通知課程排程管理
- 如果有已發布的排程，觸發 `bookingsUpdated` 事件通知時段管理

## 使用範例

### 情境 1: 修改課程標題
1. 在課程模組中編輯課程模板，將標題從「基礎華語會話」改為「初級華語對話」
2. 系統自動找到 2 個使用該模板的課程排程（1個草稿，1個已發布）
3. 兩個排程的 `templateTitle` 都自動更新為「初級華語對話」
4. 課程排程管理頁面即時更新顯示新標題

### 情境 2: 增加課程堂數
1. 在課程模組中將總堂數從 10 堂增加到 12 堂
2. 系統自動重新生成所有相關排程的時間表
3. 新的時間表包含 12 堂課，自動計算新的結束日期
4. 已發布的排程會通知時段管理更新預約數據

### 情境 3: 修改課程內容
1. 在課程模組中更新 Lesson 1 的標題和教材連結
2. 系統自動更新所有相關排程中對應課程的內容
3. 不影響時間安排，只更新課程名稱和連結
4. 保持預約數據完整性

## 日誌輸出範例

```
課程模板有重要變更，開始同步課程排程...
變更項目: {
  titleChanged: "基礎華語會話 → 初級華語對話",
  totalSessionsChanged: "10 → 12",
  sessionsChanged: true,
  capacityChanged: false
}
找到 2 個相關的課程排程需要同步
同步排程標題: 基礎華語會話 → 初級華語對話
總堂數已變更: 10 → 12，重新生成課程時間表
課程排程同步完成
已通知時段管理更新預約數據
```

## 注意事項

1. **數據一致性**: 同步過程確保所有相關數據保持一致
2. **即時更新**: 使用事件系統確保界面即時更新
3. **預約保護**: 已有預約的時段在同步時會保持預約數據
4. **錯誤處理**: 包含完整的錯誤處理和日誌記錄
5. **性能優化**: 只在有實際變更時才執行同步操作

## 相關文件

- `src/data/courseTemplateUtils.ts` - 課程模板管理
- `src/data/courseScheduleUtils.ts` - 課程排程管理
- `src/components/CourseTemplateManagement.tsx` - 課程模組界面
- `src/components/CourseScheduleManagement.tsx` - 課程排程界面
- `src/services/timeslotService.ts` - 時段管理服務