export interface Membership {
  id: number;
  created_at: string;
  member_card_id: number;
  duration_in_days: number;
  start_time: string | null;
  expire_time: string | null;
  activated: boolean;
  activate_expire_time: string;
  user_id: number;
  status: 'PURCHASED' | 'ACTIVE' | 'EXPIRED';
}

export const memberships: Membership[] = [
  {
    id: 1,
    created_at: "2025-07-14T12:00:00+00:00",
    member_card_id: 1,
    duration_in_days: 90,
    start_time: "2025-07-14T12:00:00+00:00",
    expire_time: "2025-10-12T12:00:00+00:00",
    activated: true,
    activate_expire_time: "2025-08-13T12:00:00+00:00",
    user_id: 1,
    status: 'ACTIVE' as const
  },
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
    status: 'PURCHASED' as const
  },
  {
    id: 3,
    created_at: "2025-07-14T12:00:00+00:00",
    member_card_id: 1,
    duration_in_days: 90,
    start_time: "2025-07-11T12:00:00+00:00",
    expire_time: "2025-10-09T12:00:00+00:00",
    activated: true,
    activate_expire_time: "2025-08-13T12:00:00+00:00",
    user_id: 3,
    status: 'ACTIVE' as const
  },
  // 新增：完全沒有會員卡的用戶 (user_id: 4)
  // 用於測試「尚未購買會員方案」的情況
];