// ========================================
// 向下相容性檔案
// 將舊的 member_card_plans 對應到新的 memberCardPlans
// ========================================

import { memberCardPlans } from './memberCardPlans';

// 向下相容的別名
export const member_card_plans = memberCardPlans;
export { memberCardPlans };

// 預設匯出
export default memberCardPlans;