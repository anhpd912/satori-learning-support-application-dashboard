'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from '@/shared/types/user';
import UserHeader from './components/UserHeader';
import UserFilters from './components/UserFilters';
import Pagination from '@/shared/components/Pagination';
import { userService } from '../../../shared/services/user.service';
import CommonTable, { Column } from '@/shared/components/CommonTable';
import ConfirmModal from '@/shared/components/ConfirmModal';
import Toast, { ToastType } from '@/shared/components/Toast';

const ITEMS_PER_PAGE = 10;

interface UserListFeatureProps {
  role?: 'ADMIN' | 'MANAGER';
}

export default function UserManagementPage({ role = 'MANAGER' }: UserListFeatureProps) {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Tất cả');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');

  const [users, setUsers] = useState<User[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const basePath = role === 'ADMIN' ? '/admin/users' : '/users';


  const handleViewDetail = (userId: string) => {
      router.push(`${basePath}/${userId}`);
  };

  const onDeleteClick = (userId: string) => {
      setDeleteUserId(userId); 
  };

  const confirmDelete = async () => {
      if (!deleteUserId) return;
      
      setIsDeleting(true);
      try {
          await userService.deleteUser(deleteUserId);
          
          setToast({ message: 'Xóa người dùng thành công', type: 'success', isVisible: true });
          
          fetchData(); 
          setDeleteUserId(null); 

      } catch (err: any) {
          setToast({ message: err.message || 'Lỗi khi xóa', type: 'error', isVisible: true });
      } finally {
          setIsDeleting(false);
      }
  };

  const columns = useMemo<Column<User>[]>(() => [
    {
      header: 'Tên',
      render: (user) => (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                <img 
                    src={user.avatarUrl} 
                    alt={user.name} 
                    className="object-cover w-full h-full"
                    onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/40'} 
                />
            </div>
            <span className="font-medium text-gray-900">{user.name}</span>
        </div>
      )
    },
    {
      header: 'Email',
      accessor: 'email',
      className: 'text-gray-500 text-sm'
    },
    {
      header: 'Vai trò',
      render: (user) => (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
            {user.role}
        </span>
      )
    },
    {
      header: 'Trạng thái',
      render: (user) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
            user.status === 'ACTIVE' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-gray-100 text-gray-500 border-gray-200'
        }`}>
            {user.status}
        </span>
      )
    },
    {
        header: 'Hành động',
        className: 'text-right',
        render: (user) => (
            <div className="flex items-center justify-end gap-5">
                
                <button 
                    title="Xem chi tiết" 
                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(user.id);
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 17 12" fill="none"><path d="M6.67969 4.04297C7.125 3.59766 7.65234 3.375 8.26172 3.375C8.87109 3.375 9.39844 3.59766 9.84375 4.04297C10.2891 4.48828 10.5117 5.01562 10.5117 5.625C10.5117 6.23438 10.2891 6.76172 9.84375 7.20703C9.39844 7.65234 8.87109 7.875 8.26172 7.875C7.65234 7.875 7.125 7.65234 6.67969 7.20703C6.23438 6.76172 6.01172 6.23438 6.01172 5.625C6.01172 5.01562 6.23438 4.48828 6.67969 4.04297ZM5.58984 8.29688C6.33984 9.02344 7.23047 9.38672 8.26172 9.38672C9.29297 9.38672 10.1719 9.02344 10.8984 8.29688C11.6484 7.54688 12.0234 6.65625 12.0234 5.625C12.0234 4.59375 11.6484 3.71484 10.8984 2.98828C10.1719 2.23828 9.29297 1.86328 8.26172 1.86328C7.23047 1.86328 6.33984 2.23828 5.58984 2.98828C4.86328 3.71484 4.5 4.59375 4.5 5.625C4.5 6.65625 4.86328 7.54688 5.58984 8.29688ZM3.23438 1.54688C4.73438 0.515625 6.41016 0 8.26172 0C10.1133 0 11.7891 0.515625 13.2891 1.54688C14.7891 2.57812 15.8672 3.9375 16.5234 5.625C15.8672 7.3125 14.7891 8.67188 13.2891 9.70312C11.7891 10.7344 10.1133 11.25 8.26172 11.25C6.41016 11.25 4.73438 10.7344 3.23438 9.70312C1.73438 8.67188 0.65625 7.3125 0 5.625C0.65625 3.9375 1.73438 2.57812 3.23438 1.54688Z" fill="currentColor"/></svg>
                </button>

                <Link 
                    href={`${basePath}/${user.id}/update`} 
                    onClick={(e) => e.stopPropagation()}
                >
                    <button 
                        title="Chỉnh sửa" 
                        className="text-gray-400 hover:text-blue-600 transition-colors block"
                    >
                        <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M13.2891 3.02344L11.918 4.39453L9.10547 1.58203L10.4766 0.210938C10.6172 0.0703125 10.793 0 11.0039 0C11.2148 0 11.3906 0.0703125 11.5312 0.210938L13.2891 1.96875C13.4297 2.10938 13.5 2.28516 13.5 2.49609C13.5 2.70703 13.4297 2.88281 13.2891 3.02344ZM0 10.6875L8.29688 2.39062L11.1094 5.20312L2.8125 13.5H0V10.6875Z" fill="currentColor"/></svg>
                    </button>
                </Link>

                <button 
                    title="Xóa user" 
                    className="text-[#F87171] hover:text-red-700 transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeleteClick(user.id);
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 16 13" fill="none"><path d="M9 3.02344C9 3.5625 8.85938 4.06641 8.57812 4.53516C8.32031 4.98047 7.95703 5.34375 7.48828 5.625C7.04297 5.88281 6.53906 6.01172 5.97656 6.01172C5.4375 6.01172 4.93359 5.88281 4.46484 5.625C4.01953 5.34375 3.65625 4.98047 3.375 4.53516C3.11719 4.06641 2.98828 3.5625 2.98828 3.02344C2.98828 2.46094 3.11719 1.95703 3.375 1.51172C3.65625 1.04297 4.01953 0.679687 4.46484 0.421875C4.93359 0.140625 5.4375 0 5.97656 0C6.53906 0 7.04297 0.140625 7.48828 0.421875C7.95703 0.679687 8.32031 1.04297 8.57812 1.51172C8.85938 1.95703 9 2.46094 9 3.02344ZM11.25 4.5H15.75V6.01172H11.25V4.5ZM0 10.5117C0 10.1133 0.140625 9.76172 0.421875 9.45703C0.703125 9.12891 1.06641 8.84766 1.51172 8.61328C1.98047 8.35547 2.48438 8.15625 3.02344 8.01562C3.5625 7.85156 4.08984 7.73438 4.60547 7.66406C5.12109 7.57031 5.57812 7.52344 5.97656 7.52344C6.375 7.52344 6.83203 7.57031 7.34766 7.66406C7.88672 7.73438 8.42578 7.85156 8.96484 8.01562C9.50391 8.15625 9.99609 8.35547 10.4414 8.61328C10.9102 8.84766 11.2852 9.12891 11.5664 9.45703C11.8477 9.76172 11.9883 10.1133 11.9883 10.5117V12.0234H0V10.5117Z" fill="currentColor"/></svg>
                </button>
            </div>
        )
    }
  ], [basePath]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
        const response = await userService.getUsers(
            currentPage,
            ITEMS_PER_PAGE,
            searchTerm,
            roleFilter,
            statusFilter
        );

        setUsers(response.data);
        setTotalItems(response.total);
        
    } catch (err: unknown) {
        console.error("Lỗi tải dữ liệu:", err);
        if (err instanceof Error && (err.message.includes('401') || err.message.toLowerCase().includes('unauthorized'))) {
            router.push('/login');
        }
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
        fetchData();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  const handleSearchChange = (value: string) => {
    if (value.length <= 100) {
      setSearchTerm(value);
      setCurrentPage(1);
      setError('');
    } else {
      setSearchTerm(value.slice(0, 100)); 
      setError('Từ khóa tìm kiếm không được quá 100 ký tự!');
    }
  };

  const handleRoleChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />

      <ConfirmModal 
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        onConfirm={confirmDelete}
        title="Xóa người dùng?"
        message="Hành động này sẽ xóa vĩnh viễn người dùng khỏi hệ thống. Bạn có chắc chắn không?"
        confirmText="Xóa vĩnh viễn"
        variant="danger"
        isLoading={isDeleting}
      />

      <UserHeader role={role} />
      
      <UserFilters 
        searchTerm={searchTerm} 
        setSearchTerm={handleSearchChange}
        error={error}
        
        roleFilter={roleFilter} 
        setRoleFilter={handleRoleChange}
        
        statusFilter={statusFilter} 
        setStatusFilter={handleStatusChange}

        currentRole={role}
      />

      <div className="mt-4">
          <CommonTable 
            data={users} 
            columns={columns} 
            keyExtractor={(item) => item.id}
            isLoading={isLoading} 
            onRowClick={(user) => handleViewDetail(user.id)}
          />
      </div>

      {!isLoading && users.length > 0 && (
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
          />
      )}
    </div>
  );
}