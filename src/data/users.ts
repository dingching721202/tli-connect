export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'STUDENT' | 'TEACHER' | 'OPS' | 'CORPORATE_CONTACT' | 'ADMIN' | 'AGENT';
  primary_role: 'STUDENT' | 'TEACHER' | 'OPS' | 'CORPORATE_CONTACT' | 'ADMIN' | 'AGENT';
  membership_status: 'NON_MEMBER' | 'MEMBER' | 'EXPIRED_MEMBER' | 'TEST_USER' | 'USER';
  account_status: 'ACTIVE' | 'SUSPENDED';
  created_at: string;
  updated_at?: string;
}

export const users: User[] = [
  {
    name: "Alice Wang",
    email: "alice@example.com",
    phone: "0900-111-222",
    password: "hashed_pw1",
    role: "STUDENT",
    primary_role: "STUDENT",
    membership_status: "MEMBER",
    account_status: "ACTIVE",
    id: 1,
    created_at: "2025-07-14T12:00:00+00:00"
  },
  {
    name: "Bob Chen",
    email: "user2@example.com", // 更新為測試用的 email
    phone: "0900-333-444",
    password: "hashed_pw2",
    role: "STUDENT",
    primary_role: "STUDENT",
    membership_status: "MEMBER",
    account_status: "ACTIVE",
    id: 2,
    created_at: "2025-07-14T12:00:00+00:00"
  },
  {
    name: "Charlie Lin",
    email: "charlie@example.com",
    phone: "0900-555-666",
    password: "hashed_pw3",
    role: "STUDENT",
    primary_role: "STUDENT",
    membership_status: "MEMBER",
    account_status: "ACTIVE",
    id: 3,
    created_at: "2025-07-14T12:00:00+00:00"
  },
  {
    name: "王老師",
    email: "teacher@example.com",
    phone: "0900-777-888",
    password: "password",
    role: "TEACHER",
    primary_role: "TEACHER",
    membership_status: "USER",
    account_status: "ACTIVE",
    id: 4,
    created_at: "2025-07-14T12:00:00+00:00"
  },
  {
    name: "Olivia Kao",
    email: "olivia@example.com",
    phone: "0900-999-000",
    password: "hashed_pw5",
    role: "OPS",
    primary_role: "OPS",
    membership_status: "USER",
    account_status: "ACTIVE",
    id: 5,
    created_at: "2025-07-14T12:00:00+00:00"
  },
  {
    name: "Admin User",
    email: "admin@example.com",
    phone: "0900-888-999",
    password: "password",
    role: "ADMIN",
    primary_role: "ADMIN",
    membership_status: "USER",
    account_status: "ACTIVE",
    id: 6,
    created_at: "2025-07-14T12:00:00+00:00"
  },
  {
    name: "Frank Liu",
    email: "frank@taiwantech.com",
    phone: "0900-777-333",
    password: "password",
    role: "CORPORATE_CONTACT",
    primary_role: "CORPORATE_CONTACT",
    membership_status: "USER",
    account_status: "ACTIVE",
    id: 7,
    created_at: "2025-07-14T12:00:00+00:00"
  },
  {
    name: "David Wilson",
    email: "david@example.com",
    phone: "0900-123-456",
    password: "password",
    role: "STUDENT",
    primary_role: "STUDENT",
    membership_status: "NON_MEMBER",
    account_status: "ACTIVE",
    id: 8,
    created_at: "2025-07-14T12:00:00+00:00"
  },
  // Agent users
  {
    name: "張代理",
    email: "agent1@example.com",
    phone: "0912-345-678",
    password: "password",
    role: "AGENT",
    primary_role: "AGENT",
    membership_status: "USER",
    account_status: "ACTIVE",
    id: 9,
    created_at: "2024-01-15T00:00:00+00:00"
  },
  {
    name: "王顧問",
    email: "consultant1@example.com",
    phone: "0923-456-789",
    password: "password",
    role: "AGENT",
    primary_role: "AGENT",
    membership_status: "USER",
    account_status: "ACTIVE",
    id: 10,
    created_at: "2024-02-01T00:00:00+00:00"
  },
  {
    name: "創新科技有限公司",
    email: "contact@innovation.com",
    phone: "02-1234-5678",
    password: "password",
    role: "AGENT",
    primary_role: "AGENT",
    membership_status: "USER",
    account_status: "ACTIVE",
    id: 11,
    created_at: "2024-03-10T00:00:00+00:00"
  },
  {
    name: "陳老師",
    email: "teacher.agent@example.com",
    phone: "0934-567-890",
    password: "password",
    role: "AGENT",
    primary_role: "AGENT",
    membership_status: "USER",
    account_status: "ACTIVE",
    id: 12,
    created_at: "2024-03-01T00:00:00+00:00"
  },
  {
    name: "林同學",
    email: "student.agent@example.com",
    phone: "0945-678-901",
    password: "password",
    role: "AGENT",
    primary_role: "AGENT",
    membership_status: "MEMBER",
    account_status: "ACTIVE",
    id: 13,
    created_at: "2024-06-01T00:00:00+00:00"
  }
];

export default users;