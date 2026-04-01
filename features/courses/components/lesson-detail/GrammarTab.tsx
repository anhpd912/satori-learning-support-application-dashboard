import React, { useState, useRef, useEffect } from 'react';
import { ToastType } from '@/shared/components/Toast';
import { GrammarItem } from './types';
import { lessonService } from '@/features/courses/services/lesson.service';
import ConfirmModal from '@/shared/components/ConfirmModal';

interface GrammarTabProps {
    lessonId: string;
    grammars: GrammarItem[];
    setGrammars: React.Dispatch<React.SetStateAction<GrammarItem[]>>;
    setToast: React.Dispatch<React.SetStateAction<{ message: string; type: ToastType; isVisible: boolean }>>;
}

export default function GrammarTab({ lessonId, grammars, setGrammars, setToast }: GrammarTabProps) {
    const [expandedGrammarIds, setExpandedGrammarIds] = useState<Set<string>>(new Set(['g1']));
    const [editingGrammarId, setEditingGrammarId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<GrammarItem | null>(null);
    const editFormRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editingGrammarId?.startsWith('new_') && editFormRef.current) {
            editFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [editingGrammarId]);

    // Xử lý Modal Xóa
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [grammarToDelete, setGrammarToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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
            const grammarId = editFormData.id;
            const isNew = grammarId.startsWith('new_');

            if (isNew) {
                const exampleData = editFormData.examples.map(ex => ({
                    jp: ex.japanese,
                    vi: ex.vietnamese,
                    en: ""
                }));

                const createReq = {
                    lessonId: lessonId,
                    pattern: editFormData.structure,
                    shortExplanation: editFormData.shortDesc || "",
                    detailedExplanation: editFormData.explanation,
                    exampleSentences: JSON.stringify(exampleData)
                };

                const newGrammarData = await lessonService.createGrammarPoint(createReq);
                
                const updatedItem: GrammarItem = {
                    ...editFormData,
                    id: newGrammarData.id,
                    originalData: newGrammarData
                };

                setGrammars(prev => prev.map(g => g.id === grammarId ? updatedItem : g));
                setToast({ message: 'Thêm ngữ pháp mới thành công!', type: 'success', isVisible: true });
            } else {
                const exampleData = editFormData.examples.map(ex => ({
                    jp: ex.japanese,
                    vi: ex.vietnamese,
                    en: ""
                }));

                const updateReq = {
                    ...editFormData.originalData,
                    pattern: editFormData.structure,
                    shortExplanation: editFormData.shortDesc,
                    detailedExplanation: editFormData.explanation,
                    exampleSentences: JSON.stringify(exampleData)
                };

                await lessonService.updateGrammarPoint(grammarId, updateReq);

                setGrammars(prev => prev.map(g => g.id === editFormData.id ? editFormData : g));
                setToast({ message: 'Cập nhật ngữ pháp thành công!', type: 'success', isVisible: true });
            }
            setEditingGrammarId(null);
            setEditFormData(null);
        } catch (error) {
            console.error(error);
            setToast({ message: 'Lỗi khi lưu ngữ pháp!', type: 'error', isVisible: true });
        }
    };

    const handleAddExample = () => {
        if (!editFormData) return;
        setEditFormData(prev => ({
            ...prev!, examples: [...prev!.examples, { id: `newex_${Date.now()}`, japanese: '', vietnamese: '' }]
        }));
    };

    const handleAddGrammar = () => {
        const newId = `new_${Date.now()}`;
        const newGrammar: GrammarItem = {
            id: newId,
            order: grammars.length + 1,
            structure: '',
            shortDesc: '',
            explanation: '',
            examples: []
        };
        
        setGrammars(prev => [...prev, newGrammar]);
        setEditingGrammarId(newId);
        setEditFormData(newGrammar);
        setExpandedGrammarIds(prev => new Set(prev).add(newId));
    };

    const handleDeleteClick = (grammarId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setGrammarToDelete(grammarId);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!grammarToDelete) return;
        setIsDeleting(true);
        try {
            const isNew = grammarToDelete.startsWith('new_');
            if (!isNew) {
                await lessonService.deleteGrammarPoint(grammarToDelete);
            }
            setGrammars(prev => prev.filter(g => g.id !== grammarToDelete));
            setToast({ message: 'Xóa ngữ pháp thành công!', type: 'success', isVisible: true });
        } catch (error) {
            setToast({ message: 'Lỗi khi xóa ngữ pháp!', type: 'error', isVisible: true });
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setGrammarToDelete(null);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8 animate-in fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Danh sách ngữ pháp ({grammars.length} cấu trúc)</h2>
                <button 
                    onClick={handleAddGrammar}
                    className="px-4 py-2 bg-[#253A8C] text-white text-sm font-medium rounded-lg hover:bg-[#1e2e70] transition-colors"
                >
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
                                <div ref={editFormRef} className="p-5 animate-in fade-in">
                                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">{grammar.order}</div>
                                        <h3 className="font-bold text-gray-900">Chỉnh sửa cấu trúc</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1.5">Cấu trúc ngữ pháp *</label>
                                                <input type="text" value={editFormData.structure} onChange={(e) => setEditFormData({...editFormData, structure: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-900" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1.5">Giải thích *</label>
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
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-gray-400 shrink-0 ml-4">
                                            <button onClick={(e) => handleEditGrammarClick(grammar, e)} className="hover:text-blue-600 transition-colors p-1" title="Sửa">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                            </button>
                                            <button 
                                                onClick={(e) => handleDeleteClick(grammar.id, e)}
                                                className="hover:text-red-500 transition-colors p-1" title="Xóa"
                                            >
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

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title="Xác nhận xóa ngữ pháp"
                message="Bạn có chắc chắn muốn xóa cấu trúc ngữ pháp này không? Hành động này không thể hoàn tác."
                confirmText="Xóa"
                variant="danger"
            />
        </div>
    );
}

