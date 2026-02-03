'use client';

import React, { use } from 'react';
import Link from 'next/link';

import PageHeader from '@/shared/components/PageHeader';
import FormInput from '@/shared/components/FormInput';
import FormSelect from '@/shared/components/FormSelect';
import FormDate from '@/shared/components/FormDate';

const MOCK_USER_DATA = {
  name: 'Nguyen Van A',
  email: 'a.nguyen@email.com',
  phone: '0123456789',
  dob: '1999-12-12',
  username: 'nguyenvan_a',
  role: 'student',
  class: 'n3-morning',
  course: 'n3',
  status: 'active'
};

export default function UpdateUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  // mock data
  const roleOptions = [
    { label: 'Giáo viên', value: 'teacher' },
    { label: 'Học viên', value: 'student' },
    { label: 'Quản lý', value: 'manager' },
  ];

  const classOptions = [
    { label: 'N3 - Morning', value: 'n3-morning' },
    { label: 'N2 - Evening', value: 'n2-evening' },
  ];

  const courseOptions = [
    { label: 'N3', value: 'n3' },
    { label: 'N2', value: 'n2' },
  ];

  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Blocked', value: 'blocked' },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      
      {/* --- 1. PAGE HEADER --- */}
      <PageHeader 
        breadcrumb={
          <>
             Quản lí người dùng <span className="mx-1">{'>'}</span> 
             <span className="text-gray-500">Thông tin người dùng</span> <span className="mx-1">{'>'}</span> 
             <span className="text-gray-900 font-medium">Cập nhật thông tin</span>
          </>
        }
        backUrl={`/users/${id}`}
        title="Cập nhật thông tin người dùng"
        description="Chỉnh sửa thông tin cơ bản, vai trò và lớp học của người dùng."
      />

      {/* --- 2. FORM AREA --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6 max-w-4xl mx-auto">
        <form className="space-y-8">
            
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6">Thông tin chi tiết</h3>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput 
                            label="Họ và Tên" 
                            defaultValue={MOCK_USER_DATA.name} 
                        />
                        <FormInput 
                            label="Địa chỉ Email" 
                            defaultValue={MOCK_USER_DATA.email} 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput 
                            label="Số điện thoại" 
                            defaultValue={MOCK_USER_DATA.phone} 
                        />
                        <FormDate 
                            label="Ngày sinh" 
                            defaultValue={MOCK_USER_DATA.dob} 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput 
                            label="Username" 
                            defaultValue={MOCK_USER_DATA.username}
                            className="bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <FormSelect 
                            label="Vai trò" 
                            options={roleOptions} 
                            defaultValue={MOCK_USER_DATA.role}
                        />
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />

            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6">Lớp, Khóa và Trạng thái tài khoản</h3>
                <div className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect 
                            label="Lớp" 
                            options={classOptions} 
                            defaultValue={MOCK_USER_DATA.class}
                        />
                        <FormSelect 
                            label="Khóa" 
                            options={courseOptions} 
                            defaultValue={MOCK_USER_DATA.course}
                        />
                    </div>
                    
                    <div>
                        <FormSelect 
                            label="Trạng thái tài khoản" 
                            options={statusOptions} 
                            defaultValue={MOCK_USER_DATA.status}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-8">
                
                <button type="button" className="px-4 py-2.5 rounded-lg border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors bg-white">
                    Xóa người dùng
                </button>

                <div className="flex gap-4">
                    <Link href={`/users/${id}`}>
                        <button type="button" className="px-6 py-2.5 rounded-lg text-gray-500 font-medium hover:text-gray-700 transition-colors">
                            Hủy
                        </button>
                    </Link>
                    <button type="button" className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#253A8C] text-white font-medium hover:bg-[#1e2e70] transition-colors shadow-sm">
                        <span>Lưu</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                    </button>
                </div>
            </div>

        </form>
      </div>

      {/* --- 3. RED ALERT BOX --- */}
      <div className="max-w-4xl mx-auto bg-red-50 rounded-xl p-6 border border-red-100">
        <h3 className="text-red-700 font-bold text-sm mb-1">Lưu ý</h3>
        <p className="text-red-600 text-sm">
            Khi đã xóa người dùng, bạn sẽ không thể thay đổi nữa.
        </p>
      </div>

    </div>
  );
}