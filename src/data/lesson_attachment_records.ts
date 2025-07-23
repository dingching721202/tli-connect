export interface LessonAttachmentRecord {
  id: number;
  created_at: string;
  lesson_attachment_id: number;
  progress: number;
  user_id: number;
}

export const lessonAttachmentRecords: LessonAttachmentRecord[] = [
  {
    id: 1,
    created_at: "2025-07-14T12:00:00+00:00",
    lesson_attachment_id: 1,
    progress: 0.5,
    user_id: 1
  },
  {
    id: 2,
    created_at: "2025-07-14T12:00:00+00:00",
    lesson_attachment_id: 1,
    progress: 1.0,
    user_id: 3
  }
];

export default lessonAttachmentRecords;