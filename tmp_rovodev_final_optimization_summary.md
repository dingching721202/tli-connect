# 🎯 課程統一設定功能 - 最終優化版本

## 📋 功能總覽

已成功實作並優化課程模組的統一設定功能，採用**極簡直觀**的設計理念：

### 核心概念
> **欄位有填資訊就是獨立設定，空的就自動使用統一設定**

## 🔧 實作特點

### 1. **零按鈕設計**
- ❌ 移除所有 "使用統一" / "獨立設定" 切換按鈕
- ✅ 純粹根據欄位內容自動判斷
- ✅ 紫色標籤即時提示目前狀態

### 2. **智慧判斷邏輯**
```typescript
// 判斷是否使用統一設定
const isUsingGlobalSetting = (session, field) => {
  const value = session[field];
  if (field === 'title') {
    // 標題如果是預設格式就算使用統一設定
    const defaultPattern = `第 ${session.sessionNumber} 堂課`;
    return !value || value === defaultPattern || value.trim() === '';
  }
  // 其他欄位空的就是使用統一設定
  return !value || value.trim() === '';
};
```

### 3. **使用者體驗**
- 🟣 **空欄位** → 顯示統一設定內容 + 紫色 "使用統一設定" 標籤
- ⚪ **有內容** → 顯示個別設定內容，無標籤
- 📝 **placeholder** → "留空使用統一設定，或輸入自訂內容"

## 🎮 操作流程

### 設定統一資訊
1. 在統一設定區塊填入：
   - 統一課程標題模板：`第{n}課 - 基礎會話`
   - 統一虛擬教室連結：`https://meet.google.com/abc-defg-hij`
   - 統一教材連結：`https://drive.google.com/materials`

### 個別課程處理
- **使用統一設定**：保持欄位空白
- **獨立設定**：直接在欄位中輸入內容
- **切換回統一**：清空欄位內容

### 批量操作
- 點擊 "套用到所有課程" 按鈕清空所有個別設定

## 📈 優勢

### ✅ 極簡操作
- 不需要學習任何按鈕功能
- 填或不填就決定使用方式
- 符合最直觀的使用邏輯

### ✅ 即時回饋
- 紫色標籤即時顯示統一設定狀態
- 欄位內容即時反映統一或個別設定

### ✅ 高效管理
- 大部分課程使用統一設定（留空）
- 特殊課程填入個別內容
- 一鍵重置所有課程為統一設定

## 🔍 技術實作

### 資料結構
```typescript
interface CourseTemplate {
  // 統一設定
  globalSettings?: {
    defaultTitle?: string;
    defaultVirtualClassroomLink?: string;
    defaultMaterialLink?: string;
  };
  sessions: CourseSession[];
}

interface CourseSession {
  sessionNumber: number;
  title: string;
  virtualClassroomLink?: string;
  materialLink?: string;
  // 不再需要 useGlobal* 欄位
}
```

### 顯示邏輯
```typescript
const getDisplayValue = (session, field) => {
  if (isUsingGlobalSetting(session, field)) {
    // 使用統一設定
    if (field === 'title') {
      return globalSettings?.defaultTitle?.replace('{n}', session.sessionNumber) || `第 ${session.sessionNumber} 堂課`;
    }
    return globalSettings?.[`default${field}`] || '';
  }
  // 使用個別設定
  return session[field] || '';
};
```

## 🎯 總結

這個優化版本完美實現了您的需求：

1. **統一設定** - 整個課程的預設資訊
2. **個別彈性** - 特殊課程可獨立設定
3. **極簡操作** - 填或不填就決定使用方式
4. **零學習成本** - 完全符合直觀邏輯

> 🚀 **最終效果**：使用者可以快速建立課程，大部分情況下只需要設定統一資訊，個別課程有特殊需求時直接填入即可，完全不需要額外的按鈕操作！