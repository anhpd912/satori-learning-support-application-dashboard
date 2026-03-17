import React, { useState, useMemo } from 'react';
import CommonTable, { Column } from '@/shared/components/CommonTable';
import Pagination from '@/shared/components/Pagination';
import { ToastType } from '@/shared/components/Toast';
import { VocabItem } from './types';

const ITEMS_PER_PAGE = 4;

interface VocabTabProps {
    vocabs: VocabItem[];
    setVocabs: React.Dispatch<React.SetStateAction<VocabItem[]>>;
    isLoading: boolean;
    setToast: React.Dispatch<React.SetStateAction<{ message: string; type: ToastType; isVisible: boolean }>>;
}

export default function VocabTab({ vocabs, setVocabs, isLoading, setToast }: VocabTabProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const totalItems = vocabs.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const [editingVocabId, setEditingVocabId] = useState<string | null>(null);
    const [editVocabForm, setEditVocabForm] = useState<VocabItem | null>(null);

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
    ], [editingVocabId, editVocabForm, handleSaveVocab]);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8 animate-in fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Danh sách từ vựng ({vocabs.length} từ)</h2>
                <button className="px-4 py-2 bg-[#253A8C] text-white text-sm font-medium rounded-lg hover:bg-[#1e2e70] transition-colors">
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
        </div>
    );
}
