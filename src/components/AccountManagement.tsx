'use client';

import React, { useState, useEffect } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import { useAuth } from '@/contexts/AuthContext';
import { users, User } from '@/data/users';
import { userRoles } from '@/data/user_roles';
import { authService, memberCardService } from '@/services/dataService';

type RoleType = 'STUDENT' | 'TEACHER' | 'OPS' | 'CORPORATE_CONTACT' | 'ADMIN' | 'AGENT';
type MembershipStatusType = 'NON_MEMBER' | 'MEMBER' | 'EXPIRED_MEMBER' | 'TEST_USER';
type CampusType = '羅斯福校' | '士林校' | '台中校' | '高雄校' | '總部';

const {
  FiUsers, FiUser, FiEdit2, FiTrash2, FiSearch, FiPlus,
  FiShield, FiCheck, FiX, FiToggleLeft, FiToggleRight
} = FiIcons;

interface ExtendedUser extends User {
  account_status: 'ACTIVE' | 'SUSPENDED';
}

const AccountManagement = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NON_MEMBER' | 'MEMBER' | 'EXPIRED_MEMBER' | 'TEST_USER'>('ALL');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STUDENT' | 'TEACHER' | 'OPS' | 'CORPORATE_CONTACT' | 'ADMIN' | 'AGENT'>('ALL');
  const [userTypeFilter, setUserTypeFilter] = useState<'ALL' | 'STUDENT' | 'STAFF'>('STUDENT'); // 新增：用戶類型篩選
  const [selectedRoles, setSelectedRoles] = useState<('STUDENT' | 'TEACHER' | 'OPS' | 'CORPORATE_CONTACT' | 'ADMIN' | 'AGENT')[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    roles: ['STUDENT'] as RoleType[],
    membership_status: 'NON_MEMBER' as MembershipStatusType,
    account_status: 'ACTIVE' as const,
    campus: '羅斯福校' as CampusType
  });

  // 載入用戶資料和角色
  const [usersWithRoles, setUsersWithRoles] = useState<ExtendedUser[]>([]);

  useEffect(() => {
    const loadUsersWithRoles = async () => {
      try {
        // 檢查並更新過期的會員卡
        await memberCardService.checkAndUpdateExpiredMemberships();
        
        // 初始化 localStorage 中的 userRoles（如果不存在）
        if (!localStorage.getItem('userRoles')) {
          localStorage.setItem('userRoles', JSON.stringify(userRoles));
        }
        
        const response = await authService.getAllUsersWithRoles();
        if (response.success && response.data) {
          setUsersWithRoles(response.data);
        } else {
          // 如果 API 失敗，使用本地資料作為備選
          const enhanced = users.map(user => {
            const activeRoles = userRoles
              .filter(ur => ur.user_id === user.id && ur.is_active)
              .map(ur => ur.role);
            
            return {
              ...user,
              roles: activeRoles,
              account_status: 'ACTIVE' as const // 預設為 ACTIVE
            };
          });
          setUsersWithRoles(enhanced);
        }
      } catch (error) {
        console.error('載入用戶資料失敗:', error);
        // 使用本地資料作為備選
        const enhanced = users.map(user => {
          const activeRoles = userRoles
            .filter(ur => ur.user_id === user.id && ur.is_active)
            .map(ur => ur.role);
          
          return {
            ...user,
            roles: activeRoles,
            account_status: 'ACTIVE' as const // 預設為 ACTIVE
          };
        });
        setUsersWithRoles(enhanced);
      }
    };

    loadUsersWithRoles();
  }, []);

  // 過濾用戶 - 根據用戶類型篩選
  const filteredUsers = usersWithRoles.filter(user => {
    // 根據用戶類型進行篩選
    const isStudent = user.roles.includes('STUDENT');
    const staffRoles = ['TEACHER', 'OPS', 'ADMIN', 'AGENT', 'CORPORATE_CONTACT'];
    const isStaff = user.roles.some(role => staffRoles.includes(role));
    
    let matchesUserType = true;
    if (userTypeFilter === 'STUDENT') {
      matchesUserType = isStudent;
    } else if (userTypeFilter === 'STAFF') {
      matchesUserType = isStaff;
    }
    // userTypeFilter === 'ALL' 時，matchesUserType 保持 true
    
    if (!matchesUserType) return false;
    
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' ||
                         user.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                         user.email.toLowerCase().includes(lowerCaseSearchTerm);
    
    const matchesRole = roleFilter === 'ALL' || user.roles.includes(roleFilter as 'STUDENT' | 'TEACHER' | 'OPS' | 'CORPORATE_CONTACT' | 'ADMIN' | 'AGENT');
    const matchesStatus = statusFilter === 'ALL' || user.membership_status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // 可分配的角色
  const availableRoles: ('STUDENT' | 'TEACHER' | 'CORPORATE_CONTACT' | 'AGENT' | 'OPS' | 'ADMIN')[] = ['STUDENT', 'TEACHER', 'CORPORATE_CONTACT', 'AGENT', 'OPS', 'ADMIN'];
  const availableStatuses = ['NON_MEMBER', 'MEMBER', 'EXPIRED_MEMBER', 'TEST_USER'];
  const availableCampuses = ['羅斯福校', '士林校', '台中校', '高雄校', '總部'];



  // 創建新用戶
  const handleCreateUser = async () => {
    if (!currentUser) return;
    
    try {
      const response = await authService.createUser(newUser, currentUser.id);
      
      if (response.success) {
        // 重新載入用戶列表
        const usersResponse = await authService.getAllUsersWithRoles();
        if (usersResponse.success && usersResponse.data) {
          setUsersWithRoles(usersResponse.data);
        }
        
        // 重置表單
        setNewUser({
          name: '',
          email: '',
          phone: '',
          password: '',
          roles: ['STUDENT'],
          membership_status: 'NON_MEMBER',
          account_status: 'ACTIVE',
          campus: '羅斯福校'
        });
        setShowCreateModal(false);
        alert('用戶創建成功！');
      } else {
        alert('創建失敗：' + response.error);
      }
    } catch (error) {
      console.error('創建用戶失敗:', error);
      alert('創建失敗，請稍後再試');
    }
  };

  // 編輯用戶基本資訊
  const handleEditUser = async () => {
    if (!selectedUser || !currentUser) return;
    
    try {
      // 先更新用戶基本資訊
      const userResponse = await authService.updateUser(selectedUser, currentUser.id);
      
      if (userResponse.success) {
        // 更新用戶角色
        const roleResponse = await authService.updateUserRoles(
          selectedUser.id, 
          selectedRoles, 
          currentUser.id
        );
        
        if (roleResponse.success) {
          // 自動更新會員狀態
          await authService.autoUpdateMembershipStatus(selectedUser.id);
          
          // 更新本地狀態
          const now = new Date().toISOString();
          setUsersWithRoles(prev => 
            prev.map(user => 
              user.id === selectedUser.id 
                ? { ...selectedUser, roles: [...selectedRoles], updated_at: now }
                : user
            )
          );
          
          setShowEditModal(false);
          setSelectedUser(null);
          setSelectedRoles([]);
          alert('用戶資訊和角色更新成功！');
        } else {
          alert('角色更新失敗：' + roleResponse.error);
        }
      } else {
        alert('用戶資訊更新失敗：' + userResponse.error);
      }
    } catch (error) {
      console.error('更新用戶失敗:', error);
      alert('更新失敗，請稍後再試');
    }
  };

  // 刪除用戶
  const handleDeleteUser = async () => {
    if (!selectedUser || !currentUser) return;
    
    try {
      const response = await authService.deleteUser(selectedUser.id, currentUser.id);
      
      if (response.success) {
        // 從列表中移除用戶
        setUsersWithRoles(prev => prev.filter(user => user.id !== selectedUser.id));
        
        setShowDeleteModal(false);
        setSelectedUser(null);
        alert('用戶刪除成功！');
      } else {
        alert('刪除失敗：' + response.error);
      }
    } catch (error) {
      console.error('刪除用戶失敗:', error);
      alert('刪除失敗，請稍後再試');
    }
  };

  const handleToggleAccountStatus = async (user: ExtendedUser) => {
    if (!currentUser) return;

    const newStatus = user.account_status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const response = await authService.updateUserAccountStatus(user.id, newStatus, currentUser.id);
      if (response.success && response.data) {
        setUsersWithRoles(prev =>
          prev.map(u => (u.id === user.id ? { ...u, account_status: newStatus, updated_at: new Date().toISOString() } : u))
        );
        alert(`帳號已${newStatus === 'ACTIVE' ? '啟用' : '停用'}`);
      } else {
        alert('更新失敗：' + response.error);
      }
    } catch (error) {
      console.error('更新帳號狀態失敗:', error);
      alert('更新失敗，請稍後再試');
    }
  };

  const handleOpenEditModal = (user: ExtendedUser) => {
    setSelectedUser({ ...user });
    setSelectedRoles([...user.roles]);
    setShowEditModal(true);
  };

  const handleOpenDeleteModal = (user: ExtendedUser) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'ADMIN': 'bg-red-100 text-red-800',
      'OPS': 'bg-purple-100 text-purple-800',
      'TEACHER': 'bg-blue-100 text-blue-800',
      'CORPORATE_CONTACT': 'bg-green-100 text-green-800',
      'AGENT': 'bg-yellow-100 text-yellow-800',
      'STUDENT': 'bg-gray-100 text-gray-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'NON_MEMBER': 'bg-gray-100 text-gray-800',
      'MEMBER': 'bg-green-100 text-green-800',
      'EXPIRED_MEMBER': 'bg-red-100 text-red-800',
      'TEST_USER': 'bg-blue-100 text-blue-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <SafeIcon icon={FiShield} className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">無權限存取</h3>
          <p className="text-gray-500">您需要管理員權限才能存取此功能</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <SafeIcon icon={FiUsers} className="h-8 w-8" />
              帳號管理
            </h1>
            <p className="text-gray-600 mt-1">管理用戶角色和權限</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <SafeIcon icon={FiPlus} className="h-4 w-4" />
            新增用戶
          </button>
        </div>

        {/* 搜尋和篩選 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜尋用戶名稱或信箱..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setRoleFilter('ALL');
                setStatusFilter('ALL');
              }}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'ALL' | 'NON_MEMBER' | 'MEMBER' | 'EXPIRED_MEMBER' | 'TEST_USER');
              setRoleFilter('ALL');
            }}
          >
            <option value="ALL">所有狀態</option>
            <option value="NON_MEMBER">非會員</option>
            <option value="MEMBER">會員</option>
            <option value="EXPIRED_MEMBER">會員過期</option>
            <option value="TEST_USER">測試人員</option>
          </select>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {/* 總用戶數 */}
          <div className="bg-white p-4 rounded-lg border cursor-pointer hover:bg-gray-50" onClick={() => { setUserTypeFilter('ALL'); setRoleFilter('ALL'); setStatusFilter('ALL'); setSearchTerm(''); }}>
            <div className="flex items-center">
              <SafeIcon icon={FiUsers} className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">用戶</p>
                <p className="text-2xl font-semibold text-gray-900">{usersWithRoles.length}</p>
              </div>
            </div>
          </div>
          {/* 後台人員數 */}
          <div className="bg-white p-4 rounded-lg border cursor-pointer hover:bg-gray-50" onClick={() => { setUserTypeFilter('STAFF'); setRoleFilter('ALL'); setStatusFilter('ALL'); setSearchTerm(''); }}>
            <div className="flex items-center">
              <SafeIcon icon={FiShield} className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">後台人員</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {usersWithRoles.filter(u => {
                    const staffRoles = ['TEACHER', 'OPS', 'ADMIN', 'AGENT', 'CORPORATE_CONTACT'];
                    return u.roles.some(role => staffRoles.includes(role));
                  }).length}
                </p>
              </div>
            </div>
          </div>
          {/* 總學生數 */}
          <div className="bg-white p-4 rounded-lg border cursor-pointer hover:bg-gray-50" onClick={() => { setUserTypeFilter('STUDENT'); setRoleFilter('ALL'); setStatusFilter('ALL'); setSearchTerm(''); }}>
            <div className="flex items-center">
              <SafeIcon icon={FiUsers} className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">學生</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {usersWithRoles.filter(u => u.roles.includes('STUDENT')).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border cursor-pointer hover:bg-gray-50" onClick={() => { setUserTypeFilter('STUDENT'); setStatusFilter('MEMBER'); setRoleFilter('ALL'); setSearchTerm(''); }}>
            <div className="flex items-center">
              <SafeIcon icon={FiUser} className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">會員</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {usersWithRoles.filter(u => u.roles.includes('STUDENT') && u.membership_status === 'MEMBER').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border cursor-pointer hover:bg-gray-50" onClick={() => { setUserTypeFilter('STUDENT'); setStatusFilter('EXPIRED_MEMBER'); setRoleFilter('ALL'); setSearchTerm(''); }}>
            <div className="flex items-center">
              <SafeIcon icon={FiUser} className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">會員過期</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {usersWithRoles.filter(u => u.roles.includes('STUDENT') && u.membership_status === 'EXPIRED_MEMBER').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border cursor-pointer hover:bg-gray-50" onClick={() => { setUserTypeFilter('STUDENT'); setStatusFilter('NON_MEMBER'); setRoleFilter('ALL'); setSearchTerm(''); }}>
            <div className="flex items-center">
              <SafeIcon icon={FiUser} className="h-8 w-8 text-gray-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">非會員</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {usersWithRoles.filter(u => u.roles.includes('STUDENT') && u.membership_status === 'NON_MEMBER').length}
                </p>
              </div>
            </div>
          </div>
          {availableRoles.filter(role => role !== 'STUDENT').map(role => (
            <div key={role} className="bg-white p-4 rounded-lg border cursor-pointer hover:bg-gray-50" onClick={() => { setUserTypeFilter('ALL'); setRoleFilter(role); setStatusFilter('ALL'); setSearchTerm(''); }}>
              <div className="flex items-center">
                <SafeIcon icon={FiShield} className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">{role}</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {usersWithRoles.filter(u => u.roles.includes(role)).length}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {/* 測試人員卡片 */}
          <div className="bg-white p-4 rounded-lg border cursor-pointer hover:bg-gray-50" onClick={() => { setUserTypeFilter('ALL'); setRoleFilter('ALL'); setStatusFilter('TEST_USER'); setSearchTerm(''); }}>
            <div className="flex items-center">
              <SafeIcon icon={FiUser} className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">測試人員</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {usersWithRoles.filter(u => u.membership_status === 'TEST_USER').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 用戶列表 */}
        <div className="bg-white rounded-lg border">
          <div className="overflow-x-auto" style={{overflowY: 'scroll', maxHeight: '70vh'}}>
            <table className="min-w-full table-fixed divide-y divide-gray-200" style={{width: '1200px'}}>
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-48 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    用戶
                  </th>
                  <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    校區
                  </th>
                  <th className="w-56 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    角色
                  </th>
                  <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    會員狀態
                  </th>
                  <th className="w-20 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    帳號狀態
                  </th>
                  <th className="w-28 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    創建日期
                  </th>
                  <th className="w-28 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    更新日期
                  </th>
                  <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="w-48 px-4 py-4">
                      <div className="truncate">
                        <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                        <div className="text-sm text-gray-500 truncate">{user.email}</div>
                      </div>
                    </td>
                    <td className="w-24 px-4 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        {user.campus}
                      </span>
                    </td>
                    <td className="w-56 px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {/* 所有角色 */}
                        {user.roles.map((role, index) => (
                          <span key={role} className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${index === 0 ? `border-2 ${getRoleColor(role)} border-current` : getRoleColor(role)}`}>
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="w-32 px-4 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.membership_status)}`}>
                        {user.membership_status === 'NON_MEMBER' ? '非會員' : 
                         user.membership_status === 'MEMBER' ? '會員' :
                         user.membership_status === 'EXPIRED_MEMBER' ? '會員過期' :
                         user.membership_status === 'TEST_USER' ? '測試人員' : 
                         '未知'}
                      </span>
                    </td>
                    <td className="w-20 px-4 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.account_status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.account_status}
                      </span>
                    </td>
                    <td className="w-28 px-4 py-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('zh-TW')}
                    </td>
                    <td className="w-28 px-4 py-4 text-sm text-gray-500">
                      {user.updated_at ? new Date(user.updated_at).toLocaleDateString('zh-TW') : '-'}
                    </td>
                    <td className="w-32 px-4 py-4 text-left text-sm font-medium">
                      <div className="flex items-center justify-start gap-2">
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          title="編輯資訊及角色"
                        >
                          <SafeIcon icon={FiEdit2} className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleAccountStatus(user)}
                          className={`${user.account_status === 'ACTIVE' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'} flex items-center gap-1`}
                          title={user.account_status === 'ACTIVE' ? '停用帳號' : '啟用帳號'}
                        >
                          <SafeIcon icon={user.account_status === 'ACTIVE' ? FiToggleLeft : FiToggleRight} className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(user)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                          title="刪除用戶"
                        >
                          <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>


      {/* 創建用戶 Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  創建新用戶
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={FiX} className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="請輸入姓名"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">電子信箱</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="請輸入電子信箱"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">電話</label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="請輸入電話"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">密碼</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="請輸入密碼"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                  <div className="space-y-2">
                    {availableRoles.map((role) => (
                      <label key={role} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newUser.roles.includes(role as RoleType)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewUser({ ...newUser, roles: [...newUser.roles, role as RoleType] });
                            } else {
                              setNewUser({ ...newUser, roles: newUser.roles.filter(r => r !== role) });
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">會員狀態</label>
                  <select
                    value={newUser.membership_status}
                    onChange={(e) => setNewUser({ ...newUser, membership_status: e.target.value as MembershipStatusType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {availableStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status === 'NON_MEMBER' ? '非會員' : 
                         status === 'MEMBER' ? '會員' :
                         status === 'EXPIRED_MEMBER' ? '會員過期' :
                         status === 'TEST_USER' ? '測試人員' : 
                         '未知'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">校區</label>
                  <select
                    value={newUser.campus}
                    onChange={(e) => setNewUser({ ...newUser, campus: e.target.value as CampusType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {availableCampuses.map((campus) => (
                      <option key={campus} value={campus}>
                        {campus}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateUser}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <SafeIcon icon={FiCheck} className="h-4 w-4" />
                  創建用戶
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 編輯用戶 Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <SafeIcon icon={FiEdit2} className="h-6 w-6" />
                  編輯用戶資訊及角色
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={FiX} className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 基本資訊 */}
                <div className="space-y-4">
                  <div className="border-b pb-3 mb-4">
                    <h4 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                      <SafeIcon icon={FiUser} className="h-5 w-5" />
                      基本資訊
                    </h4>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">姓名</label>
                    <input
                      type="text"
                      value={selectedUser.name}
                      onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="請輸入姓名"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">電子信箱</label>
                    <input
                      type="email"
                      value={selectedUser.email}
                      onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="請輸入電子信箱"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">電話</label>
                    <input
                      type="tel"
                      value={selectedUser.phone}
                      onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="請輸入電話號碼"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">會員狀態</label>
                    <select
                      value={selectedUser.membership_status}
                      onChange={(e) => setSelectedUser({ ...selectedUser, membership_status: e.target.value as MembershipStatusType })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {availableStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status === 'NON_MEMBER' ? '非會員' : 
                           status === 'MEMBER' ? '會員' :
                           status === 'EXPIRED_MEMBER' ? '會員過期' :
                           status === 'TEST_USER' ? '測試人員' : 
                           '未知'}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">校區</label>
                    <select
                      value={selectedUser.campus}
                      onChange={(e) => setSelectedUser({ ...selectedUser, campus: e.target.value as CampusType })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {availableCampuses.map((campus) => (
                        <option key={campus} value={campus}>
                          {campus}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">創建日期</label>
                    <input
                      type="text"
                      value={new Date(selectedUser.created_at).toLocaleDateString('zh-TW')}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">更新日期</label>
                    <input
                      type="text"
                      value={selectedUser.updated_at ? new Date(selectedUser.updated_at).toLocaleDateString('zh-TW') : '尚未更新'}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* 角色管理 */}
                <div className="space-y-4">
                  <div className="border-b pb-3 mb-4">
                    <h4 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                      <SafeIcon icon={FiShield} className="h-5 w-5" />
                      角色管理
                    </h4>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">用戶角色</label>
                    <div className="space-y-2">
                      {availableRoles.map((role) => (
                        <label key={role} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedRoles.includes(role)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRoles([...selectedRoles, role]);
                              } else {
                                setSelectedRoles(selectedRoles.filter(r => r !== role));
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">{role}</span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedRoles.map((role, index) => (
                        <span key={role} className={`inline-flex px-3 py-2 text-sm font-semibold rounded-full ${index === 0 ? `border-2 ${getRoleColor(role)} border-current` : getRoleColor(role)}`}>
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8 pt-6 border-t">
                <button
                  onClick={handleEditUser}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium transition-colors"
                >
                  <SafeIcon icon={FiCheck} className="h-5 w-5" />
                  儲存所有變更
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                    setSelectedRoles([]);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 font-medium transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 刪除確認 Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  確認刪除
                </h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={FiX} className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center">
                    <SafeIcon icon={FiTrash2} className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-800 font-medium">警告</span>
                  </div>
                  <p className="text-red-700 mt-2">
                    您即將刪除用戶 <strong>{selectedUser.name}</strong> ({selectedUser.email})。
                  </p>
                  <p className="text-red-600 text-sm mt-1">
                    此操作無法復原，將同時刪除該用戶的所有角色記錄。
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteUser}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                  確認刪除
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManagement;