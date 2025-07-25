export interface MemberCard {
  id: number;
  created_at: string;
  name: string;
  available_course_ids: number[];
}

export const memberCards: MemberCard[] = [
  {
    id: 1,
    created_at: "2025-07-14T12:00:00+00:00",
    name: "Season Chinese Pass",
    available_course_ids: [2]
  },
  {
    id: 2,
    created_at: "2025-07-14T12:00:00+00:00",
    name: "Annual All Access Pass",
    available_course_ids: [1, 2]
  },
  {
    id: 3,
    created_at: "2025-07-14T12:00:00+00:00",
    name: "Corporate Annual Pass",
    available_course_ids: [1, 2]
  },
  {
    id: 4,
    created_at: "2025-07-14T12:00:00+00:00",
    name: "Corporate Season Pass",
    available_course_ids: [2]
  }
];