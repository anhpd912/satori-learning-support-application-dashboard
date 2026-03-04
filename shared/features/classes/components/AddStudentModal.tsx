'use client';

import React, { useState, useEffect } from 'react';
import { classService } from '@/shared/services/class.service';

interface User {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    code?: string;
}

interface AddStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (selectedIds: string[]) => void;
    classId: string;
}

export default function AddStudentModal({ isOpen, onClose, onConfirm, classId }: AddStudentModalProps) {
    // === 1. STATES API ===
    const [users, setUsers] = useState<User[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // === 2. EFFECT: RESET VÀ FETCH KHI MỞ MODAL ===
    useEffect(() => {
        if (isOpen) {
            setUsers([]);
            setSelectedIds(new Set());
            setSearchTerm('');
            setPage(1);
            setHasMore(true);
            fetchUsers(1, '');
        }
    }, [isOpen]);

    // === 3. LOGIC GỌI API ===
    const fetchUsers = async (pageNum: number, search: string) => {
        setIsLoading(true);
        try {
            const response = await classService.getEligibleLearners(
                classId,
                pageNum,
                10,
                search
            );

            const newUsers = response.content;

            if (pageNum === 1) {
                setUsers(newUsers);
            } else {
                setUsers(prev => [...prev, ...newUsers]);
            }

            // Logic check hasMore dựa trên tổng số trang
            setHasMore(pageNum < response.totalPages);

        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setPage(1);
        fetchUsers(1, value);
    };

    const handleLoadMore = () => {
        if (!hasMore || isLoading) return;
        const nextPage = page + 1;
        setPage(nextPage);
        fetchUsers(nextPage, searchTerm);
    };

    // === 4. LOGIC CHECKBOX & AVATAR ===
    const isAllSelected = users.length > 0 && selectedIds.size === users.length;
    const isIndeterminate = selectedIds.size > 0 && selectedIds.size < users.length;

    const toggleSelection = (userId: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds(new Set());
        } else {
            const allIds = users.map(s => s.id);
            setSelectedIds(new Set(allIds));
        }
    };

    const getInitials = (name: string) => {
        if (!name) return 'U';
        const words = name.trim().split(' ');
        if (words.length >= 2) {
            return (words[0][0] + words[words.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const handleConfirm = () => {
        onConfirm(Array.from(selectedIds));
        setSelectedIds(new Set());
        setSearchTerm('');
    };

    if (!isOpen) return null;

    // === 5. GIAO DIỆN (UI) KHỚP FIGMA ===
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh] mx-4 animate-in fade-in zoom-in duration-200">

                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Thêm học viên vào lớp</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 flex-1 overflow-y-auto">

                    {/* Search Input */}
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-700 mb-3">Tìm kiếm</h3>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm học viên theo tên, email"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A8C] text-sm text-gray-900 placeholder-gray-400 transition-all"
                            />
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </div>
                        </div>
                    </div>

                    {/* Danh sách học viên (Table layout) */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden">

                        {/* Table Header */}
                        <div className="flex items-center px-4 py-3 bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-500">
                            <div className="w-10 flex justify-center">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    ref={input => { if (input) input.indeterminate = isIndeterminate; }}
                                    onChange={toggleSelectAll}
                                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                />
                            </div>
                            <div className="flex-1 px-4">Họ và tên</div>
                            <div className="flex-1 px-4">Email</div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-gray-100 max-h-[40vh] overflow-y-auto">
                            {users.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 text-sm">
                                    {isLoading ? 'Đang tải dữ liệu...' : 'Không tìm thấy học viên nào.'}
                                </div>
                            ) : (
                                users.map(user => (
                                    <div
                                        key={user.id}
                                        className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => toggleSelection(user.id)}
                                    >
                                        <div className="w-10 flex justify-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(user.id)}
                                                onChange={() => toggleSelection(user.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                            />
                                        </div>

                                        <div className="flex-1 px-4 flex items-center gap-3">
                                            {user.avatarUrl ? (
                                                <img src={user.avatarUrl} alt={user.fullName} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-blue-100 text-blue-600">
                                                    {getInitials(user.fullName)}
                                                </div>
                                            )}
                                            <span className="font-medium text-gray-900 text-sm">{user.fullName}</span>
                                        </div>

                                        <div className="flex-1 px-4 text-sm text-gray-500 truncate">
                                            {user.email}
                                        </div>
                                    </div>
                                ))
                            )}

                            {/* Nút Tải thêm (Load More) */}
                            {hasMore && users.length > 0 && (
                                <div className="p-3 text-center bg-gray-50/50">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleLoadMore(); }}
                                        disabled={isLoading}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
                                    >
                                        {isLoading ? 'Đang tải thêm...' : 'Tải thêm học viên'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-gray-50/50 rounded-b-2xl gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <span>Đã chọn: <span className="font-bold text-blue-600">{selectedIds.size}</span> học viên</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-6 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={selectedIds.size === 0}
                            className="flex-1 sm:flex-none px-6 py-2.5 bg-[#253A8C] text-white text-sm font-medium rounded-lg hover:bg-[#1e2e70] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            Xác nhận thêm vào lớp
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
