'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/shared/components/PageHeader';
import CommonTable, { Column } from '@/shared/components/CommonTable';
import Pagination from '@/shared/components/Pagination';
import FilterDropdown from '@/shared/components/FilterDropdown';

import Link from 'next/link';
interface Topic {
    id: string;
    name: string;
    description: string;
    count: number;
    status: 'PUBLISHED' | 'DRAFT';
}

export default function TopicsListClient() {
    const router = useRouter();

    const [topics] = useState<Topic[]>([
        { id: '1', name: 'Mua sắm & Siêu thị', description: 'Các tình huống hỏi giá, mặc cả, thanh toán tại quầy...', count: 15, status: 'PUBLISHED' },
        { id: '2', name: 'Giao tiếp Công sở', description: 'Trao đổi công việc, họp nhóm và thảo luận dự án', count: 22, status: 'PUBLISHED' },
        { id: '3', name: 'Du lịch & Khách sạn', description: 'Đặt phòng, hỏi đường, check-in và các yêu cầu dịch vụ', count: 10, status: 'DRAFT' },
        { id: '4', name: 'Nhà hàng & Ăn uống', description: 'Gọi món, phàn nàn dịch vụ và thanh toán tại bàn', count: 18, status: 'PUBLISHED' },
        { id: '5', name: 'Sức khỏe & Y tế', description: 'Mô tả triệu chứng, trao đổi với bác sĩ, mua thuốc và chăm sóc sức khỏe hằng ngày.', count: 18, status: 'PUBLISHED' }
    ]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [statusFilter, setStatusFilter] = useState('Tất cả Trạng thái');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const columns: Column<Topic>[] = [
        {
            header: 'Tên Chủ đề',
            accessor: 'name',
            className: 'w-[20%] font-semibold text-gray-900',
        },
        {
            header: 'Mô tả ngắn',
            accessor: 'description',
            className: 'w-[40%] text-sm text-gray-500 font-normal',
        },
        {
            header: 'Số lượng Hội thoại',
            className: 'text-center w-[15%]',
            render: (topic) => (
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gray-100/80 text-gray-600 text-xs font-semibold">
                    {topic.count} Bài
                </span>
            )
        },
        {
            header: 'Trạng thái',
            className: 'w-[15%]',
            render: (topic) => {
                if (topic.status === 'PUBLISHED') {
                    return (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100/60 text-emerald-600 text-xs font-semibold">
                            Đang hiển thị
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        </span>
                    );
                }
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold">
                        Bản nháp
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                    </span>
                );
            }
        },
        {
            header: 'Hành động',
            className: 'text-right w-[10%]',
            render: (topic) => (
                <div className="flex items-center justify-end gap-3 text-gray-400">
                    <Link href={`/topics/${topic.id}`} className="hover:text-[#1A8DFF] transition-colors" title="Xem chi tiết">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </Link>
                    <button className="hover:text-blue-500 transition-colors" title="Chỉnh sửa">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button className="hover:text-red-500 transition-colors" title="Xóa">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="bg-gray-50 min-h-screen font-sans w-full flex flex-col">
            <div className="p-8 pb-32 max-w-7xl mx-auto w-full flex-1">
                <PageHeader
                    breadcrumb={[
                        { label: 'Quản lý Chủ đề Giao tiếp', active: true }
                    ]}
                    title="Quản lý Chủ đề Giao tiếp"
                    action={
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 bg-[#253A8C] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1e2e70] transition-colors shadow-sm"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="12" y1="8" x2="12" y2="16"></line>
                                <line x1="8" y1="12" x2="16" y2="12"></line>
                            </svg>
                            Thêm chủ đề mới
                        </button>
                    }
                />

                {/* Thanh công cụ (Toolbar) */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm kiếm tên chủ đề ..."
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent focus:border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A8DFF]/20 text-sm text-gray-900 transition"
                        />
                    </div>
                    <div className="w-full md:w-64 relative">
                        <FilterDropdown
                            options={['Tất cả Trạng thái', 'Đang hiển thị', 'Bản nháp']}
                            value={statusFilter}
                            onChange={setStatusFilter}
                        />
                    </div>
                </div>

                <CommonTable
                    data={topics}
                    columns={columns}
                    keyExtractor={(topic) => topic.id}
                />

                <Pagination
                    currentPage={currentPage}
                    totalPages={5}
                    onPageChange={setCurrentPage}
                    totalItems={24}
                    itemsPerPage={itemsPerPage}
                />
            </div>

            {/* Modal Thêm Chủ đề mới */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-[500px] overflow-hidden flex flex-col">

                        {/* Header */}
                        <div className="flex items-center justify-between p-6 pb-4">
                            <h2 className="text-lg font-bold text-slate-900">Thêm Chủ đề Giao tiếp</h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 space-y-6">
                            <div className="space-y-2.5">
                                <label className="block text-sm font-medium text-slate-700">Tên chủ đề</label>
                                <input
                                    type="text"
                                    placeholder="Ví dụ: Du lịch & Khách sạn"
                                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A8DFF]/20 focus:border-[#1A8DFF] transition-all placeholder:text-slate-400"
                                />
                            </div>

                            <div className="space-y-2.5">
                                <label className="block text-sm font-medium text-slate-700">Mô tả ngắn (Tùy chọn)</label>
                                <textarea
                                    placeholder="Nhập mô tả ngắn về chủ đề này..."
                                    rows={3}
                                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A8DFF]/20 focus:border-[#1A8DFF] transition-all resize-none placeholder:text-slate-400"
                                ></textarea>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 pt-8">
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button className="px-5 py-2 text-sm font-medium text-white bg-[#1A8DFF] rounded-lg hover:bg-blue-600 transition-colors shadow-sm">
                                Tạo chủ đề
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
