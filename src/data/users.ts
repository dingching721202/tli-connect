export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'STUDENT' | 'TEACHER' | 'OPS' | 'CORPORATE_CONTACT' | 'ADMIN';
  created_at: string;
}

export const users: User[] = [
  {
    name: "Alice Wang",
    email: "alice@example.com",
    phone: "0900-111-222",
    password: "hashed_pw1",
    role: "STUDENT",
    id: 1,
    created_at: "2025-07-14T12:00:00+00:00"
  },
  {
    name: "Bob Chen",
    email: "bob@example.com",
    phone: "0900-333-444",
    password: "hashed_pw2",
    role: "STUDENT",
    id: 2,
    created_at: "2025-07-14T12:00:00+00:00"
  },
  {
    name: "Charlie Lin",
    email: "charlie@example.com",
    phone: "0900-555-666",
    password: "hashed_pw3",
    role: "STUDENT",
    id: 3,
    created_at: "2025-07-14T12:00:00+00:00"
  },
  {
    name: "Daisy Hsu",
    email: "daisy@example.com",
    phone: "0900-777-888",
    password: "hashed_pw4",
    role: "TEACHER",
    id: 4,
    created_at: "2025-07-14T12:00:00+00:00"
  },
  {
    name: "Olivia Kao",
    email: "olivia@example.com",
    phone: "0900-999-000",
    password: "hashed_pw5",
    role: "OPS",
    id: 5,
    created_at: "2025-07-14T12:00:00+00:00"
  },
  {
    name: "Admin User",
    email: "admin@example.com",
    phone: "0900-888-999",
    password: "password",
    role: "ADMIN",
    id: 6,
    created_at: "2025-07-14T12:00:00+00:00"
  },
  {
    name: "Frank Liu",
    email: "frank@taiwantech.com",
    phone: "0900-777-333",
    password: "password",
    role: "CORPORATE_CONTACT",
    id: 7,
    created_at: "2025-07-14T12:00:00+00:00"
  }
];

export default users;