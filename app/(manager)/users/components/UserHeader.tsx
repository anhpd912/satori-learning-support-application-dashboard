'use client'; 
import Link from 'next/link';

import React from 'react';

export default function UserHeader() {
  return (
    <div className="flex justify-between items-center border-b border-gray-200 pb-6 mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Danh sách người dùng</h1>
      <Link href="/users/create">
        <button className="bg-[#253A8C] hover:bg-[#1e2e70] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition shadow-sm">
            <svg width="19" height="14" viewBox="0 0 19 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.26562 9.29688C8.80208 8.67188 10.2734 8.35938 11.6797 8.35938C13.0859 8.35938 14.5443 8.67188 16.0547 9.29688C17.5911 9.89583 18.3594 10.6901 18.3594 11.6797V13.3594H5V11.6797C5 10.6901 5.75521 9.89583 7.26562 9.29688ZM4.17969 5H6.67969V6.67969H4.17969V9.17969H2.5V6.67969H0V5H2.5V2.5H4.17969V5ZM14.0234 5.70312C13.3724 6.35417 12.5911 6.67969 11.6797 6.67969C10.7682 6.67969 9.98698 6.35417 9.33594 5.70312C8.6849 5.05208 8.35938 4.27083 8.35938 3.35938C8.35938 2.44792 8.6849 1.66667 9.33594 1.01562C9.98698 0.338542 10.7682 0 11.6797 0C12.5911 0 13.3724 0.338542 14.0234 1.01562C14.6745 1.66667 15 2.44792 15 3.35938C15 4.27083 14.6745 5.05208 14.0234 5.70312Z" fill="white"/>
            </svg> Tạo người dùng mới
        </button>
      </Link>
    </div>
  );
}