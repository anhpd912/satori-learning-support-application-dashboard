'use client';

import React from 'react';
import FilterDropdown, { FilterOption } from '@/shared/components/FilterDropdown';

interface ClassFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  teacherFilter?: string;
  setTeacherFilter?: (value: string) => void;
  courseFilter?: string;
  setCourseFilter?: (value: string) => void;
  statusFilter?: string;
  setStatusFilter?: (value: string) => void;
  teachers?: FilterOption[];
  courses?: FilterOption[];
}

export default function ClassFilters({
  searchTerm, setSearchTerm,
  teacherFilter, setTeacherFilter,
  courseFilter, setCourseFilter,
  statusFilter, setStatusFilter,
  teachers = [],
  courses = []
}: ClassFiltersProps) {

  const courseOptions = [{ label: 'Tất cả', value: 'Tất cả' }, ...courses];
  const statusOptions = [
    { label: 'Tất cả', value: 'Tất cả' },
    { label: 'Hoạt động', value: 'Active' },
    { label: 'Không hoạt động', value: 'Inactive' }
  ];

  const teacherOptions = [{ label: 'Tất cả', value: 'Tất cả' }, ...teachers];

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row gap-4">

        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Tìm kiếm</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm lớp học theo tên"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A8C] text-sm text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {teacherFilter && setTeacherFilter && (
          <div className="w-full md:w-48">
            <FilterDropdown
              label="Giảng viên"
              options={teacherOptions}
              value={teacherFilter}
              onChange={setTeacherFilter}
            />
          </div>
        )}

        {courseFilter && setCourseFilter && (
          <div className="w-full md:w-40">
            <FilterDropdown
              label="Khóa"
              options={courseOptions}
              value={courseFilter}
              onChange={setCourseFilter}
            />
          </div>
        )}

        {statusFilter && setStatusFilter && (
          <div className="w-full md:w-40">
            <FilterDropdown
              label="Trạng thái"
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        )}

      </div>
    </div>
  );
}
