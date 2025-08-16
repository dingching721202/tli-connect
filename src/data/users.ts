export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  roles: ('STUDENT' | 'TEACHER' | 'STAFF' | 'CORPORATE_CONTACT' | 'ADMIN' | 'AGENT')[];
  membership_status: 'non_member' | 'inactive' | 'activated' | 'expired' | 'cancelled' | 'test';
  account_status: 'ACTIVE' | 'CANCELLED';
  campus: '羅斯福校' | '士林校' | '台中校' | '高雄校' | '總部';
  created_at: string;
  updated_at?: string;
  corp_id?: string;
}

export const users: User[] = [
  {
    name: "Alice Wang",
    email: "alice@example.com",
    phone: "0900-111-222",
    password: "hashed_pw1",
    roles: ["STUDENT"],
    membership_status: "activated",
    account_status: "ACTIVE",
    campus: "羅斯福校",
    id: 1,
    created_at: "2025-07-14T12:00:00+00:00"
  },
  {
    name: "Bob Chen",
    email: "user2@example.com",
    phone: "0900-333-444",
    password: "hashed_pw2",
    roles: ["STUDENT"],
    membership_status: "activated",
    account_status: "ACTIVE",
    campus: "士林校",
    id: 2,
    created_at: "2025-07-14T12:00:00+00:00"
  },
  {
    name: "Charlie Lin",
    email: "charlie@example.com",
    phone: "0900-555-666",
    password: "hashed_pw3",
    roles: ["STUDENT"],
    membership_status: "activated",
    account_status: "ACTIVE",
    campus: "台中校",
    id: 3,
    created_at: "2025-07-14T12:00:00+00:00"
  },
  {
    name: "王老師",
    email: "teacher@example.com",
    phone: "0900-777-888",
    password: "password",
    roles: ["TEACHER"],
    membership_status: "non_member",
    account_status: "ACTIVE",
    campus: "羅斯福校",
    id: 4,
    created_at: "2025-07-14T12:00:00+00:00"
  },
  {
    name: "Olivia Kao",
    email: "staff@example.com",
    phone: "0900-999-000",
    password: "hashed_pw5",
    roles: ["STAFF"],
    membership_status: "non_member",
    account_status: "ACTIVE",
    campus: "總部",
    id: 5,
    created_at: "2025-07-14T12:00:00+00:00"
  },
  {
    name: "Admin User",
    email: "admin@example.com",
    phone: "0900-888-999",
    password: "password",
    roles: ["ADMIN", "STUDENT"],
    membership_status: "non_member",
    account_status: "ACTIVE",
    campus: "總部",
    id: 6,
    created_at: "2025-07-14T12:00:00+00:00"
  },
  {
    name: "Frank Liu",
    email: "corporate_contact@example.com",
    phone: "0900-777-333",
    password: "password",
    roles: ["CORPORATE_CONTACT"],
    membership_status: "non_member",
    account_status: "ACTIVE",
    campus: "羅斯福校",
    id: 7,
    created_at: "2025-07-14T12:00:00+00:00",
    corp_id: "1"
  },
  {
    name: "David Wilson",
    email: "david@example.com",
    phone: "0900-123-456",
    password: "password",
    roles: ["STUDENT"],
    membership_status: "non_member",
    account_status: "ACTIVE",
    campus: "高雄校",
    id: 8,
    created_at: "2025-07-14T12:00:00+00:00"
  },
  {
    name: "張代理",
    email: "agent@example.com",
    phone: "0912-345-678",
    password: "password",
    roles: ["AGENT", "TEACHER"],
    membership_status: "non_member",
    account_status: "ACTIVE",
    campus: "總部",
    id: 9,
    created_at: "2024-01-15T00:00:00+00:00"
  },
  {
    name: "王顧問",
    email: "consultant@example.com",
    phone: "0923-456-789",
    password: "password",
    roles: ["AGENT"],
    membership_status: "non_member",
    account_status: "ACTIVE",
    campus: "士林校",
    id: 10,
    created_at: "2024-02-01T00:00:00+00:00"
  },
  {
    name: "創新科技有限公司",
    email: "contact@innovation.com",
    phone: "02-1234-5678",
    password: "password",
    roles: ["AGENT"],
    membership_status: "non_member",
    account_status: "ACTIVE",
    campus: "台中校",
    id: 11,
    created_at: "2024-03-10T00:00:00+00:00"
  },
  {
    name: "陳老師",
    email: "teacher.agent@example.com",
    phone: "0934-567-890",
    password: "password",
    roles: ["AGENT"],
    membership_status: "non_member",
    account_status: "ACTIVE",
    campus: "高雄校",
    id: 12,
    created_at: "2024-03-01T00:00:00+00:00"
  },
  {
    name: "林同學",
    email: "student.agent@example.com",
    phone: "0945-678-901",
    password: "password",
    roles: ["AGENT", "STUDENT"],
    membership_status: "activated",
    account_status: "ACTIVE",
    campus: "羅斯福校",
    id: 13,
    created_at: "2024-06-01T00:00:00+00:00"
  }
];

export default users;