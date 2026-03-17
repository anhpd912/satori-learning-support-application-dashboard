'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageHeader from '@/shared/components/PageHeader';
import CommonTable, { Column } from '@/shared/components/CommonTable';
import Pagination from '@/shared/components/Pagination';
import FilterDropdown from '@/shared/components/FilterDropdown';

interface Scenario {
    id: string;
    name: string;
    roles: string;
    level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
    averageScore: string;
    status: 'PUBLISHED' | 'DRAFT';
}

export default function TopicDetailClient({ topicId }: { topicId: string }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState('Tất cả trình độ');
    const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Mock Scenario Data
    const [scenarios] = useState<Scenario[]>([
        { id: '1', name: 'Mặc cả mua áo thun', roles: 'AI: Nhân viên | User: Khách', level: 'N5', averageScore: '85/100', status: 'PUBLISHED' },
        { id: '2', name: 'Thanh toán tại quầy', roles: 'AI: Thu ngân | User: Khách', level: 'N4', averageScore: '90/100', status: 'PUBLISHED' },
        { id: '3', name: 'Hỏi vị trí quầy hàng', roles: 'AI: Bảo vệ | User: Khách', level: 'N5', averageScore: '-', status: 'DRAFT' },
    ]);

    const columns: Column<Scenario>[] = [
        {
            header: 'Tên Kịch bản',
            render: (s) => (
                <div>
                    <div className="font-bold text-slate-800 text-sm">{s.name}</div>
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">{s.roles}</div>
                </div>
            )
        },
        {
            header: 'Trình độ',
            className: 'text-center',
            render: (s) => (
                <span className="inline-flex px-2 py-0.5 rounded bg-orange-50 text-orange-600 text-[10px] font-bold border border-orange-100 italic">
                    {s.level}
                </span>
            )
        },
        {
            header: 'Điểm trung bình',
            className: 'text-center font-bold text-slate-700 text-sm',
            accessor: 'averageScore'
        },
        {
            header: 'Trạng thái',
            render: (s) => (
                <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold ${
                    s.status === 'PUBLISHED' ? 'bg-blue-50 text-blue-500' : 'bg-slate-50 text-slate-400'
                }`}>
                    {s.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                </span>
            )
        },
        {
            header: 'Hành động',
            className: 'text-right',
            render: (s) => (
                <div className="flex items-center justify-end gap-3 text-slate-400">
                    <Link href={`/topics/${topicId}/scenarios/${s.id}`} className="hover:text-blue-500 transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </Link>
                    <Link href={`/topics/${topicId}/scenarios/${s.id}/edit`} className="hover:text-amber-500 transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </Link>
                    <button className="hover:text-red-500 transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="bg-slate-50/50 min-h-screen">
            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Header / Breadcrumb */}
                <PageHeader 
                    breadcrumb={[
                        { label: 'Quản lý Chủ đề Giao tiếp', href: '/topics' },
                        { label: 'Chi tiết chủ đề', active: true }
                    ]}
                    backUrl="/topics"
                    title="Chi tiết chủ đề"
                    titleAlign="right"
                />

                {/* Topic Info Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 pb-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 flex items-center gap-4">
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-bold border border-slate-100 hover:bg-slate-100 transition-all">
                            Chỉnh sửa Thông tin
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button className="flex items-center gap-2 text-red-500 text-sm font-bold hover:opacity-70 transition-opacity">
                            Xóa Chủ đề
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mua sắm & Siêu thị</h1>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-500 text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                            Đang hoạt động
                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                        </span>
                    </div>

                    <p className="text-slate-500 leading-relaxed max-w-3xl font-normal mb-8">
                        Bao gồm các tình huống hỏi giá, mặc cả, thanh toán tại quầy và các mẫu câu thông dụng khi đi mua sắm tại Nhật Bản.
                    </p>

                    <div className="flex items-center gap-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            </div>
                            <div>
                                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Tổng số</div>
                                <div className="text-sm font-bold text-slate-700">12 <span className="text-slate-400 font-normal">Bài hội thoại</span></div>
                            </div>
                        </div>

                        <div className="w-px h-8 bg-slate-100"></div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-50/50 flex items-center justify-center text-orange-500">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                            </div>
                            <div>
                                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">N5</div>
                                <div className="text-sm font-bold text-slate-700">5 <span className="text-slate-400 font-normal">bài</span></div>
                            </div>
                        </div>

                        <div className="w-px h-8 bg-slate-100"></div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-50/50 flex items-center justify-center text-orange-500">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                            </div>
                            <div>
                                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">N4</div>
                                <div className="text-sm font-bold text-slate-700">7 <span className="text-slate-400 font-normal">bài</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scenarios Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Danh sách Kịch bản Hội thoại</h2>
                        <Link 
                            href={`/topics/${topicId}/scenarios/create`}
                            className="flex items-center gap-2.5 px-6 py-3 bg-[#1A8DFF] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-wide"
                        >
                            Thêm Bài hội thoại
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
                        {/* Toolbar */}
                        <div className="flex flex-col md:flex-row gap-4 mb-8">
                            <div className="relative flex-1 group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-500 transition-colors">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                </div>
                                <input 
                                    type="text"
                                    placeholder="Tìm tên kịch bản, vai trò..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all font-semibold text-slate-700 placeholder-slate-300 text-sm"
                                />
                            </div>
                            <div className="w-full md:w-60">
                                <FilterDropdown 
                                    options={['Tất cả trình độ', 'N5', 'N4', 'N3', 'N2', 'N1']}
                                    value={levelFilter}
                                    onChange={setLevelFilter}
                                />
                            </div>
                            <div className="w-full md:w-60">
                                <FilterDropdown 
                                    options={['Tất cả trạng thái', 'Published', 'Draft']}
                                    value={statusFilter}
                                    onChange={setStatusFilter}
                                />
                            </div>
                        </div>

                        <CommonTable 
                            data={scenarios}
                            columns={columns}
                            keyExtractor={(item) => item.id}
                        />

                        <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-400">
                                Hiển thị 3 trên 12 bản ghi
                            </span>
                            <Pagination 
                                currentPage={currentPage}
                                totalPages={2}
                                onPageChange={setCurrentPage}
                                totalItems={12}
                                itemsPerPage={itemsPerPage}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
