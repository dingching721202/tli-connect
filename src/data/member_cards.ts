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
    available_course_ids: ["f224eb94-d581-4050-beae-9f7679bb21e4", "f4b0f596-756a-480c-8d52-d820cde3fb05"] // 基礎中文會話, 日語入門
  },
  {
    id: 2,
    created_at: "2025-07-14T12:00:00+00:00",
    name: "Annual All Access Pass",
    available_course_ids: ["b336a6a5-9173-4cda-bfb5-320446682fc9", "f224eb94-d581-4050-beae-9f7679bb21e4", "c273f4d4-70c8-426e-914c-79a6544b8e44", "f4b0f596-756a-480c-8d52-d820cde3fb05", "4c3ee063-63ba-4171-82fa-246ceee6854b"] // 所有課程
  },
  {
    id: 3,
    created_at: "2025-07-14T12:00:00+00:00",
    name: "Corporate Annual Pass",
    available_course_ids: ["b336a6a5-9173-4cda-bfb5-320446682fc9", "c273f4d4-70c8-426e-914c-79a6544b8e44", "4c3ee063-63ba-4171-82fa-246ceee6854b"] // 英語系列課程
  },
  {
    id: 4,
    created_at: "2025-07-14T12:00:00+00:00",
    name: "Corporate Season Pass",
    available_course_ids: ["f224eb94-d581-4050-beae-9f7679bb21e4", "f4b0f596-756a-480c-8d52-d820cde3fb05"] // 基礎語言課程
  }
];