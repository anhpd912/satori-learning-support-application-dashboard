'use client';

import React from 'react';
import Link from 'next/link';

// Import 2 cái này thôi, vì sẽ dùng nhiều nơi
import FormInput from '@/shared/components/FormInput';
import FormSelect from '@/shared/components/FormSelect';
import FormDate from '@/shared/components/FormDate';
import PageHeader from '@/shared/components/PageHeader';

export default function CreateUserPage() {
  
  const roleOptions = [
    { label: 'Giáo viên', value: 'teacher' },
    { label: 'Học viên', value: 'student' },
    { label: 'Quản lý', value: 'manager' },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      
      {/* --- 1. HEADER (Giữ nguyên) --- */}
      <PageHeader 
        // 1. Breadcrumb tùy chỉnh
        breadcrumb={
          <>
             Quản lí người dùng <span className="mx-1">{'>'}</span> <span className="text-gray-900 font-medium">Tạo người dùng mới</span>
          </>
        }
        // 2. Link quay lại
        backUrl="/users/list"
        
        // 3. Nội dung bên phải
        title="Tạo người dùng mới"
        description="Tạo người dùng mới cho ứng dụng"
      />

      {/* --- 2. FORM AREA --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6 max-w-4xl mx-auto">
        <form className="space-y-6">
            
            <FormInput 
                label="Họ và Tên" 
                placeholder="Nhập họ và tên của người dùng" 
            />

            <FormInput 
                label="Địa chỉ email" 
                type="email"
                placeholder="Ví dụ: name@company.com" 
            />

            <FormInput 
                label="Số điện thoại" 
                type="tel"
                placeholder="0123456789" 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormSelect 
                    label="Vai trò"
                    placeholder="Chọn vai trò người dùng"
                    options={roleOptions}
                />

                <FormDate 
                    label="Ngày sinh" 
                    // Không cần placeholder vì type="date" sẽ tự hiển thị dd/mm/yyyy theo trình duyệt
                />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 mt-8">
                <Link href="/users/list">
                    <button type="button" className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                        Hủy
                    </button>
                </Link>
                <button type="button" className="px-6 py-2.5 rounded-lg bg-[#253A8C] text-white font-medium hover:bg-[#1e2e70] transition-colors shadow-sm">
                    Tạo mới
                </button>
            </div>

        </form>
      </div>

      {/* --- 3. BLUE NOTE BOX (Viết thẳng vào đây) --- */}
      <div className="max-w-4xl mx-auto bg-blue-50 rounded-xl p-6 flex items-start gap-4 border border-blue-100">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 font-bold">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
        </div>
        <div>
            <h3 className="text-blue-900 font-bold text-sm">Lưu ý thiết lập</h3>
            <p className="text-blue-700 text-sm mt-1 leading-relaxed">
                Sau khi tài khoản được tạo, hệ thống sẽ tự động gửi email mời người dùng thiết lập mật khẩu và hoàn tất thông tin cá nhân.
            </p>
        </div>
      </div>

    </div>
  );
}