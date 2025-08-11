'use client';

import { useState } from 'react';

export default function DebugClearPage() {
  const [message, setMessage] = useState('');

  const clearStorageAndRefresh = () => {
    // 清除所有localStorage數據
    localStorage.removeItem('userMemberCards');
    localStorage.removeItem('companies');
    localStorage.removeItem('corporateSubscriptions');
    localStorage.removeItem('corporateMembers');
    localStorage.removeItem('userId');
    localStorage.removeItem('jwt');
    localStorage.removeItem('currentRole');
    localStorage.removeItem('users');
    localStorage.removeItem('userRoles');
    localStorage.removeItem('classAppointments');
    
    setMessage('localStorage 已完全清除，所有數據將重新載入');
    
    // 重新載入資料
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };


  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Clear Page</h1>
      
      <div className="space-y-4">
        <button 
          onClick={clearStorageAndRefresh}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          清除 localStorage 並重新載入
        </button>
      </div>
      
      {message && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <pre className="whitespace-pre-wrap">{message}</pre>
        </div>
      )}
    </div>
  );
}