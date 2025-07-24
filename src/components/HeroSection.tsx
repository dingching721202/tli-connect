'use client';

import Link from "next/link";
import { FiStar, FiArrowRight } from "react-icons/fi";
import SafeIcon from "@/components/common/SafeIcon";

const HeroSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">歡迎來到學習平台</h1>
          <p className="text-xl mb-8 opacity-90">
            探索我們的課程，選擇適合您的會員方案，開始您的學習旅程
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/membership"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              <SafeIcon icon={FiStar} className="mr-2" />
              查看會員方案
              <SafeIcon icon={FiArrowRight} className="ml-2" />
            </Link>
            <Link
              href="#booking"
              className="inline-flex items-center px-6 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold"
            >
              立即預約課程
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;