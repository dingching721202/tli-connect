export interface ClassTimeslot {
  id: number;
  created_at: string;
  class_id: number;
  lesson_id: number;
  session_number: number;
  start_time: string;
  end_time: string;
  status: 'AVAILABLE' | 'CREATED' | 'CANCELED';
  location: string;
  max_participants: number;
  current_participants: number;
  updated_at: string;
}

export const classTimeslots: ClassTimeslot[] = [
  {
    id: 1,
    created_at: "2025-07-14T12:00:00+00:00",
    class_id: 1,
    lesson_id: 1,
    session_number: 1,
    start_time: "2025-07-16T19:00:00+00:00",
    end_time: "2025-07-16T21:00:00+00:00",
    status: "AVAILABLE",
    location: "線上會議室A",
    max_participants: 15,
    current_participants: 12,
    updated_at: "2025-07-20T00:00:00Z"
  },
  {
    id: 2,
    created_at: "2025-07-14T12:00:00+00:00",
    class_id: 1,
    lesson_id: 2,
    session_number: 2,
    start_time: "2025-07-18T19:00:00+00:00",
    end_time: "2025-07-18T21:00:00+00:00",
    status: "AVAILABLE",
    location: "線上會議室A",
    max_participants: 15,
    current_participants: 12,
    updated_at: "2025-07-20T00:00:00Z"
  },
  {
    id: 3,
    created_at: "2025-07-14T12:00:00+00:00",
    class_id: 1,
    lesson_id: 8,
    session_number: 3,
    start_time: "2025-07-23T19:00:00+00:00",
    end_time: "2025-07-23T21:00:00+00:00",
    status: "AVAILABLE",
    location: "線上會議室A",
    max_participants: 15,
    current_participants: 12,
    updated_at: "2025-07-20T00:00:00Z"
  },
  {
    id: 4,
    created_at: "2025-07-14T12:00:00+00:00",
    class_id: 2,
    lesson_id: 3,
    session_number: 1,
    start_time: "2025-07-16T18:00:00+00:00",
    end_time: "2025-07-16T20:00:00+00:00",
    status: "AVAILABLE",
    location: "台北教室201",
    max_participants: 12,
    current_participants: 8,
    updated_at: "2025-07-20T00:00:00Z"
  },
  {
    id: 5,
    created_at: "2025-07-14T12:00:00+00:00",
    class_id: 2,
    lesson_id: 9,
    session_number: 2,
    start_time: "2025-07-19T18:00:00+00:00",
    end_time: "2025-07-19T20:00:00+00:00",
    status: "AVAILABLE",
    location: "台北教室201",
    max_participants: 12,
    current_participants: 8,
    updated_at: "2025-07-20T00:00:00Z"
  },
  {
    id: 6,
    created_at: "2025-07-14T12:00:00+00:00",
    class_id: 3,
    lesson_id: 4,
    session_number: 1,
    start_time: "2025-08-05T19:30:00+00:00",
    end_time: "2025-08-05T21:30:00+00:00",
    status: "AVAILABLE",
    location: "線上會議室B",
    max_participants: 20,
    current_participants: 16,
    updated_at: "2025-07-20T00:00:00Z"
  },
  {
    id: 7,
    created_at: "2025-07-14T12:00:00+00:00",
    class_id: 4,
    lesson_id: 5,
    session_number: 1,
    start_time: "2025-08-02T19:00:00+00:00",
    end_time: "2025-08-02T21:00:00+00:00",
    status: "AVAILABLE",
    location: "台北教室301",
    max_participants: 18,
    current_participants: 14,
    updated_at: "2025-07-20T00:00:00Z"
  },
  {
    id: 8,
    created_at: "2025-07-14T12:00:00+00:00",
    class_id: 5,
    lesson_id: 6,
    session_number: 1,
    start_time: "2025-08-03T14:00:00+00:00",
    end_time: "2025-08-03T17:00:00+00:00",
    status: "AVAILABLE",
    location: "台北教室大廳",
    max_participants: 25,
    current_participants: 22,
    updated_at: "2025-07-20T00:00:00Z"
  },
  {
    id: 9,
    created_at: "2025-07-14T12:00:00+00:00",
    class_id: 5,
    lesson_id: 6,
    session_number: 2,
    start_time: "2025-08-04T14:00:00+00:00",
    end_time: "2025-08-04T17:00:00+00:00",
    status: "AVAILABLE",
    location: "台北教室大廳",
    max_participants: 25,
    current_participants: 22,
    updated_at: "2025-07-20T00:00:00Z"
  },
  {
    id: 10,
    created_at: "2025-07-14T12:00:00+00:00",
    class_id: 6,
    lesson_id: 7,
    session_number: 1,
    start_time: "2025-08-07T18:30:00+00:00",
    end_time: "2025-08-07T21:00:00+00:00",
    status: "AVAILABLE",
    location: "線上會議室C",
    max_participants: 15,
    current_participants: 11,
    updated_at: "2025-07-20T00:00:00Z"
  }
];

export default classTimeslots;