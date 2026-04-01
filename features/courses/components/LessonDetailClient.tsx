'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import Toast, { ToastType } from '@/shared/components/Toast';
import { VocabItem, GrammarItem } from './lesson-detail/types';
import VocabTab from './lesson-detail/VocabTab';
import GrammarTab from './lesson-detail/GrammarTab';
import { lessonService } from '@/features/courses/services/lesson.service';
import { courseService } from '@/features/courses/services/course.service';

// ==========================================
// MOCK DATA
// ==========================================
interface LessonInfo {
    id: string;
    title: string;
    status: string;
    description: string;
    vocabCount: number;
    grammarCount: number;
    originalData?: any;
}

const MOCK_LESSON_INFO: LessonInfo = {
    id: 'lesson_1',
    title: 'Bài 1',
    status: 'Bản nháp',
    description: 'Bài 1: Chào hỏi và giới thiệu bản thân cơ bản trong tiếng Nhật. Học viên sẽ làm quen với các nghi thức chào hỏi thông thường, cách xưng hô và các mẫu câu giới thiệu tên, quốc tịch, nghề nghiệp cơ bản nhất (S + wa + N + desu).',
    vocabCount: 24,
    grammarCount: 4,
};

const MOCK_VOCABS: VocabItem[] = [
    { id: '1', japaneseText: '私', reading: 'わたし', meaning: 'Tôi' },
    { id: '2', japaneseText: 'あなた', reading: '', meaning: 'Anh/Chị/Bạn' },
    { id: '3', japaneseText: '学生', reading: 'がくせい', meaning: 'Học sinh, sinh viên' },
    { id: '4', japaneseText: '先生', reading: 'せんせい', meaning: 'Thầy cô giáo' },
];

const MOCK_GRAMMARS: GrammarItem[] = [
    {
        id: 'g1',
        order: 1,
        structure: 'N1 は N2 です',
        explanation: 'Trợ từ 「は」 biểu thị rằng danh từ đứng trước nó là chủ đề của câu. 「です」 đứng sau danh từ làm vị ngữ để biểu thị sự phán đoán hoặc khẳng định. Nó cũng biểu hiện thái độ lịch sự của người nói đối với người nghe.',
        examples: [
            { id: 'ex1', japanese: 'わたしは　マイク・ミラーです休。', vietnamese: 'Tôi là Mike Miller.' },
            { id: 'ex2', japanese: 'わたしは　会社員です。', vietnamese: 'Tôi là nhân viên công ty.' }
        ]
    },
    {
        id: 'g2',
        order: 2,
        structure: 'N1 は N2 じゃありません',
        shortDesc: '(Phủ định của N1 は N2 です)',
        explanation: 'Đây là dạng phủ định của 「です」...',
        examples: []
    }
];

interface LessonDetailClientProps {
    courseId: string;
    lessonId: string;
    importId?: string | null;
}

export default function LessonDetailClient({ courseId, lessonId, importId }: LessonDetailClientProps) {
    const router = useRouter();

    const [courseName, setCourseName] = useState('...');

    const [lessonInfo, setLessonInfo] = useState<LessonInfo>(MOCK_LESSON_INFO);
    const [vocabs, setVocabs] = useState<VocabItem[]>([]);
    const [grammars, setGrammars] = useState<GrammarItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'VOCAB' | 'GRAMMAR'>('VOCAB');

    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [editInfoForm, setEditInfoForm] = useState<LessonInfo>(MOCK_LESSON_INFO);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '', type: 'success', isVisible: false
    });

    useEffect(() => {
        const fetchLessonDetail = async () => {
            setIsLoading(true);
            try {
                // Lấy thông tin khóa học
                const courseData = await courseService.getCourseById(courseId);
                setCourseName(courseData.name);

                const [data, vocabularyData, grammarData] = await Promise.all([
                    lessonService.getLessonById(lessonId),
                    lessonService.getVocabularyByLesson(lessonId),
                    lessonService.getGrammarByLesson(lessonId)
                ]);
                
                setLessonInfo({
                    id: data.id,
                    title: data.title,
                    status: data.status === 'PUBLISHED' ? 'Đang mở' : data.status === 'DRAFT' ? 'Bản nháp' : data.status === 'ARCHIVED' ? 'Đã lưu trữ' : data.status,
                    description: data.description || '',
                    vocabCount: data.vocabularyCount,
                    grammarCount: data.grammarPointCount,
                    originalData: data
                });
                
                const mappedVocabs: VocabItem[] = vocabularyData.map((v: any) => ({
                    id: v.id,
                    japaneseText: v.japaneseText || '',
                    reading: v.reading || '',
                    meaning: v.meaningVi || '',
                    originalData: v
                }));

                const mappedGrammars: GrammarItem[] = grammarData.map((g: any, index: number) => {
                    let parsedExamples: any[] = [];
                    try {
                        if (g.exampleSentences) {
                            parsedExamples = JSON.parse(g.exampleSentences);
                        }
                    } catch (e) {
                        console.error("Lỗi khi parse ví dụ ngữ pháp:", e);
                    }

                    return {
                        id: g.id,
                        order: index + 1,
                        structure: g.pattern || '',
                        shortDesc: g.shortExplanation || '',
                        explanation: g.detailedExplanation || '',
                        examples: Array.isArray(parsedExamples) ? parsedExamples.map((ex: any, i: number) => ({
                            id: `ex_${index}_${i}`,
                            japanese: ex.jp || '',
                            vietnamese: ex.vi || ''
                        })) : [],
                        originalData: g
                    };
                });

                setVocabs(mappedVocabs);
                setGrammars(mappedGrammars);
            } catch (error) {
                setToast({ message: 'Lỗi tải dữ liệu bài học', type: 'error', isVisible: true });
            } finally {
                setIsLoading(false);
            }
        };
        fetchLessonDetail();
    }, [lessonId]);

    const handleEditInfoClick = () => {
        setEditInfoForm({ ...lessonInfo });
        setIsEditingInfo(true);
    };

    const handleSaveInfo = async () => {
        try {
            const statusMap: Record<string, string> = {
                'Đang mở': 'PUBLISHED',
                'Bản nháp': 'DRAFT',
                'Đã lưu trữ': 'ARCHIVED'
            };

            const updateReq = {
                ...lessonInfo.originalData,
                title: editInfoForm.title,
                description: editInfoForm.description,
                status: statusMap[editInfoForm.status] || editInfoForm.status
            };

            await lessonService.updateLesson(lessonId, updateReq);

            setLessonInfo({ ...editInfoForm, originalData: { ...lessonInfo.originalData, ...updateReq } });
            setIsEditingInfo(false);
            setToast({ message: 'Cập nhật thông tin thành công!', type: 'success', isVisible: true });
        } catch (error) {
            console.error("Lỗi khi lưu thông tin bài học:", error);
            setToast({ message: 'Lỗi khi lưu thông tin!', type: 'error', isVisible: true });
        }
    };

    const handleUpdateStatus = async (newStatus: 'PUBLISHED' | 'ARCHIVED') => {
        setIsUpdatingStatus(true);
        try {
            let updatedData;
            if (newStatus === 'PUBLISHED') {
                updatedData = await lessonService.publishLesson(lessonId);
            } else {
                updatedData = await lessonService.archiveLesson(lessonId);
            }

            const statusTextMap: Record<string, string> = {
                'PUBLISHED': 'Đang mở',
                'DRAFT': 'Bản nháp',
                'ARCHIVED': 'Đã lưu trữ'
            };

            setLessonInfo(prev => ({
                ...prev,
                status: statusTextMap[newStatus] || newStatus,
                originalData: updatedData // Cập nhật lại originalData từ response mới nhất
            }));

            setToast({ 
                message: newStatus === 'PUBLISHED' ? 'Xuất bản bài học thành công!' : 'Hủy xuất bản thành công!', 
                type: 'success', 
                isVisible: true 
            });
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái bài học:", error);
            setToast({ message: 'Lỗi khi cập nhật trạng thái!', type: 'error', isVisible: true });
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    if (isLoading && !lessonInfo) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen flex justify-center items-center w-full">
                <span className="w-8 h-8 border-4 border-[#253A8C] border-t-transparent rounded-full animate-spin"></span>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans w-full pb-20">
            <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />

            {/* BREADCRUMB & HEADER */}
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 font-medium">
                        <Link href="/courses" className="hover:text-gray-900 transition-colors">Quản lí khóa học</Link>
                        <span className="mx-1 text-gray-400">/</span>
                        <Link href={`/courses/${courseId}`} className="hover:text-gray-900 transition-colors">{courseName}</Link>
                        <span className="mx-1 text-gray-400">/</span>
                        <Link href={`/courses/${courseId}/lessons${importId ? `?importId=${importId}` : ''}`} className="hover:text-gray-900 transition-colors">
                            {importId ? 'Review Import' : 'Quản lý bài học'}
                        </Link>
                        <span className="mx-1 text-gray-400">/</span>
                        <span className="text-gray-900 font-bold">{lessonInfo.title}</span>
                    </div>
                    <Link href={`/courses/${courseId}/lessons${importId ? `?importId=${importId}` : ''}`} className="flex items-center gap-2 text-[#253A8C] font-bold text-sm hover:underline group">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        Quay lại {importId ? 'danh sách review' : 'danh sách bài học'}
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex gap-3 order-first">
                        {lessonInfo.status === 'Đang mở' ? (
                            <button
                                onClick={() => handleUpdateStatus('ARCHIVED')}
                                disabled={isUpdatingStatus}
                                className="px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                            >
                                {isUpdatingStatus ? (
                                    <span className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                                )}
                                Hủy xuất bản
                            </button>
                        ) : (
                            <button
                                onClick={() => handleUpdateStatus('PUBLISHED')}
                                disabled={isUpdatingStatus}
                                className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-bold rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center gap-2 disabled:opacity-50"
                            >
                                {isUpdatingStatus ? (
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                )}
                                Xuất bản
                            </button>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Chi tiết bài học {importId ? <span className="text-indigo-600 ml-2">(Review AI)</span> : ''}</h1>
                </div>
            </div>

            {/* STICKY REVIEW BANNER */}
            {importId && (
                <div className="sticky top-4 z-50 bg-indigo-600 rounded-2xl p-5 mb-8 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl shadow-indigo-100 border border-indigo-400 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        </div>
                        <div>
                            <h3 className="font-bold">Đang xem xét nội dung AI bóc tách</h3>
                            <p className="text-indigo-100 text-xs text-opacity-80">Bạn có thể chỉnh sửa trực tiếp nội dung bài học này bên dưới trước khi phê duyệt toàn bộ batch.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => router.push(`/courses/${courseId}/lessons?importId=${importId}`)}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition-all"
                        >
                            Về danh sách batch
                        </button>
                    </div>
                </div>
            )}

            {/* CARD THÔNG TIN CƠ BẢN */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 relative">
                {isEditingInfo ? (
                    <div className="animate-in fade-in duration-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-5">Chỉnh sửa thông tin cơ bản</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Tiêu đề bài học</label>
                                    <input
                                        type="text" value={editInfoForm.title}
                                        onChange={(e) => setEditInfoForm({ ...editInfoForm, title: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Trạng thái</label>
                                    <select
                                        value={editInfoForm.status}
                                        onChange={(e) => setEditInfoForm({ ...editInfoForm, status: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium text-gray-700"
                                    >
                                        <option value="Đang mở">Đang mở</option>
                                        <option value="Bản nháp">Bản nháp</option>
                                        <option value="Đã lưu trữ">Đã lưu trữ</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5">Mô tả bài học</label>
                                <textarea
                                    rows={3} value={editInfoForm.description}
                                    onChange={(e) => setEditInfoForm({ ...editInfoForm, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-700 leading-relaxed"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                                <button onClick={() => setIsEditingInfo(false)} className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Hủy</button>
                                <button onClick={handleSaveInfo} className="px-5 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 transition-colors">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-200">
                        <button onClick={handleEditInfoClick} className="absolute top-6 right-6 text-gray-400 hover:text-blue-600 transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin cơ bản</h2>
                        <div className="mb-6">
                            <p className="text-sm text-gray-400 mb-1 font-medium">Tiêu đề</p>
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-bold text-gray-900">{lessonInfo.title}</span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                    lessonInfo.status === 'Đang mở' ? 'bg-green-100 text-green-700' :
                                    lessonInfo.status === 'Bản nháp' ? 'bg-orange-100 text-orange-700' :
                                    'bg-gray-100 text-gray-500'
                                }`}>
                                    {lessonInfo.status}
                                </span>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 mb-2 font-medium">Mô tả bài học</p>
                            <p className="text-gray-600 leading-relaxed text-sm">{lessonInfo.description}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* HỆ THỐNG TABS */}
            <div className="flex border-b border-gray-200 mb-6">
                <button onClick={() => setActiveTab('VOCAB')} className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors relative ${activeTab === 'VOCAB' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg> Từ vựng
                    {activeTab === 'VOCAB' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-md"></div>}
                </button>
                <button onClick={() => setActiveTab('GRAMMAR')} className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors relative ${activeTab === 'GRAMMAR' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg> Ngữ pháp
                    {activeTab === 'GRAMMAR' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-md"></div>}
                </button>
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'VOCAB' && (
                <VocabTab 
                    lessonId={lessonId}
                    vocabs={vocabs} 
                    setVocabs={setVocabs} 
                    isLoading={isLoading} 
                    setToast={setToast} 
                />
            )}

            {activeTab === 'GRAMMAR' && (
                <GrammarTab 
                    lessonId={lessonId}
                    grammars={grammars} 
                    setGrammars={setGrammars} 
                    setToast={setToast} 
                />
            )}

            {/* THẺ THỐNG KÊ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-6">
                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 8 6 6"></path><path d="m4 14 6-6 2-3"></path><path d="M2 5h12"></path><path d="M7 2h1"></path><path d="m22 22-5-10-5 10"></path><path d="M14 18h6"></path></svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">Tổng số từ vựng</p>
                        <p className="text-3xl font-bold text-gray-900">{vocabs.length}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-6">
                    <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-500 shrink-0">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">Cấu trúc ngữ pháp</p>
                        <p className="text-3xl font-bold text-gray-900">{grammars.length}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
