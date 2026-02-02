'use client';
import React, { use } from 'react';
import Link from 'next/link';
import PageHeader from '@/shared/components/PageHeader';
import InfoItem from '@/shared/components/InfoItem';

// Giả lập dữ liệu user (Sau này sẽ fetch từ API dựa vào params.id)
const MOCK_USER_DETAIL = {
  id: '1',
  name: 'Nguyen Van A',
  avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
  role: 'Học viên',
  status: 'Active',
  username: 'nguyenvan_a',
  email: 'a.nguyen@email.com',
  phone: '0123456789',
  createdDate: '20/01/2024',
  dob: '12/12/1999',
  // Dữ liệu lịch sử lớp học
  history: [
    { class: 'N3 - Morning', course: 'N3', status: 'Đang học' },
    { class: 'N4 - Morning', course: 'N4', status: 'Hoàn thành' },
  ]
};

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Trong thực tế: const user = useFetchUser(params.id);
  const { id } = use(params);
  const user = MOCK_USER_DETAIL;

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      
      {/* --- 1. PAGE HEADER --- */}
      <PageHeader 
        breadcrumb={
          <>
             Quản lí người dùng <span className="mx-1">{'>'}</span> <span className="text-gray-900 font-medium">Thông tin người dùng</span>
          </>
        }
        backUrl="/users/list"
        
        // Truyền nút hành động vào bên phải
        action={
          <div className="flex gap-3">
             {/* Nút Xóa tài khoản */}
             <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors border border-red-200">
                <span>Xóa tài khoản</span>
                <svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 3.02344C9 3.5625 8.85938 4.06641 8.57812 4.53516C8.32031 4.98047 7.95703 5.34375 7.48828 5.625C7.04297 5.88281 6.53906 6.01172 5.97656 6.01172C5.4375 6.01172 4.93359 5.88281 4.46484 5.625C4.01953 5.34375 3.65625 4.98047 3.375 4.53516C3.11719 4.06641 2.98828 3.5625 2.98828 3.02344C2.98828 2.46094 3.11719 1.95703 3.375 1.51172C3.65625 1.04297 4.01953 0.679687 4.46484 0.421875C4.93359 0.140625 5.4375 0 5.97656 0C6.53906 0 7.04297 0.140625 7.48828 0.421875C7.95703 0.679687 8.32031 1.04297 8.57812 1.51172C8.85938 1.95703 9 2.46094 9 3.02344ZM11.25 4.5H15.75V6.01172H11.25V4.5ZM0 10.5117C0 10.1133 0.140625 9.76172 0.421875 9.45703C0.703125 9.12891 1.06641 8.84766 1.51172 8.61328C1.98047 8.35547 2.48438 8.15625 3.02344 8.01562C3.5625 7.85156 4.08984 7.73438 4.60547 7.66406C5.12109 7.57031 5.57812 7.52344 5.97656 7.52344C6.375 7.52344 6.83203 7.57031 7.34766 7.66406C7.88672 7.73438 8.42578 7.85156 8.96484 8.01562C9.50391 8.15625 9.99609 8.35547 10.4414 8.61328C10.9102 8.84766 11.2852 9.12891 11.5664 9.45703C11.8477 9.76172 11.9883 10.1133 11.9883 10.5117V12.0234H0V10.5117Z" fill="#DC2626"/>
                </svg>
             </button>

             {/* Nút Cập nhật (Link sang trang sửa) */}
             <Link href={`/users/${id}/update`}> 
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#253A8C] text-white font-medium hover:bg-[#1e2e70] transition-colors shadow-sm">
                  <span>Cập nhật</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.2891 3.02344L11.918 4.39453L9.10547 1.58203L10.4766 0.210938C10.6172 0.0703125 10.793 0 11.0039 0C11.2148 0 11.3906 0.0703125 11.5312 0.210938L13.2891 1.96875C13.4297 2.10938 13.5 2.28516 13.5 2.49609C13.5 2.70703 13.4297 2.88281 13.2891 3.02344ZM0 10.6875L8.29688 2.39062L11.1094 5.20312L2.8125 13.5H0V10.6875Z" fill="white"/>
                </svg>
                </button>
             </Link>
          </div>
        }
      />

      {/* --- 2. MAIN CONTENT --- */}
      <div className="space-y-6">
        
        {/* KHỐI 1: HEADER INFO (Avatar + Tên) */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-center gap-6">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100">
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        user.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500'
                    }`}>
                        {user.status}
                    </span>
                </div>
                <p className="text-gray-500 font-medium">{user.role}</p>
            </div>
        </div>

        {/* KHỐI 2: THÔNG TIN CHI TIẾT */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-6">Thông tin người dùng</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8">
                {/* Dòng 1 */}
                <InfoItem 
                    label="Tên tài khoản" 
                    value={`@${user.username}`} 
                    icon={
                       <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.90625 9.07031C6.35156 9.51562 6.87891 9.73828 7.48828 9.73828C8.09766 9.73828 8.625 9.51562 9.07031 9.07031C9.51562 8.625 9.73828 8.09766 9.73828 7.48828C9.73828 6.87891 9.51562 6.35156 9.07031 5.90625C8.625 5.46094 8.09766 5.23828 7.48828 5.23828C6.87891 5.23828 6.35156 5.46094 5.90625 5.90625C5.46094 6.35156 5.23828 6.87891 5.23828 7.48828C5.23828 8.09766 5.46094 8.625 5.90625 9.07031ZM2.17969 2.21484C3.65625 0.738281 5.42578 0 7.48828 0C9.55078 0 11.3086 0.738281 12.7617 2.21484C14.2383 3.66797 14.9766 5.42578 14.9766 7.48828V8.57812C14.9766 9.32812 14.7188 9.96094 14.2031 10.4766C13.7109 10.9922 13.1016 11.25 12.375 11.25C11.4609 11.25 10.7227 10.875 10.1602 10.125C9.41016 10.875 8.51953 11.25 7.48828 11.25C6.45703 11.25 5.56641 10.8867 4.81641 10.1602C4.08984 9.41016 3.72656 8.51953 3.72656 7.48828C3.72656 6.45703 4.08984 5.57813 4.81641 4.85156C5.56641 4.10156 6.45703 3.72656 7.48828 3.72656C8.51953 3.72656 9.39844 4.10156 10.125 4.85156C10.875 5.57813 11.25 6.45703 11.25 7.48828V8.57812C11.25 8.88281 11.3555 9.15234 11.5664 9.38672C11.8008 9.62109 12.0703 9.73828 12.375 9.73828C12.6797 9.73828 12.9375 9.62109 13.1484 9.38672C13.3828 9.15234 13.5 8.88281 13.5 8.57812V7.48828C13.5 5.84766 12.9023 4.44141 11.707 3.26953C10.5352 2.07422 9.12891 1.47656 7.48828 1.47656C5.84766 1.47656 4.42969 2.07422 3.23438 3.26953C2.0625 4.44141 1.47656 5.84766 1.47656 7.48828C1.47656 9.12891 2.0625 10.5469 3.23438 11.7422C4.42969 12.9141 5.84766 13.5 7.48828 13.5H11.25V14.9766H7.48828C5.42578 14.9766 3.65625 14.25 2.17969 12.7969C0.726562 11.3203 0 9.55078 0 7.48828C0 5.42578 0.726562 3.66797 2.17969 2.21484Z" fill="#253A8C"/>
                    </svg>
                    }
                />
                <InfoItem 
                    label="Địa chỉ email" 
                    value={user.email} 
                    icon={
                        <svg width="15" height="13" viewBox="0 0 15 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.5 3.02344V1.51172L7.48828 5.27344L1.47656 1.51172V3.02344L7.48828 6.75L13.5 3.02344ZM13.5 0C13.8984 0 14.2383 0.152344 14.5195 0.457031C14.8242 0.761719 14.9766 1.11328 14.9766 1.51172V10.5117C14.9766 10.9102 14.8242 11.2617 14.5195 11.5664C14.2383 11.8711 13.8984 12.0234 13.5 12.0234H1.47656C1.07812 12.0234 0.726562 11.8711 0.421875 11.5664C0.140625 11.2617 0 10.9102 0 10.5117V1.51172C0 1.11328 0.140625 0.761719 0.421875 0.457031C0.726562 0.152344 1.07812 0 1.47656 0H13.5Z" fill="#253A8C"/>
                        </svg>
                    }
                />
                <InfoItem 
                    label="Số điện thoại" 
                    value={user.phone} 
                    icon={
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.70703 5.83594C3.83203 8.01562 5.48438 9.66797 7.66406 10.793L9.31641 9.14062C9.55078 8.90625 9.80859 8.84766 10.0898 8.96484C10.9336 9.24609 11.8242 9.38672 12.7617 9.38672C12.9727 9.38672 13.1484 9.45703 13.2891 9.59766C13.4297 9.73828 13.5 9.91406 13.5 10.125V12.7617C13.5 12.9727 13.4297 13.1484 13.2891 13.2891C13.1484 13.4297 12.9727 13.5 12.7617 13.5C9.24609 13.5 6.23438 12.2578 3.72656 9.77344C1.24219 7.26562 0 4.25391 0 0.738281C0 0.527344 0.0703125 0.351562 0.210938 0.210938C0.351562 0.0703125 0.527344 0 0.738281 0H3.375C3.58594 0 3.76172 0.0703125 3.90234 0.210938C4.04297 0.351562 4.11328 0.527344 4.11328 0.738281C4.11328 1.67578 4.25391 2.56641 4.53516 3.41016C4.62891 3.71484 4.57031 3.97266 4.35938 4.18359L2.70703 5.83594Z" fill="#253A8C"/>
                        </svg>
                    }
                />

                {/* Dòng 2 */}
                <InfoItem 
                    label="Ngày tạo" 
                    value={user.createdDate} 
                    icon={
                        <svg width="15" height="17" viewBox="0 0 15 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.5 15.0117V5.27344H1.47656V15.0117H13.5ZM13.5 1.51172C13.8984 1.51172 14.2383 1.66406 14.5195 1.96875C14.8242 2.27344 14.9766 2.625 14.9766 3.02344V15.0117C14.9766 15.4102 14.8242 15.7617 14.5195 16.0664C14.2383 16.3711 13.8984 16.5234 13.5 16.5234H1.47656C1.07812 16.5234 0.726562 16.3711 0.421875 16.0664C0.140625 15.7617 0 15.4102 0 15.0117V3.02344C0 2.625 0.140625 2.27344 0.421875 1.96875C0.726562 1.66406 1.07812 1.51172 1.47656 1.51172H2.25V0H3.72656V1.51172H11.25V0H12.7266V1.51172H13.5Z" fill="#253A8C"/>
                        </svg>
                    }
                />
                <InfoItem 
                    label="Ngày sinh" 
                    value={user.dob} 
                    icon={
                        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_413_296)">
                        <path d="M2.125 7.08329H14.875V4.24996C14.875 3.87424 14.7257 3.5139 14.4601 3.24822C14.1944 2.98255 13.8341 2.83329 13.4583 2.83329H3.54167C3.16594 2.83329 2.80561 2.98255 2.53993 3.24822C2.27426 3.5139 2.125 3.87424 2.125 4.24996V14.1666C2.125 14.5424 2.27426 14.9027 2.53993 15.1684C2.80561 15.434 3.16594 15.5833 3.54167 15.5833H8.5M5.66667 1.41663V4.24996M11.3333 1.41663V4.24996M15.0804 10.4125C14.8391 10.1723 14.5319 10.0091 14.1978 9.94353C13.8636 9.87797 13.5176 9.91297 13.2033 10.0441C12.9908 10.1291 12.7996 10.2566 12.6367 10.4195L12.3958 10.6604L12.1479 10.4195C11.9073 10.1782 11.6005 10.0137 11.2664 9.94683C10.9322 9.87999 10.5857 9.91386 10.2708 10.0441C10.0583 10.1291 9.87417 10.2566 9.71125 10.4195C9.03833 11.0854 9.00292 12.2116 9.85292 13.0687L12.3958 15.5833L14.9458 13.0687C15.7958 12.2116 15.7533 11.0854 15.0804 10.4195V10.4125Z" stroke="#253A8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </g>
                        <defs>
                        <clipPath id="clip0_413_296">
                        <rect width="17" height="17" fill="white"/>
                        </clipPath>
                        </defs>
                        </svg>
                    }
                />
            </div>
        </div>

        {/* KHỐI 3: LỊCH SỬ LỚP HỌC */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
             <h3 className="font-bold text-gray-900 mb-4">Lịch sử lớp học và khóa học</h3>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase font-semibold">
                            <th className="py-3 pr-4">Lớp</th>
                            <th className="py-3 px-4">Khóa</th>
                            <th className="py-3 pl-4">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {user.history.map((item, index) => (
                            <tr key={index}>
                                <td className="py-3 pr-4 font-medium text-gray-900">{item.class}</td>
                                <td className="py-3 px-4 font-medium text-gray-900">{item.course}</td>
                                <td className="py-3 pl-4">
                                    <span className={`text-sm font-medium ${
                                        item.status === 'Đang học' ? 'text-gray-900' : 'text-gray-500'
                                    }`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>

      </div>
    </div>
  );
}