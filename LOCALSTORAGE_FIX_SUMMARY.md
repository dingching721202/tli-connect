# LocalStorage 課程管理修復摘要

## 問題描述

課程管理系統中的組件狀態沒有正確同步 localStorage 的變更，導致：
1. 課程模板變更後，界面不會即時更新
2. 課程排程與模板之間的同步不完整
3. 組件間的數據一致性問題

## 修復內容

### 1. 事件系統完善

**新增事件觸發：**
- `courseTemplatesUpdated` - 課程模板變更事件
- 在所有 CRUD 操作中觸發對應事件

**修復位置：**
- `src/data/courseTemplateUtils.ts`
  - `createCourseTemplate()` - 新增事件觸發
  - `updateCourseTemplate()` - 新增事件觸發  
  - `deleteCourseTemplate()` - 已有事件觸發

### 2. 組件事件監聽

**CourseTemplateManagement 組件：**
```typescript
// 新增監聽課程模板更新事件
window.addEventListener('courseTemplatesUpdated', handleTemplatesUpdated);

// 移除手動狀態更新，改為事件驅動
// ❌ setTemplates(prev => prev.map(...))
// ✅ 透過事件監聽自動重新載入
```

**CourseScheduleManagement 組件：**
```typescript
// 新增監聽課程模板更新事件
window.addEventListener('courseTemplatesUpdated', handleTemplatesUpdated);

// 移除手動狀態更新
// ❌ setSchedules(prev => prev.map(...))
// ✅ 透過事件監聽自動重新載入
```

### 3. 數據流優化

**舊流程（有問題）：**
```
用戶操作 → 更新 localStorage → 手動更新組件 state
```

**新流程（修復後）：**
```
用戶操作 → 更新 localStorage → 觸發事件 → 所有監聽組件自動重新載入
```

### 4. 具體修復的操作

**課程模板管理：**
- ✅ 新增模板 - 自動觸發事件
- ✅ 更新模板 - 自動觸發事件並同步排程
- ✅ 刪除模板 - 自動觸發事件
- ✅ 複製模板 - 自動觸發事件
- ✅ 切換發布狀態 - 自動觸發事件

**課程排程管理：**
- ✅ 監聽模板變更事件
- ✅ 自動重新載入相關數據
- ✅ 移除手動狀態更新

### 5. 同步機制增強

當課程模板變更時，會自動：
1. 觸發 `courseTemplatesUpdated` 事件
2. 課程排程管理監聽到事件後重新載入數據
3. 如有重要變更，自動調用 `syncCourseScheduleWithTemplate()`
4. 更新所有相關的課程排程
5. 通知時段管理系統更新

## 測試方法

### 1. 課程模板測試
1. 開啟課程管理 → 課程模組
2. 新增一個課程模板
3. **驗證：** 模板列表立即更新，無需手動刷新

### 2. 跨組件同步測試
1. 在課程模組中編輯已發布的模板標題
2. 切換到課程排程分頁
3. **驗證：** 相關排程的標題已自動更新

### 3. 總堂數變更測試
1. 在課程模組中修改總堂數（如從 10 堂改為 12 堂）
2. 切換到課程排程分頁
3. **驗證：** 相關排程的課程時間表已重新生成

### 4. 瀏覽器控制台檢查
開啟開發者工具，應該能看到類似日誌：
```
收到課程模板更新事件，重新載入模板
收到課程模板更新事件，重新載入課程排程數據
課程模板有重要變更，開始同步課程排程...
```

## 技術細節

### 事件命名規範
- `courseTemplatesUpdated` - 課程模板更新事件
- `courseSchedulesUpdated` - 課程排程更新事件  
- `teachersUpdated` - 教師數據更新事件
- `bookingsUpdated` - 預約數據更新事件

### 事件數據格式
```typescript
window.dispatchEvent(new CustomEvent('courseTemplatesUpdated', { 
  detail: { 
    action: 'create' | 'update' | 'delete', 
    template: CourseTemplate 
  } 
}));
```

### 記憶體清理
所有事件監聽器都在組件卸載時正確清理：
```typescript
return () => {
  window.removeEventListener('courseTemplatesUpdated', handleTemplatesUpdated);
  // ... 其他監聽器
};
```

## 相關文件

- `src/data/courseTemplateUtils.ts` - 課程模板數據管理
- `src/data/courseScheduleUtils.ts` - 課程排程數據管理  
- `src/components/CourseTemplateManagement.tsx` - 課程模組界面
- `src/components/CourseScheduleManagement.tsx` - 課程排程界面
- `src/components/TimeslotManagement.tsx` - 時段管理界面

修復完成後，課程管理系統現在具有完整的數據一致性和即時同步功能！