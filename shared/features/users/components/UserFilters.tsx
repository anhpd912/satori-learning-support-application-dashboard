'use client'; 

import React, { useMemo } from 'react';
import FilterDropdown from '@/shared/components/FilterDropdown';

interface UserFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  error?: string;
  currentRole?: 'ADMIN' | 'MANAGER';
}

export default function UserFilters({
  searchTerm, setSearchTerm,
  roleFilter, setRoleFilter,
  statusFilter, setStatusFilter,
  error,
  currentRole = 'MANAGER'
}: UserFiltersProps) {

  const roleOptions = useMemo(() => {
    const options = ['Tất cả', 'LEARNER', 'TEACHER'];

    if (currentRole === 'ADMIN') {
        options.push('MANAGER', 'ADMIN');
    }

    return options;
  }, [currentRole]);

  const statusOptions = useMemo(() => {
    const options = ['Tất cả', 'ACTIVE', 'INACTIVE', 'SUSPENDED'];

    if (currentRole === 'ADMIN') {
        options.push('DELETED');
    }
    
    return options;
  }, [currentRole]);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        
        {/* Search */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">Tìm kiếm</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Tìm kiếm người dùng theo tên" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 placeholder-gray-500 ${
                error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'
              }`}            />
            <span className="absolute left-3 top-2.5 text-gray-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </div>
          {error && (
            <p className="text-red-500 text-xs mt-1 ml-1">
              {error}
            </p>
          )}
        </div>
        
        {/* Dropdowns */}
        <div className="flex gap-4">
          <FilterDropdown 
            label="Vai trò"
            options={roleOptions}
            value={roleFilter}
            onChange={setRoleFilter}
          />

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