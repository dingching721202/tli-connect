// 強制重置教師數據的 JavaScript 代碼
// 請在瀏覽器的開發者工具 Console 中執行

console.log('🔄 開始重置教師數據...');

// 清除現有的教師數據
localStorage.removeItem('teachers');

// 設定正確的測試教師數據
const testTeachers = [
  {
    id: 1,
    name: '王老師',
    email: 'teacher@example.com',
    phone: '0912-345-678',
    status: 'active',
    joinDate: '2024-01-15',
    lastLogin: '2024-12-20',
    teachingCategory: ['中文', '商業'],
    expertise: ['商務華語', '生活華語'],
    experience: '3-5年',
    qualification: ['TOCFL認證', '華語教學能力證書'],
    bio: '專精商務華語教學，擁有豐富的企業培訓經驗。',
    languages: ['中文(母語)', '英文(流利)'],
    teachingHours: 520,
    rating: 4.8,
    totalStudents: 156,
    completedCourses: 89,
    accountStatus: 'verified',
    salary: 60000,
    contractType: 'full-time',
    address: '台北市信義區信義路五段7號',
    emergencyContact: '王小明',
    emergencyPhone: '0987-654-321',
    role: 'TEACHER',
    avatar: 'https://www.gravatar.com/avatar/?d=mp&s=32',
    password: 'password'
  },
  {
    id: 2,
    name: '李老師',
    email: 'li@example.com',
    phone: '0923-456-789',
    status: 'active',
    joinDate: '2024-03-10',
    lastLogin: '2024-12-19',
    teachingCategory: ['中文'],
    expertise: ['日常會話', 'HSK準備'],
    experience: '3-5年',
    qualification: ['HSK考官證書'],
    bio: '專注於日常會話和HSK考試準備，教學方式活潑有趣。',
    languages: ['中文(母語)', '日文(中等)'],
    teachingHours: 320,
    rating: 4.6,
    totalStudents: 98,
    completedCourses: 67,
    accountStatus: 'verified',
    salary: 45000,
    contractType: 'part-time',
    address: '台北市大安區敦化南路二段216號',
    emergencyContact: '李美華',
    emergencyPhone: '0912-987-654',
    role: 'TEACHER',
    avatar: 'https://www.gravatar.com/avatar/?d=mp&s=32',
    password: 'password'
  },
  {
    id: 3,
    name: '張老師',
    email: 'zhang@example.com',
    phone: '0934-567-890',
    status: 'active',
    joinDate: '2023-09-01',
    lastLogin: '2024-11-15',
    teachingCategory: ['中文', '文化'],
    expertise: ['兒童華語', '青少年華語'],
    experience: '6-10年',
    qualification: ['兒童華語教學證書', 'TESOL認證'],
    bio: '專門教授兒童和青少年華語，深受學生喜愛。',
    languages: ['中文(母語)', '英文(流利)', '韓文(初級)'],
    teachingHours: 680,
    rating: 4.9,
    totalStudents: 203,
    completedCourses: 134,
    accountStatus: 'verified',
    salary: 55000,
    contractType: 'full-time',
    address: '新北市板橋區中山路一段161號',
    emergencyContact: '張大明',
    emergencyPhone: '0956-123-456',
    role: 'TEACHER',
    avatar: 'https://www.gravatar.com/avatar/?d=mp&s=32',
    password: 'password'
  }
];

// 保存到 localStorage
localStorage.setItem('teachers', JSON.stringify(testTeachers));

// 觸發更新事件
window.dispatchEvent(new CustomEvent('teachersUpdated'));

console.log('✅ 教師數據重置完成！');
console.log('📋 已添加的教師：');
testTeachers.forEach((teacher, index) => {
  console.log(`${index + 1}. ${teacher.name} (${teacher.email})`);
});

console.log('\n🔑 主要測試帳號：');
console.log('📧 teacher@example.com');
console.log('🔑 password');

console.log('\n請刷新教師管理頁面查看結果！');