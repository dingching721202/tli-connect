'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '@/components/common/SafeIcon';
import Navigation from '@/components/Navigation';

const { FiCheckCircle, FiXCircle, FiLoader, FiArrowLeft } = FiIcons;

const PaymentResultContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [memberCardGenerated, setMemberCardGenerated] = useState(false);

  useEffect(() => {
    const checkPaymentResult = async () => {
      try {
        const status = searchParams.get('status');
        const orderId = searchParams.get('order_id');
        
        // 模擬檢查延遲
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (status === 'success' && orderId) {
          // 檢查訂單狀態
          const orderResponse = await fetch(`/api/orders/${orderId}`);
          
          if (orderResponse.ok) {
            const orderData = await orderResponse.json();
            const order = orderData.data;
            
            // 檢查訂單狀態
            if (order.status === 'COMPLETED') {
              // 付款完成，會員卡已在付款時自動創建（PURCHASED 狀態）
              setMemberCardGenerated(true);
              setPaymentStatus('success');
              console.log('✅ 付款成功，會員卡已創建為 PURCHASED 狀態，等待用戶啟用');
            } else {
              // 訂單狀態不是 COMPLETED
              console.error('訂單狀態無效:', order.status);
              setPaymentStatus('failed');
            }
          } else {
            console.error('無法獲取訂單資訊');
            setPaymentStatus('failed');
          }
        } else {
          setPaymentStatus('failed');
        }
      } catch (error) {
        console.error('檢查付款結果失敗:', error);
        setPaymentStatus('failed');
      }
    };

    checkPaymentResult();
  }, [searchParams]);

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleRetryPayment = () => {
    router.push('/membership');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="p-8">
            {paymentStatus === 'loading' && (
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="inline-block mb-4"
                >
                  <SafeIcon icon={FiLoader} className="text-4xl text-blue-600" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">處理付款結果中</h2>
                <p className="text-gray-600">請稍候，我們正在確認您的付款狀態...</p>
              </div>
            )}

            {paymentStatus === 'success' && (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="mb-4"
                >
                  <SafeIcon icon={FiCheckCircle} className="text-6xl text-green-500 mx-auto" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">付款成功！</h2>
                <p className="text-gray-600 mb-6">
                  恭喜您成功購買會員方案！
                  {memberCardGenerated 
                    ? '您的會員卡已經生成，請前往 Dashboard 啟用會員卡以開始使用。'
                    : '系統正在處理您的會員資格，請稍候片刻。'
                  }
                </p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">✅ 付款處理完成</p>
                    <p className={`font-medium mb-1 ${memberCardGenerated ? '' : 'text-yellow-600'}`}>
                      {memberCardGenerated ? '✅ 會員卡已生成 (PURCHASED 狀態)' : '⏳ 會員卡生成中...'}
                    </p>
                    <p className={`font-medium ${memberCardGenerated ? 'text-orange-600' : 'text-gray-500'}`}>
                      {memberCardGenerated ? '🔄 請前往 Dashboard 啟用會員卡' : '待會員卡生成後需要手動啟用'}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBackToDashboard}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  前往會員中心
                </motion.button>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="mb-4"
                >
                  <SafeIcon icon={FiXCircle} className="text-6xl text-red-500 mx-auto" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">付款失敗</h2>
                <p className="text-gray-600 mb-6">
                  很抱歉，您的付款未能成功處理。請檢查付款資訊或稍後再試。
                </p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="text-sm text-red-800">
                    <p className="font-medium mb-2">可能的原因：</p>
                    <ul className="list-disc list-inside space-y-1 text-left">
                      <li>付款資訊不正確</li>
                      <li>網路連線問題</li>
                      <li>銀行系統暫時無法處理</li>
                    </ul>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRetryPayment}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    重新付款
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBackToDashboard}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-400 transition-colors flex items-center justify-center"
                  >
                    <SafeIcon icon={FiArrowLeft} className="mr-2" />
                    返回首頁
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* 聯繫客服區域 */}
        {paymentStatus === 'failed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 bg-white rounded-lg p-6 shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-3">需要協助？</h3>
            <p className="text-gray-600 text-sm mb-4">
              如果您在付款過程中遇到問題，請聯繫我們的客服團隊，我們將竭誠為您服務。
            </p>
            <div className="text-sm text-gray-700">
              <p>📧 客服信箱：support@tliconnect.com</p>
              <p>📞 客服電話：02-1234-5678</p>
              <p>🕐 服務時間：週一至週五 09:00-18:00</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const PaymentResultPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-4"
          >
            <SafeIcon icon={FiLoader} className="text-4xl text-blue-600" />
          </motion.div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  );
};

export default PaymentResultPage;