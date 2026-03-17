'use client';

import React from 'react';
import FilterDropdown from '@/shared/components/FilterDropdown';
import { AssignmentType, AssignmentStatus } from '../types/assignment';

interface AssignmentFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
}

export default function AssignmentFilters({
  searchTerm, setSearchTerm,
  typeFilter, setTypeFilter,
  statusFilter, setStatusFilter
}: AssignmentFiltersProps) {

  const typeOptions = [
    { label: 'Loại: Tất cả', value: 'Tất cả' },
    { label: 'Quiz', value: 'QUIZ' },
    { label: 'Viết', value: 'WRITING' },
    { label: 'Dịch', value: 'TRANSLATION' }
  ];

  const statusOptions = [
    { label: 'Trạng thái: Tất cả', value: 'Tất cả' },
    { label: 'Đang mở', value: 'PUBLISHED' },
    { label: 'Bản nháp', value: 'DRAFT' },
    { label: 'Đã đóng', value: 'CLOSED' }
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-end">
      
      <div className="flex-1 w-full">
        <label className="block text-xs font-bold text-gray-700 mb-2">Tìm kiếm</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm bài tập theo tên"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A8C] text-sm text-gray-900 placeholder-gray-400 font-medium"
          />
        </div>
      </div>

      <div className="w-full md:w-48">
        <FilterDropdown
          label="Loại"
          options={typeOptions}
          value={typeFilter}
          onChange={setTypeFilter}
        />
      </div>

      <div className="w-full md:w-48">
        <FilterDropdown
          label="Trạng thái"
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

    </div>
  );
}
