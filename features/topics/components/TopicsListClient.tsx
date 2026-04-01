'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/shared/components/PageHeader';
import CommonTable, { Column } from '@/shared/components/CommonTable';
import Pagination from '@/shared/components/Pagination';
import FilterDropdown from '@/shared/components/FilterDropdown';
import Toast from '@/shared/components/Toast'; // Added import

import Link from 'next/link';
import { useEffect } from 'react';
import { topicService } from '../services/topic-service';
import { TopicSummary } from '../types';

export default function TopicsListClient() {
    const router = useRouter();

    const [topics, setTopics] = useState<TopicSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;
    const [statusFilter, setStatusFilter] = useState('Tất cả Trạng thái');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingTheme, setEditingTheme] = useState<TopicSummary | null>(null);
    const [keyword, setKeyword] = useState('');

    const [themeTitle, setThemeTitle] = useState('');
    const [themeTitleJapanese, setThemeTitleJapanese] = useState('');
    const [themeDescription, setThemeDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Toast state
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
        message: '',
        type: 'success',
        isVisible: false
    });

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type, isVisible: true });
    };

    const fetchTopics = async () => {
        setIsLoading(true);
        try {
            const data = await topicService.getThemes(currentPage - 1, itemsPerPage, keyword);
            if (data.success) {
                setTopics(data.data.content);
                setTotalPages(data.data.totalPages);
                setTotalItems(data.data.totalElements);
            }
        } catch (error) {
            console.error('Failed to fetch topics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(fetchTopics, 300); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [currentPage, keyword]);

    const handleOpenAddModal = () => {
        setEditingTheme(null);
        setThemeTitle('');
        setThemeTitleJapanese('');
        setThemeDescription('');
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (theme: TopicSummary) => {
        setEditingTheme(theme);
        setThemeTitle(theme.title);
        setThemeTitleJapanese(theme.titleJapanese || '');
        setThemeDescription(theme.descriptionVi || theme.description || '');
        setIsAddModalOpen(true);
    };

    const handleSubmitTheme = async () => {
        if (!themeTitle.trim()) return;

        setIsSubmitting(true);
        try {
            const payload = {
                title: themeTitle,
                titleJapanese: themeTitleJapanese,
                descriptionVi: themeDescription,
                status: editingTheme?.status || 'DRAFT',
                orderIndex: editingTheme?.orderIndex || (totalItems + 1)
            };

            const data = editingTheme 
                ? await topicService.updateTheme(editingTheme.id, payload)
                : await topicService.createTheme(payload);

            if (data.success) {
                setIsAddModalOpen(false);
                showToast(editingTheme ? 'Cập nhật chủ đề thành công!' : 'Tạo chủ đề thành công!');
                fetchTopics();
            }
        } catch (error) {
            console.error('Failed to save theme:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTheme = async (themeId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa chủ đề này? Tất cả các bài hội thoại bên trong cũng sẽ bị ảnh hưởng.')) {
            return;
        }

        try {
            const data = await topicService.deleteTheme(themeId);
            if (data.success) {
                showToast('Đã xóa chủ đề thành công!');
                fetchTopics();
            }
        } catch (error) {
            console.error('Failed to delete theme:', error);
            alert('Có lỗi xảy ra khi xóa chủ đề.');
        }
    };

    const columns: Column<TopicSummary>[] = [
        {
            header: 'Tên Chủ đề',
            className: 'w-[25%] font-semibold text-gray-900',
            render: (topic) => (
                <div>
                    <div className="font-bold text-slate-800 text-sm">{topic.title}</div>
                    {topic.titleJapanese && (
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">{topic.titleJapanese}</div>
                    )}
                </div>
            )
        },
        {
            header: 'Mô tả ngắn',
            className: 'w-[35%] text-sm text-gray-500 font-normal',
            render: (topic) => (
                <div className="line-clamp-2" title={topic.descriptionVi || topic.description}>
                    {topic.descriptionVi || topic.description || 'Chưa có mô tả'}
                </div>
            )
        },
        {
            header: 'Số lượng Hội thoại',
            className: 'text-center w-[15%]',
            render: (topic) => (
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gray-100/80 text-gray-600 text-xs font-semibold">
                    {topic.topicCount || 0} Bài
                </span>
            )
        },
        {
            header: 'Hành động',
            className: 'text-right w-[10%]',
            render: (topic) => (
                <div className="flex items-center justify-end gap-3 text-gray-400">
                    <Link href={`/topics/${topic.id}`} className="hover:text-[#1A8DFF] transition-colors" title="Xem chi tiết">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </Link>
                    <button 
                        className="hover:text-blue-500 transition-colors" 
                        title="Chỉnh sửa"
                        onClick={() => handleOpenEditModal(topic)}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button 
                        className="hover:text-red-500 transition-colors" 
                        title="Xóa"
                        onClick={() => handleDeleteTheme(topic.id)}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            )
        }
    ];


    return (
        <div className="bg-gray-50 min-h-screen font-sans w-full flex flex-col">
            <div className="p-8 pb-32 max-w-7xl mx-auto w-full flex-1">
            {/* Header section with PageHeader */}
            <div className="mb-4">
                <PageHeader 
                    breadcrumb={[{ label: 'Quản lý Chủ đề Giao tiếp', active: true }]}
                    title="Danh sách Chủ đề"
                    titleAlign="right"
                    action={
                        <button 
                            onClick={handleOpenAddModal}
                            className="bg-[#1A8DFF] hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all shadow-blue-500/20"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Thêm chủ đề mới
                        </button>
                    }
                />
            </div>

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
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
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

                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#253A8C]"></div>
                    </div>
                ) : (
                    <>
                        <CommonTable
                            data={topics}
                            columns={columns}
                            keyExtractor={(topic) => topic.id}
                        />

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                        />
                    </>
                )}
            </div>

            {/* Modal Thêm Chủ đề mới */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-[500px] overflow-hidden flex flex-col">

                        {/* Header */}
                        <div className="flex items-center justify-between p-6 pb-4">
                            <h2 className="text-lg font-bold text-slate-900">
                                {editingTheme ? 'Cập nhật Chủ đề' : 'Thêm Chủ đề Giao tiếp'}
                            </h2>
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
                                <label className="block text-sm font-medium text-slate-700">Tên chủ đề (Tiếng Việt)</label>
                                <input
                                    type="text"
                                    value={themeTitle}
                                    onChange={(e) => setThemeTitle(e.target.value)}
                                    placeholder="Ví dụ: Du lịch & Khách sạn"
                                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A8DFF]/20 focus:border-[#1A8DFF] transition-all placeholder:text-slate-400"
                                />
                            </div>

                            <div className="space-y-2.5">
                                <label className="block text-sm font-medium text-slate-700">Tên chủ đề (Tiếng Nhật)</label>
                                <input
                                    type="text"
                                    value={themeTitleJapanese}
                                    onChange={(e) => setThemeTitleJapanese(e.target.value)}
                                    placeholder="Ví dụ: 観光とホテル"
                                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A8DFF]/20 focus:border-[#1A8DFF] transition-all placeholder:text-slate-400"
                                />
                            </div>

                            <div className="space-y-2.5">
                                <label className="block text-sm font-medium text-slate-700">Mô tả ngắn (Tùy chọn)</label>
                                <textarea
                                    value={themeDescription}
                                    onChange={(e) => setThemeDescription(e.target.value)}
                                    placeholder="Nhập mô tả ngắn về chủ đề này..."
                                    rows={3}
                                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A8DFF]/20 focus:border-[#1A8DFF] transition-all resize-none placeholder:text-slate-400"
                                ></textarea>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 pt-8">
                            <button
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setEditingTheme(null);
                                }}
                                className="px-5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                disabled={isSubmitting}
                            >
                                Hủy
                            </button>
                            <button 
                                onClick={handleSubmitTheme}
                                disabled={isSubmitting || !themeTitle.trim()}
                                className="px-5 py-2 text-sm font-medium text-white bg-[#1A8DFF] rounded-lg hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Đang lưu...
                                    </>
                                ) : (editingTheme ? 'Cập nhật' : 'Tạo chủ đề')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Toast Notification */}
            <Toast 
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />
        </div>
    );
}
