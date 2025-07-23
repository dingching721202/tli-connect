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
  purchase_date: string;
  membership_type: 'individual' | 'corporate';
  auto_renewal: boolean;
  slots: number;
  base_price: string;
  final_price: string;
  discount_rate: number;
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
    status: "ACTIVE",
    purchase_date: "2025-07-14T12:00:00+00:00",
    membership_type: "individual",
    auto_renewal: false,
    slots: 1,
    base_price: "3000.00",
    final_price: "3000.00",
    discount_rate: 0
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
    status: "PURCHASED",
    purchase_date: "2025-07-14T12:00:00+00:00",
    membership_type: "individual",
    auto_renewal: false,
    slots: 1,
    base_price: "3000.00",
    final_price: "3000.00",
    discount_rate: 0
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
    status: "ACTIVE",
    purchase_date: "2025-07-11T12:00:00+00:00",
    membership_type: "individual",
    auto_renewal: false,
    slots: 1,
    base_price: "3000.00",
    final_price: "3000.00",
    discount_rate: 0
  }
];

export default memberships;