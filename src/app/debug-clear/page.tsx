'use client';

import { useEffect, useState } from 'react';
import { memberCardStore } from '@/lib/memberCardStore';

export default function DebugClearPage() {
  const [message, setMessage] = useState('');

  const clearStorageAndRefresh = () => {
    // 清除 localStorage 中的會員卡資料
    localStorage.removeItem('userMemberCards');
    setMessage('localStorage 已清除，會員卡資料將重新載入');
    
    // 重新載入資料
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const checkAliceData = async () => {
    try {
      const aliceMemberships = await memberCardStore.getMembershipsByUserId(1);
      setMessage(`Alice Wang (ID: 1) 的會員卡資料: ${JSON.stringify(aliceMemberships, null, 2)}`);
    } catch (error) {
      setMessage(`錯誤: ${error}`);
    }
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
        
        <button 
          onClick={checkAliceData}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-4"
        >
          檢查 Alice Wang 的會員卡資料
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