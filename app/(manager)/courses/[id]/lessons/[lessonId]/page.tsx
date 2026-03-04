'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

import CommonTable, { Column } from '@/shared/components/CommonTable';
import Pagination from '@/shared/components/Pagination';
import Toast, { ToastType } from '@/shared/components/Toast';

// ==========================================
// 1. INTERFACES & MOCK DATA
// ==========================================
interface VocabItem {
    id: string;
    hiragana: string;
    kanji: string;
    meaning: string;
    example: string;
}

interface GrammarExample {
    id: string;
    japanese: string;
    vietnamese: string;
}

interface GrammarItem {
    id: string;
    order: number;
    structure: string;
    shortDesc?: string;
    explanation: string;
    examples: GrammarExample[];
}

const MOCK_LESSON_INFO = {
    id: 'lesson_1',
    title: 'Bài 1',
    status: 'Bản nháp',
    description: 'Bài 1: Chào hỏi và giới thiệu bản thân cơ bản trong tiếng Nhật. Học viên sẽ làm quen với các nghi thức chào hỏi thông thường, cách xưng hô và các mẫu câu giới thiệu tên, quốc tịch, nghề nghiệp cơ bản nhất (S + wa + N + desu).',
    vocabCount: 24,
    grammarCount: 4,
};

const MOCK_VOCABS: VocabItem[] = [
    { id: '1', hiragana: 'わたし', kanji: '私', meaning: 'Tôi', example: 'わたしは学生です。' },
    { id: '2', hiragana: 'あなた', kanji: '-', meaning: 'Anh/Chị/Bạn', example: 'あなたはお名前は何ですか？' },
    { id: '3', hiragana: 'がくせい', kanji: '学生', meaning: 'Học sinh, sinh viên', example: 'わたしはハノイ大学の学生です。' },
    { id: '4', hiragana: 'せんせい', kanji: '先生', meaning: 'Thầy cô giáo', example: '先生、おはようございます。' },
];

const MOCK_GRAMMARS: GrammarItem[] = [
    {
        id: 'g1',
        order: 1,
        structure: 'N1 は N2 です',
        explanation: 'Trợ từ 「は」 biểu thị rằng danh từ đứng trước nó là chủ đề của câu. 「です」 đứng sau danh từ làm vị ngữ để biểu thị sự phán đoán hoặc khẳng định. Nó cũng biểu hiện thái độ lịch sự của người nói đối với người nghe.',
        examples: [
            { id: 'ex1', japanese: 'わたしは　マイク・ミラーです。', vietnamese: 'Tôi là Mike Miller.' },
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

const ITEMS_PER_PAGE = 4;

// ==========================================
// 2. MAIN COMPONENT
// ==========================================
export default function LessonDetailPage() {
    const router = useRouter();
    const params = useParams();
    const courseId = params?.courseId as string;
    const lessonId = params?.lessonId as string;

    const courseName = "N1"; 

    // --- STATES DỮ LIỆU CƠ BẢN ---
    const [lessonInfo, setLessonInfo] = useState(MOCK_LESSON_INFO);
    const [vocabs, setVocabs] = useState<VocabItem[]>([]);
    const [grammars, setGrammars] = useState<GrammarItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'VOCAB' | 'GRAMMAR'>('VOCAB');
    
    // --- STATES PHÂN TRANG ---
    const [currentPage, setCurrentPage] = useState(1);
    const totalItems = vocabs.length || MOCK_LESSON_INFO.vocabCount;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    // --- STATES INLINE EDIT: THÔNG TIN CƠ BẢN ---
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [editInfoForm, setEditInfoForm] = useState(MOCK_LESSON_INFO);

    // --- STATES INLINE EDIT: TỪ VỰNG ---
    const [editingVocabId, setEditingVocabId] = useState<string | null>(null);
    const [editVocabForm, setEditVocabForm] = useState<VocabItem | null>(null);

    // --- STATES INLINE EDIT: NGỮ PHÁP ---
    const [expandedGrammarIds, setExpandedGrammarIds] = useState<Set<string>>(new Set(['g1']));
    const [editingGrammarId, setEditingGrammarId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<GrammarItem | null>(null);

    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '', type: 'success', isVisible: false
    });

    // --- GỌI API BAN ĐẦU ---
    useEffect(() => {
        const fetchLessonDetail = async () => {
            setIsLoading(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                setLessonInfo(MOCK_LESSON_INFO);
                setVocabs(MOCK_VOCABS);
                setGrammars(MOCK_GRAMMARS);
            } catch (error) {
                setToast({ message: 'Lỗi tải dữ liệu bài học', type: 'error', isVisible: true });
            } finally {
                setIsLoading(false);
            }
        };
        fetchLessonDetail();
    }, [lessonId]);

    // ==========================================
    // HÀM XỬ LÝ EDIT: THÔNG TIN CƠ BẢN
    // ==========================================
    const handleEditInfoClick = () => {
        setEditInfoForm({ ...lessonInfo });
        setIsEditingInfo(true);
    };

    const handleSaveInfo = async () => {
        try {
            // TODO: API Save Info
            setLessonInfo(editInfoForm);
            setIsEditingInfo(false);
            setToast({ message: 'Cập nhật thông tin thành công!', type: 'success', isVisible: true });
        } catch (error) {
            setToast({ message: 'Lỗi khi lưu thông tin!', type: 'error', isVisible: true });
        }
    };

    // ==========================================
    // HÀM XỬ LÝ EDIT: TỪ VỰNG
    // ==========================================
    const handleEditVocabClick = (vocab: VocabItem) => {
        setEditingVocabId(vocab.id);
        setEditVocabForm({ ...vocab });
    };

    const handleSaveVocab = async () => {
        if (!editVocabForm) return;
        try {
            // TODO: API Save Vocab
            setVocabs(prev => prev.map(v => v.id === editVocabForm.id ? editVocabForm : v));
            setEditingVocabId(null);
            setEditVocabForm(null);
            setToast({ message: 'Cập nhật từ vựng thành công!', type: 'success', isVisible: true });
        } catch (error) {
            setToast({ message: 'Lỗi khi lưu từ vựng!', type: 'error', isVisible: true });
        }
    };

    const vocabColumns = useMemo<Column<VocabItem>[]>(() => [
        {
            header: 'Từ vựng (Hiragana)',
            render: (item) => editingVocabId === item.id ? (
                <input 
                    type="text" value={editVocabForm?.hiragana} 
                    onChange={(e) => setEditVocabForm(prev => ({...prev!, hiragana: e.target.value}))} 
                    className="w-full px-2 py-1.5 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium text-blue-600 bg-blue-50/50" 
                />
            ) : <span className="text-blue-500 font-medium">{item.hiragana}</span>
        },
        {
            header: 'Kanji',
            render: (item) => editingVocabId === item.id ? (
                <input 
                    type="text" value={editVocabForm?.kanji} 
                    onChange={(e) => setEditVocabForm(prev => ({...prev!, kanji: e.target.value}))} 
                    className="w-full px-2 py-1.5 text-gray-900 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold bg-blue-50/50" 
                />
            ) : <span className="font-bold text-gray-900">{item.kanji}</span>
        },
        {
            header: 'Nghĩa tiếng Việt',
            render: (item) => editingVocabId === item.id ? (
                <input 
                    type="text" value={editVocabForm?.meaning} 
                    onChange={(e) => setEditVocabForm(prev => ({...prev!, meaning: e.target.value}))} 
                    className="w-full px-2 py-1.5 text-gray-900 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-blue-50/50" 
                />
            ) : <span className="text-gray-600 text-sm">{item.meaning}</span>
        },
        {
            header: 'Ví dụ',
            render: (item) => editingVocabId === item.id ? (
                <input 
                    type="text" value={editVocabForm?.example} 
                    onChange={(e) => setEditVocabForm(prev => ({...prev!, example: e.target.value}))} 
                    className="w-full px-2 py-1.5 text-gray-900 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-blue-50/50" 
                />
            ) : <span className="text-gray-600 text-sm">{item.example}</span>
        },
        {
            header: 'Hành động',
            className: 'text-right',
            render: (item) => editingVocabId === item.id ? (
                <div className="flex items-center justify-end gap-2">
                    <button onClick={handleSaveVocab} className="p-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded transition-colors" title="Lưu">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </button>
                    <button onClick={() => setEditingVocabId(null)} className="p-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded transition-colors" title="Hủy">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-end gap-4 text-gray-400">
                    <button onClick={() => handleEditVocabClick(item)} className="hover:text-blue-600 transition-colors" title="Sửa">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button className="hover:text-red-500 transition-colors" title="Xóa">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            )
        }
    ], [editingVocabId, editVocabForm]);

    // ==========================================
    // HÀM XỬ LÝ EDIT: NGỮ PHÁP
    // ==========================================
    const toggleGrammar = (id: string) => {
        setExpandedGrammarIds(prev => {
            const newSet = new Set(prev);
            newSet.has(id) ? newSet.delete(id) : newSet.add(id);
            return newSet;
        });
    };

    const handleEditGrammarClick = (grammar: GrammarItem, e: React.MouseEvent) => {
        e.stopPropagation(); 
        setEditingGrammarId(grammar.id);
        setEditFormData(JSON.parse(JSON.stringify(grammar)));
        setExpandedGrammarIds(prev => new Set(prev).add(grammar.id));
    };

    const handleSaveGrammar = async () => {
        if (!editFormData) return;
        try {
            // TODO: API Save Grammar
            setGrammars(prev => prev.map(g => g.id === editFormData.id ? editFormData : g));
            setEditingGrammarId(null);
            setEditFormData(null);
            setToast({ message: 'Cập nhật ngữ pháp thành công!', type: 'success', isVisible: true });
        } catch (error) {
            setToast({ message: 'Lỗi khi lưu ngữ pháp!', type: 'error', isVisible: true });
        }
    };

    const handleAddExample = () => {
        if (!editFormData) return;
        setEditFormData(prev => ({
            ...prev!, examples: [...prev!.examples, { id: `new_${Date.now()}`, japanese: '', vietnamese: '' }]
        }));
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
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Link href="/courses" className="hover:text-gray-900 transition-colors">Quản lí khóa học</Link>
                        <span className="mx-1 text-gray-400">{'>'}</span> 
                        <Link href={`/courses/${courseId}`} className="hover:text-gray-900 transition-colors">{courseName}</Link>
                        <span className="mx-1 text-gray-400">{'>'}</span> 
                        <Link href={`/courses/${courseId}/lessons`} className="hover:text-gray-900 transition-colors">Quản lý nội dung bài học</Link>
                        <span className="mx-1 text-gray-400">{'>'}</span> 
                        <span className="text-gray-900 font-medium">{lessonInfo.title}</span>
                    </div>
                    <Link href={`/courses/${courseId}/lessons`} className="flex items-center gap-2 text-[#253A8C] font-medium text-sm hover:underline">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                        Quay lại
                    </Link>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Nội dung chi tiết</h1>
            </div>

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
                                        onChange={(e) => setEditInfoForm({...editInfoForm, title: e.target.value})}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Trạng thái</label>
                                    <select 
                                        value={editInfoForm.status}
                                        onChange={(e) => setEditInfoForm({...editInfoForm, status: e.target.value})}
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
                                    onChange={(e) => setEditInfoForm({...editInfoForm, description: e.target.value})}
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
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin cơ bản</h2>
                        <div className="mb-6">
                            <p className="text-sm text-gray-400 mb-1 font-medium">Tiêu đề</p>
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-bold text-gray-900">{lessonInfo.title}</span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{lessonInfo.status}</span>
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

            {/* TAB CONTENT: TỪ VỰNG */}
            {activeTab === 'VOCAB' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8 animate-in fade-in">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900">Danh sách từ vựng ({vocabs.length} từ)</h2>
                        <button className="px-4 py-2 bg-[#253A8C] text-white text-sm font-medium rounded-lg hover:bg-[#1e2e70] transition-colors">
                            + Thêm từ vựng
                        </button>
                    </div>

                    <CommonTable data={vocabs} columns={vocabColumns} keyExtractor={(item) => item.id} isLoading={isLoading} />
                    
                    {!isLoading && vocabs.length > 0 && (
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={totalItems} itemsPerPage={ITEMS_PER_PAGE} />
                    )}
                </div>
            )}

            {/* TAB CONTENT: NGỮ PHÁP */}
            {activeTab === 'GRAMMAR' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8 animate-in fade-in">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900">Danh sách ngữ pháp ({grammars.length} cấu trúc)</h2>
                        <button className="px-4 py-2 bg-[#253A8C] text-white text-sm font-medium rounded-lg hover:bg-[#1e2e70] transition-colors">
                            + Thêm cấu trúc
                        </button>
                    </div>
                    
                    <div className="p-6 space-y-4">
                        {grammars.map((grammar) => {
                            const isExpanded = expandedGrammarIds.has(grammar.id);
                            const isEditing = editingGrammarId === grammar.id;
                            
                            return (
                                <div key={grammar.id} className={`border rounded-xl transition-all duration-200 overflow-hidden ${isExpanded || isEditing ? 'border-blue-200 shadow-[0_4px_20px_rgba(0,0,0,0.05)] bg-white' : 'border-gray-100 hover:border-gray-300 bg-gray-50/30'}`}>
                                    {isEditing && editFormData ? (
                                        <div className="p-5 animate-in fade-in">
                                            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">{grammar.order}</div>
                                                <h3 className="font-bold text-gray-900">Chỉnh sửa cấu trúc</h3>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Cấu trúc ngữ pháp *</label>
                                                        <input type="text" value={editFormData.structure} onChange={(e) => setEditFormData({...editFormData, structure: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-900" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Mô tả ngắn gọn</label>
                                                        <input type="text" value={editFormData.shortDesc || ''} onChange={(e) => setEditFormData({...editFormData, shortDesc: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-700" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Giải thích chi tiết *</label>
                                                    <textarea rows={3} value={editFormData.explanation} onChange={(e) => setEditFormData({...editFormData, explanation: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-700 leading-relaxed" />
                                                </div>

                                                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <label className="block text-xs font-bold text-gray-500">Các câu ví dụ</label>
                                                        <button type="button" onClick={handleAddExample} className="text-sm font-bold text-blue-600 hover:text-blue-800">+ Thêm ví dụ</button>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {editFormData.examples.map((ex, index) => (
                                                            <div key={ex.id} className="flex gap-3 items-start p-3 bg-white border border-gray-100 rounded-lg">
                                                                <span className="text-gray-400 font-bold text-xs mt-3">#{index + 1}</span>
                                                                <div className="flex-1 space-y-2">
                                                                    <input type="text" placeholder="Tiếng Nhật" value={ex.japanese} onChange={(e) => {
                                                                        setEditFormData(prev => ({...prev!, examples: prev!.examples.map(x => x.id === ex.id ? {...x, japanese: e.target.value} : x)}))
                                                                    }} className="w-full text-gray-900 px-3 py-1.5 border border-gray-200 rounded-md text-sm font-bold focus:ring-1 focus:ring-blue-500 outline-none" />
                                                                    <input type="text" placeholder="Nghĩa tiếng Việt" value={ex.vietnamese} onChange={(e) => {
                                                                        setEditFormData(prev => ({...prev!, examples: prev!.examples.map(x => x.id === ex.id ? {...x, vietnamese: e.target.value} : x)}))
                                                                    }} className="w-full text-gray-900 px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-600 focus:ring-1 focus:ring-blue-500 outline-none" />
                                                                </div>
                                                                <button onClick={() => setEditFormData(prev => ({...prev!, examples: prev!.examples.filter(x => x.id !== ex.id)}))} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg mt-1 transition-colors">
                                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex justify-end gap-3 pt-4">
                                                    <button onClick={() => setEditingGrammarId(null)} className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Hủy</button>
                                                    <button onClick={handleSaveGrammar} className="px-5 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 transition-colors">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Lưu thay đổi
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-between p-5 cursor-pointer" onClick={() => toggleGrammar(grammar.id)}>
                                                <div className="flex items-center gap-4">
                                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 font-bold text-xs rounded-md shrink-0">Cấu trúc {grammar.order}</span>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="font-bold text-gray-900 text-base">{grammar.structure}</h3>
                                                        {grammar.shortDesc && <span className="text-gray-500 text-sm font-medium">{grammar.shortDesc}</span>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-gray-400 shrink-0 ml-4">
                                                    <button onClick={(e) => handleEditGrammarClick(grammar, e)} className="hover:text-blue-600 transition-colors p-1" title="Sửa">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                    </button>
                                                    <button className="hover:text-red-500 transition-colors p-1" title="Xóa">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                    </button>
                                                    <div className="w-px h-5 bg-gray-200 mx-1"></div>
                                                    <button className="p-1">
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                                                    </button>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="px-5 pb-5 pt-2 border-t border-gray-50 flex flex-col md:flex-row gap-8 animate-in slide-in-from-top-2">
                                                    <div className="flex-1">
                                                        <p className="text-xs font-bold text-gray-400 mb-2">Giải thích</p>
                                                        <p className="text-sm text-gray-600 leading-relaxed text-justify whitespace-pre-wrap">{grammar.explanation}</p>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-bold text-gray-400 mb-2">Câu ví dụ</p>
                                                        <div className="space-y-3">
                                                            {grammar.examples.map((ex) => (
                                                                <div key={ex.id} className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                                                                    <p className="font-bold text-gray-900 text-sm mb-1">{ex.japanese}</p>
                                                                    <p className="text-gray-500 text-sm">{ex.vietnamese}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
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