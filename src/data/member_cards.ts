export interface MemberCard {
  id: number;
  created_at: string;
  updated_at?: string;
  name: string;
  available_course_ids: (number | string)[];
}

export const memberCards: MemberCard[] = [
  {
    id: 1,
    created_at: "2025-07-14T12:00:00+00:00",
    name: "Season Chinese Pass",
    available_course_ids: [2, 4] // 基礎中文會話, 日語入門
  },
  {
    id: 2,
    created_at: "2025-07-14T12:00:00+00:00",
    name: "Annual All Access Pass",
    available_course_ids: [1, 2, 3, 4, 5, 6] // 所有課程
  },
  {
    id: 3,
    created_at: "2025-07-14T12:00:00+00:00",
    name: "Corporate Annual Pass",
    available_course_ids: [1, 3, 5, 6] // 英語系列課程
  },
  {
    id: 4,
    created_at: "2025-07-14T12:00:00+00:00",
    name: "Corporate Season Pass",
    available_course_ids: [2, 4] // 基礎語言課程
  }
];