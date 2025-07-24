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

  useEffect(() => {
    // 模擬從 URL 參數或 API 獲取付款結果
    const checkPaymentResult = async () => {
      try {
        // 在實際應用中，這裡會檢查 URL 參數或呼叫 API 來確認付款狀態
        const status = searchParams.get('status');
        
        // 模擬 API 檢查延遲
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (status === 'successful' || Math.random() > 0.3) {
          setPaymentStatus('success');
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
    // router.push('/membership'); // TODO: 重新實作會員方案頁面
    console.log('會員方案頁面尚未實作');
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
                  恭喜您成功購買會員方案！您的會員卡已經生成，可以開始享受會員權益。
                </p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">✅ 付款處理完成</p>
                    <p className="font-medium mb-1">✅ 會員卡已生成</p>
                    <p className="font-medium">✅ 可以開始預約課程</p>
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