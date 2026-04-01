import React, { useState, useMemo } from 'react';
import CommonTable, { Column } from '@/shared/components/CommonTable';
import Pagination from '@/shared/components/Pagination';
import { ToastType } from '@/shared/components/Toast';
import { VocabItem } from './types';
import { lessonService } from '@/features/courses/services/lesson.service';
import ConfirmModal from '@/shared/components/ConfirmModal';

const ITEMS_PER_PAGE = 10;

interface VocabTabProps {
    lessonId: string;
    vocabs: VocabItem[];
    setVocabs: React.Dispatch<React.SetStateAction<VocabItem[]>>;
    isLoading: boolean;
    setToast: React.Dispatch<React.SetStateAction<{ message: string; type: ToastType; isVisible: boolean }>>;
}

export default function VocabTab({ lessonId, vocabs, setVocabs, isLoading, setToast }: VocabTabProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const totalItems = vocabs.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const [editingVocabId, setEditingVocabId] = useState<string | null>(null);
    const [editVocabForm, setEditVocabForm] = useState<VocabItem | null>(null);

    // Xử lý Modal Xóa
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [vocabToDelete, setVocabToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEditVocabClick = (vocab: VocabItem) => {
        setEditingVocabId(vocab.id);
        setEditVocabForm({ ...vocab });
    };

    const handleSaveVocab = async () => {
        if (!editVocabForm) return;
        try {
            const vocabId = editVocabForm.id;
            const isNew = vocabId.startsWith('temp_');

            if (isNew) {
                const createReq = {
                    lessonId: lessonId,
                    japaneseText: editVocabForm.japaneseText,
                    reading: editVocabForm.reading,
                    meaningVi: editVocabForm.meaning,
                    jlptLevel: 'N5' // Default value, should ideally be from context
                };

                const newVocabData = await lessonService.createVocabulary(createReq);
                
                // Cập nhật lại item trong danh sách với ID thực từ backend và originalData
                const updatedItem: VocabItem = {
                    ...editVocabForm,
                    id: newVocabData.id,
                    originalData: newVocabData
                };
                
                setVocabs(prev => prev.map(v => v.id === vocabId ? updatedItem : v));
                setToast({ message: 'Thêm từ vựng thành công!', type: 'success', isVisible: true });
            } else {
                // Chuẩn bị dữ liệu update
                const updateReq = {
                    ...editVocabForm.originalData,
                    japaneseText: editVocabForm.japaneseText,
                    reading: editVocabForm.reading,
                    meaningVi: editVocabForm.meaning
                };

                await lessonService.updateVocabulary(vocabId, updateReq);

                setVocabs(prev => prev.map(v => v.id === editVocabForm.id ? editVocabForm : v));
                setToast({ message: 'Lưu từ vựng thành công!', type: 'success', isVisible: true });
            }

            setEditingVocabId(null);
            setEditVocabForm(null);
        } catch (error) {
            console.error(error);
            setToast({ message: 'Lỗi khi lưu từ vựng!', type: 'error', isVisible: true });
        }
    };

    const handleDeleteClick = (vocabId: string) => {
        setVocabToDelete(vocabId);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!vocabToDelete) return;
        
        setIsDeleting(true);
        try {
            const isNew = vocabToDelete.startsWith('temp_');
            if (!isNew) {
                await lessonService.deleteVocabulary(vocabToDelete);
            }
            
            setVocabs(prev => prev.filter(v => v.id !== vocabToDelete));
            setToast({ message: 'Xóa từ vựng thành công!', type: 'success', isVisible: true });
            
            // Nếu xóa ở trang hiện tại mà không còn data thì lùi lại 1 trang
            const remainingItemsOnPage = vocabs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).length;
            if (remainingItemsOnPage === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        } catch (error) {
            setToast({ message: 'Lỗi khi xóa từ vựng!', type: 'error', isVisible: true });
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setVocabToDelete(null);
        }
    };

    const vocabColumns = useMemo<Column<VocabItem>[]>(() => [
        {
            header: 'Từ vựng',
            render: (item) => editingVocabId === item.id ? (
                <div className="flex flex-col gap-2">
                    <input 
                        type="text" 
                        placeholder="Hiragana (reading)"
                        value={editVocabForm?.reading} 
                        onChange={(e) => setEditVocabForm(prev => ({...prev!, reading: e.target.value}))} 
                        className="w-full px-2 py-1 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500 outline-none text-xs text-blue-600 bg-blue-50/30" 
                    />
                    <input 
                        type="text" 
                        placeholder="Kanji / Japanese text"
                        value={editVocabForm?.japaneseText} 
                        onChange={(e) => setEditVocabForm(prev => ({...prev!, japaneseText: e.target.value}))} 
                        className="w-full px-2 py-1.5 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-900 bg-blue-50/50" 
                    />
                </div>
            ) : (
                <div className="flex flex-col">
                    {item.reading && item.reading !== item.japaneseText && (
                        <span className="text-[10px] leading-tight text-blue-500 font-medium mb-0.5">{item.reading}</span>
                    )}
                    <span className="text-sm font-bold text-gray-900">{item.japaneseText}</span>
                </div>
            )
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
                    <button 
                        onClick={() => handleDeleteClick(item.id)}
                        className="hover:text-red-500 transition-colors" title="Xóa"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            )
        }
    ], [editingVocabId, editVocabForm, handleSaveVocab]);

    const handleAddVocab = () => {
        const newId = `temp_${Date.now()}`;
        const newVocab: VocabItem = {
            id: newId,
            japaneseText: '',
            reading: '',
            meaning: ''
        };
        
        const newVocabs = [...vocabs, newVocab];
        setVocabs(newVocabs);
        
        // Chuyển đến trang cuối cùng
        const newTotalPages = Math.ceil(newVocabs.length / ITEMS_PER_PAGE);
        setCurrentPage(newTotalPages);
        
        // Bật chế độ edit cho dòng mới
        setEditingVocabId(newId);
        setEditVocabForm(newVocab);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8 animate-in fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Danh sách từ vựng ({vocabs.length} từ)</h2>
                <button 
                    onClick={handleAddVocab}
                    className="px-4 py-2 bg-[#253A8C] text-white text-sm font-medium rounded-lg hover:bg-[#1e2e70] transition-colors"
                >
                    + Thêm từ vựng
                </button>
            </div>

            <CommonTable 
                data={vocabs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)} 
                columns={vocabColumns} 
                keyExtractor={(item) => item.id} 
                isLoading={isLoading} 
            />
            
            {!isLoading && vocabs.length > 0 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={totalItems} itemsPerPage={ITEMS_PER_PAGE} />
            )}

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title="Xác nhận xóa"
                message="Bạn có chắc chắn muốn xóa từ vựng này không? Hành động này không thể hoàn tác."
                confirmText="Xóa"
                variant="danger"
            />
        </div>
    );
}
