export interface TeacherLeaveRecord {
  id: number;
  created_at: string;
  class_timeslot_id: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const teacherLeaveRecords: TeacherLeaveRecord[] = [
  {
    id: 1,
    created_at: "2025-07-14T12:00:00+00:00",
    class_timeslot_id: 4,
    status: "PENDING"
  }
];

export default teacherLeaveRecords;