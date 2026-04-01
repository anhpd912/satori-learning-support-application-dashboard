'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageHeader from '@/shared/components/PageHeader';
import CommonTable, { Column } from '@/shared/components/CommonTable';
import Pagination from '@/shared/components/Pagination';
import FilterDropdown from '@/shared/components/FilterDropdown';
import Toast from '@/shared/components/Toast';
import { useEffect, useState } from 'react';
import { topicService } from '../services/topic-service';
import { TopicDetail, ScenarioSummary } from '../types';

export default function TopicDetailClient({ topicId }: { topicId: string }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState('Tất cả trình độ');
    const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false); // Added from instruction
    const [theme, setTheme] = useState<TopicDetail | null>(null);
    const [scenarios, setScenarios] = useState<ScenarioSummary[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Toast state
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
        message: '',
        type: 'success',
        isVisible: false
    });

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type, isVisible: true });
    };

    useEffect(() => {
        const fetchThemeData = async () => {
            setIsLoading(true);
            try {
                const themeData = await topicService.getThemeById(topicId);
                if (themeData.success) {
                    setTheme(themeData.data);
                }

                const scenariosData = await topicService.getScenariosByThemeId(topicId, currentPage - 1, itemsPerPage);
                if (scenariosData.success) {
                    setScenarios(scenariosData.data.content);
                    setTotalPages(scenariosData.data.totalPages);
                    setTotalItems(scenariosData.data.totalElements);
                }
            } catch (error) {
                console.error('Failed to fetch theme data:', error);
                showToast('Failed to fetch theme data.', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchThemeData();
    }, [topicId, currentPage]);

    const handleDeleteScenario = async (scenarioId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bài hội thoại này?')) {
            return;
        }

        try {
            const data = await topicService.deleteScenario(scenarioId);
            if (data.success) {
                showToast('Đã xóa kịch bản thành công!');
                // Refresh list
                const scenariosData = await topicService.getScenariosByThemeId(topicId, currentPage - 1, itemsPerPage);
                if (scenariosData.success) {
                    setScenarios(scenariosData.data.content);
                    setTotalPages(scenariosData.data.totalPages);
                    setTotalItems(scenariosData.data.totalElements);
                }
            }
        } catch (error) {
            console.error('Failed to delete scenario:', error);
            showToast('Có lỗi xảy ra khi xóa bài hội thoại.', 'error');
        }
    };

    const columns: Column<ScenarioSummary>[] = [
        {
            header: 'Tên Kịch bản',
            render: (s) => (
                <div>
                    <div className="font-bold text-slate-800 text-sm">{s.title}</div>
                    {s.titleJapanese && (
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5 italic">{s.titleJapanese}</div>
                    )}
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5 line-clamp-1 max-w-xs">
                        {s.descriptionVi || s.description || 'Chưa có mô tả'}
                    </div>
                </div>
            )
        },
        {
            header: 'Trình độ',
            className: 'text-center',
            render: (s) => (
                <span className="inline-flex px-2 py-0.5 rounded bg-orange-50 text-orange-600 text-[10px] font-bold border border-orange-100 italic">
                    N5
                </span>
            )
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
                    <button 
                        className="hover:text-red-500 transition-colors"
                        onClick={() => handleDeleteScenario(s.id)}
                    >
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

                {isLoading || !theme ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <>
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
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{theme.title}</h1>
                                    {theme.titleJapanese && (
                                        <div className="text-xs text-slate-400 font-medium mt-1">{theme.titleJapanese}</div>
                                    )}
                                </div>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                    theme.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                }`}>
                                    {theme.status === 'PUBLISHED' ? 'Đang hoạt động' : 'Bản nháp'}
                                    {theme.status === 'PUBLISHED' && <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>}
                                </span>
                            </div>

                            <p className="text-slate-500 leading-relaxed max-w-3xl font-normal mb-8">
                                {theme.descriptionVi || theme.description || 'Chưa có mô tả'}
                            </p>

                            <div className="flex items-center gap-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Tổng số</div>
                                        <div className="text-sm font-bold text-slate-700">{totalItems} <span className="text-slate-400 font-normal">Bài hội thoại</span></div>
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
                                        Hiển thị {scenarios.length} trên {totalItems} bản ghi
                                    </span>
                                    <Pagination 
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                        totalItems={totalItems}
                                        itemsPerPage={itemsPerPage}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

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
