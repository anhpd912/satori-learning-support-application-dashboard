'use client'; 

import React from 'react';
import FilterDropdown from '@/shared/components/FilterDropdown';

interface CourseFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  levelFilter: string;
  setLevelFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  error?: string;
}

export default function CourseFilters({
  searchTerm, setSearchTerm,
  levelFilter, setLevelFilter,
  statusFilter, setStatusFilter,
  error,
}: CourseFiltersProps) {

  const levelOptions = ['Tất cả', 'N1', 'N2', 'N3', 'N4', 'N5'];
  
  const statusOptions = ['Tất cả', 'ACTIVE', 'INACTIVE'];

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
      
      {/* Search Input */}
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
            placeholder="Tìm kiếm khóa học theo tên" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A8C] text-sm text-gray-900 placeholder-gray-500 transition-colors ${
              error ? 'border-red-500 focus:ring-red-200' : 'border-gray-200'
            }`}            
          />
        </div>
        {error && (
          <p className="text-red-500 text-xs mt-1 ml-1">
            {error}
          </p>
        )}
      </div>
      
      {/* Dropdowns */}
      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
        <div className="w-full md:w-48">
          <FilterDropdown 
            label="Level"
            options={levelOptions}
            value={levelFilter}
            onChange={setLevelFilter}
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

    </div>
  );
}