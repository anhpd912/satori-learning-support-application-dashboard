'use client';

import React, { useState, useEffect } from 'react';
import { 
    curriculumImportService, 
    CurriculumImportSummaryResponse,
    ImportStatus,
    LessonSummaryDto, 
    VocabularyResponse, 
    GrammarPointResponse,
    PageResponse
} from '@/features/curriculum-import/services/curriculumImport.service';

interface ImportDetailModalProps {
    importData: CurriculumImportSummaryResponse | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ImportDetailModal({ importData, isOpen, onClose }: ImportDetailModalProps) {
    const [activeTab, setActiveTab] = useState<'lessons' | 'vocab' | 'grammar'>('lessons');
    const importId = importData?.id;
    const [lessons, setLessons] = useState<LessonSummaryDto[]>([]);
    const [vocab, setVocab] = useState<PageResponse<VocabularyResponse> | null>(null);
    const [grammar, setGrammar] = useState<PageResponse<GrammarPointResponse> | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && importId) {
            fetchData();
        }
    }, [isOpen, importId, activeTab]);

    const fetchData = async () => {
        if (!importId) return;
        setIsLoading(true);
        try {
            if (activeTab === 'lessons') {
                const data = await curriculumImportService.getImportLessons(importId);
                setLessons(data);
            } else if (activeTab === 'vocab') {
                const data = await curriculumImportService.getImportVocabulary(importId, 0, 50);
                setVocab(data);
            } else if (activeTab === 'grammar') {
                const data = await curriculumImportService.getImportGrammarPoints(importId, 0, 50);
                setGrammar(data);
            }
        } catch (error) {
            console.error('Error fetching import details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-xl font-bold text-gray-900 truncate max-w-lg" title={importData?.originalFilename}>
                                {importData?.originalFilename || 'Chi tiết kết quả bóc tách'}
                            </h2>
                            {importData && (
                                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                                    importData.status === ImportStatus.COMPLETED ? 'bg-green-50 text-green-600 border-green-200' :
                                    importData.status === ImportStatus.FAILED ? 'bg-red-50 text-red-600 border-red-200' :
                                    importData.status === ImportStatus.PENDING_APPROVAL ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                                    'bg-blue-50 text-blue-600 border-blue-200'
                                }`}>
                                    {importData.status === ImportStatus.COMPLETED ? 'Thành công' : 
                                     importData.status === ImportStatus.FAILED ? 'Lỗi' : 
                                     importData.status === ImportStatus.PENDING_APPROVAL ? 'Chờ duyệt' : importData.status}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                            <p>Mã Import: <span className="font-mono text-gray-700">#{importId?.substring(0, 8)}</span></p>
                            {importData && (
                                <p className="flex items-center gap-1.5">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                    {new Date(importData.createdAt).toLocaleDateString('vi-VN')} {new Date(importData.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700 shrink-0"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-8 py-2 border-b border-gray-100 gap-8">
                    {[
                        { id: 'lessons', label: 'Bài học', count: lessons.length },
                        { id: 'vocab', label: 'Từ vựng', count: vocab?.totalElements },
                        { id: 'grammar', label: 'Ngữ pháp', count: grammar?.totalElements }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                                activeTab === tab.id 
                                ? 'border-blue-500 text-blue-600' 
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                    activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                                }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                            <p className="text-gray-400 font-medium animate-pulse">Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'lessons' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {lessons.length > 0 ? lessons.map((lesson) => (
                                        <div key={lesson.id} className="p-5 rounded-2xl border border-gray-100 bg-gray-50/30 hover:bg-white hover:shadow-lg hover:shadow-gray-100 transition-all group">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{lesson.title}</h3>
                                                <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-500">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                    {lesson.vocabularyCount} Từ vựng
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-500">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                                    {lesson.grammarPointCount} Ngữ pháp
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="col-span-full py-20 text-center text-gray-400 italic">Không tìm thấy thông tin import.</div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'vocab' && (
                                <div className="space-y-3">
                                    {vocab?.content && vocab.content.length > 0 ? vocab.content.map((v) => (
                                        <div key={v.id} className="p-4 rounded-xl border border-gray-100 flex items-center gap-6 hover:bg-gray-50 transition-colors">
                                            <div className="min-w-[150px]">
                                                <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-0.5">{v.reading}</p>
                                                <p className="text-lg font-black text-gray-900 leading-tight">{v.kanjiWriting || v.japaneseText}</p>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-700">{v.meaningVi}</p>
                                                {v.usageNotes && <p className="text-xs text-gray-400 italic mt-1 font-medium">{v.usageNotes}</p>}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-20 text-center text-gray-400 italic font-medium">Không tìm thấy thông tin import.</div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'grammar' && (
                                <div className="space-y-4">
                                    {grammar?.content && grammar.content.length > 0 ? grammar.content.map((g) => (
                                        <div key={g.id} className="p-6 rounded-2xl border border-gray-100 bg-purple-50/20">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Ngữ pháp</span>
                                                <h3 className="font-bold text-gray-900">{g.pattern}</h3>
                                            </div>
                                            <div className="space-y-3 pl-4 border-l-2 border-purple-100">
                                                <div>
                                                    <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Giải thích</p>
                                                    <p className="text-sm text-gray-600 font-medium">{g.shortExplanation}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-20 text-center text-gray-400 italic font-medium">Không tìm thấy thông tin import.</div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
