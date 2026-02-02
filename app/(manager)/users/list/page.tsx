'use client';

import React, { useState, useMemo } from 'react'; // Bỏ import useEffect
import { User } from '@/shared/types/user';
import UserHeader from '../components/UserHeader';
import UserFilters from '../components/UserFilters';
import UserTable from '../components/UserTable';
import Pagination from '@/shared/components/Pagination';

const ITEMS_PER_PAGE = 5;

// --- MOCK DATA ---
const MOCK_USERS: User[] = [
  { id: '1', name: 'Jane Cooper', email: 'jane.c@example.com', role: 'Teacher', status: 'Active', avatarUrl: '/avatars/jane.png' },
  { id: '2', name: 'Cody Fisher', email: 'cody.f@example.com', role: 'Learner', status: 'Active', avatarUrl: '/avatars/cody.png' },
  { id: '3', name: 'Esther Howard', email: 'esther.h@example.com', role: 'Learner', status: 'Active', avatarUrl: '/avatars/esther.png' },
  { id: '4', name: 'Jenny Wilson', email: 'jenny.w@example.com', role: 'Teacher', status: 'Inactive', avatarUrl: '/avatars/jenny.png' },
  { id: '5', name: 'Kristin Watson', email: 'kristin.w@example.com', role: 'Learner', status: 'Inactive', avatarUrl: '/avatars/kristin.png' },
  { id: '6', name: 'Cameron Williamson', email: 'cameron.w@example.com', role: 'Learner', status: 'Active', avatarUrl: '/avatars/cameron.png' },
  // ... thêm nhiều user nữa để test phân trang
];

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Tất cả');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [currentPage, setCurrentPage] = useState(1);

  // --- LOGIC LỌC DỮ LIỆU ---
  const filteredData = useMemo(() => {
    return MOCK_USERS.filter((user) => {
      const matchSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Lưu ý: Mock data của bạn Role là tiếng Anh (Teacher), nhưng Filter đang là tiếng Việt?
      // Nếu filter value là 'Giáo viên' thì logic so sánh user.role === 'Teacher' sẽ sai.
      // Tạm thời mình giả định bạn đã sửa mock data hoặc filter option cho khớp nhau nhé.
      const matchRole = roleFilter === 'Tất cả' || user.role === roleFilter;
      const matchStatus = statusFilter === 'Tất cả' || user.status === statusFilter;
      
      return matchSearch && matchRole && matchStatus;
    });
  }, [searchTerm, roleFilter, statusFilter]);

  // --- HANDLERS (Thay thế cho useEffect) ---
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); 
  };

  const handleRoleChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // --- PHÂN TRANG ---
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <UserHeader />
      
      <UserFilters 
        searchTerm={searchTerm} 
        setSearchTerm={handleSearchChange}
        
        roleFilter={roleFilter} 
        setRoleFilter={handleRoleChange}
        
        statusFilter={statusFilter} 
        setStatusFilter={handleStatusChange}
      />

      <UserTable data={paginatedData} />
      
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredData.length}
        itemsPerPage={ITEMS_PER_PAGE}
      />

      {filteredData.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          Không tìm thấy kết quả phù hợp.
        </div>
      )}
    </div>
  );
}