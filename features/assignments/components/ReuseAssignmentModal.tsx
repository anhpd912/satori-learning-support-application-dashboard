'use client';

import React, { useState, useMemo } from 'react';
import { useMyAssignments } from '../hooks/useAssignments';
import { useClasses } from '@/features/classes/hooks/useClasses';
import FilterDropdown from '@/shared/components/FilterDropdown';

interface ReuseAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (assignmentId: string) => void;
}

export default function ReuseAssignmentModal({ isOpen, onClose, onSelect }: ReuseAssignmentModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('Tất cả');
    const [classFilter, setClassFilter] = useState('Tất cả');
    const [currentPage] = useState(1);
    const ITEMS_PER_PAGE = 100;

    const { data: assignmentsData, isLoading: isAssignmentsLoading } = useMyAssignments(currentPage, ITEMS_PER_PAGE);
    const assignments = assignmentsData?.content || [];

    // Fetch classes for the filter - using large limit to get all for the dropdown
    const { data: classesData } = useClasses(1, 100, '', 'Active', 'Tất cả', 'Tất cả');
    const classes = classesData?.data || [];

    const typeOptions = [
        { label: 'Loại bài: Tất cả', value: 'Tất cả' },
        { label: 'Quiz / Trắc nghiệm', value: 'QUIZ' },
        { label: 'Tự luận / Viết', value: 'WRITING' },
        { label: 'Dịch thuật', value: 'TRANSLATION' }
    ];

    const classOptions = useMemo(() => {
        const baseOptions = [{ label: 'Lớp học: Tất cả', value: 'Tất cả' }];
        const mapped = classes.map(c => ({ label: c.name, value: c.id }));
        return [...baseOptions, ...mapped];
    }, [classes]);

    const filteredAssignments = useMemo(() => {
        return assignments.filter(a => {
            const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === 'Tất cả' || a.assignmentType === typeFilter;
            // Note: AssignmentSummary might not have classId in some versions, 
            // but we'll try to match status or title if id isn't available for matching.
            const matchesClass = classFilter === 'Tất cả' || a.classId === classFilter || a.className === classFilter;
            return matchesSearch && matchesType && matchesClass;
        });
    }, [assignments, searchTerm, typeFilter, classFilter]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-8 pb-6 relative">
                    <button 
                        onClick={onClose}
                        className="absolute right-8 top-8 p-1 text-gray-400 hover:text-gray-600 transition-all"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">Chọn bài tập để tái sử dụng</h2>
                    <p className="text-slate-400 text-sm font-medium">Duyệt qua các tài liệu cũ từ các lớp học của bạn</p>
                    
                    {/* Filters */}
                    <div className="mt-6 space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </div>
                            <input 
                                type="text"
                                placeholder="Tìm tên bài tập..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700 placeholder-slate-300 text-sm"
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <FilterDropdown 
                                    options={classOptions}
                                    value={classFilter}
                                    onChange={setClassFilter}
                                />
                            </div>
                            <div className="flex-1">
                                <FilterDropdown 
                                    options={typeOptions}
                                    value={typeFilter}
                                    onChange={setTypeFilter}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto p-8 pt-0 custom-scrollbar bg-white">
                    <div className="space-y-3">
                        {isAssignmentsLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                            </div>
                        ) : filteredAssignments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                </div>
                                <p className="font-semibold text-sm">Không tìm thấy bài tập nào</p>
                            </div>
                        ) : (
                            filteredAssignments.map((a) => (
                                <div key={a.id} className="p-6 bg-white border border-slate-100 rounded-xl hover:border-blue-200 transition-all hover:bg-slate-50/50 group flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-base font-bold text-slate-800 mb-2">{a.title.replace(/\s*\(Đã kết thúc\)\s*$/g, '')}</h3>
                                        <div className="flex items-center gap-4 text-slate-500 text-xs font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
                                                <span>Lớp {a.className || a.classId || 'N/A'}</span>
                                            </div>
                                            <span className="text-slate-200">|</span>
                                            <div className="flex items-center gap-1.5">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                                                <span>{a.assignmentType === 'QUIZ' ? 'Quiz' : a.assignmentType === 'WRITING' ? 'Viết' : 'Dịch'}</span>
                                            </div>
                                            <span className="text-slate-200">|</span>
                                            <div className="flex items-center gap-1.5">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                                                <span>{a.questionCount || 0} {a.assignmentType === 'QUIZ' ? 'Câu hỏi' : 'Bài tập'}</span>
                                            </div>
                                        </div>
                                        <button className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                            Xem trước
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => onSelect(a.id)}
                                        className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold text-sm shadow-sm transition-all active:scale-95"
                                    >
                                        Tái sử dụng
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white text-slate-500 hover:text-slate-700 rounded-lg font-bold text-sm border border-slate-200 transition-all"
                    >
                        Hủy bỏ
                    </button>
                    <p className="text-[11px] font-medium text-slate-300 tracking-wide uppercase">* Chọn 1 bài tập để tiếp tục</p>
                </div>
            </div>
        </div>
    );
}
