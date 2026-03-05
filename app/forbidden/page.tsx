'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg 
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-red-500"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Truy cập bị từ chối</h1>
        <p className="text-gray-500 font-medium text-lg mb-6">403 - Forbidden</p>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Xin lỗi, bạn không có quyền truy cập vào trang này.<br/>
        </p>

        <div className="flex flex-col gap-3">
            <button 
                onClick={() => router.back()}
                className="w-full py-2.5 px-4 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
                Quay lại trang trước
            </button>

            <Link 
                href="/dashboard"
                className="w-full py-2.5 px-4 bg-[#253A8C] text-white font-medium rounded-lg hover:bg-[#1e2e70] transition-colors block"
            >
                Về trang chủ Dashboard
            </Link>
        </div>

      </div>
      
      <div className="mt-8 text-gray-400 text-sm">
        &copy; 2026 JLSA Portal System
      </div>
    </div>
  );
}