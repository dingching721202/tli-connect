export interface ClassAppointment {
  id: number;
  created_at: string;
  class_timeslot_id: number;
  status: 'CONFIRMED' | 'CANCELED';
  user_id: number;
}

export const classAppointments: ClassAppointment[] = [
  {
    id: 1,
    created_at: "2025-07-14T12:00:00+00:00",
    class_timeslot_id: 1,
    status: "CONFIRMED",
    user_id: 1
  },
  {
    id: 2,
    created_at: "2025-07-14T12:00:00+00:00",
    class_timeslot_id: 2,
    status: "CONFIRMED",
    user_id: 1
  },
  {
    id: 3,
    created_at: "2025-07-14T12:00:00+00:00",
    class_timeslot_id: 3,
    status: "CONFIRMED",
    user_id: 3
  }
];

export default classAppointments;