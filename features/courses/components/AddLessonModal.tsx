'use client';

import React, { useState, useEffect } from 'react';
import { lessonService } from '@/features/courses/services/lesson.service';
import { validateLessonForm, LessonFormData } from '../utils/validation';
import VocabTab from './lesson-detail/VocabTab';
import GrammarTab from './lesson-detail/GrammarTab';
import { VocabItem, GrammarItem } from './lesson-detail/types';
import Toast, { ToastType } from '@/shared/components/Toast';

interface AddLessonModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    onSuccess?: () => void;
}

export default function AddLessonModal({ isOpen, onClose, courseId, onSuccess }: AddLessonModalProps) {
    const [step, setStep] = useState<'info' | 'content'>('info');
    const [lessonId, setLessonId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState<'vocab' | 'grammar'>('vocab');

    const [formData, setFormData] = useState<LessonFormData>({
        title: '',
        description: ''
    });

    const [vocabs, setVocabs] = useState<VocabItem[]>([]);
    const [grammars, setGrammars] = useState<GrammarItem[]>([]);

    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '', type: 'success', isVisible: false
    });

    useEffect(() => {
        if (isOpen) {
            setStep('info');
            setLessonId(null);
            setFormData({ title: '', description: '' });
            setErrors({});
            setVocabs([]);
            setGrammars([]);
            setActiveTab('vocab');
        }
    }, [isOpen]);

    const handleNext = async () => {
        const { isValid, errors: newErrors } = validateLessonForm(formData);
        if (!isValid) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            const result = await lessonService.createLesson({
                ...formData,
                courseId,
                orderIndex: 0 // Default order index, backend might handle this
            });
            setLessonId(result.id);
            setStep('content');
            setToast({ message: 'Đã khởi tạo bài học thành công! Bây giờ bạn có thể thêm nội dung.', type: 'success', isVisible: true });
        } catch (error: any) {
            setToast({ message: error.message || 'Lỗi khi tạo bài học', type: 'error', isVisible: true });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinish = () => {
        onSuccess?.();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Toast
                message={toast.message} type={toast.type}
                isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />
            
            <div className={`bg-white rounded-2xl shadow-xl w-full ${step === 'info' ? 'max-w-xl' : 'max-w-5xl'} flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200 transition-all`}>
                
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {step === 'info' ? 'Thêm bài học mới' : `Thêm nội dung: ${formData.title}`}
                        </h2>
                        {step === 'content' && (
                            <p className="text-sm text-gray-500 mt-1">Sử dụng các tab bên dưới để thêm từ vựng và ngữ pháp cho bài học</p>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 'info' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề bài học *</label>
                                <input
                                    type="text"
                                    placeholder="Ví dụ: Bài 1 - Chào hỏi"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className={`w-full px-4 py-3 bg-gray-50 border ${errors.title ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A8C] text-sm text-gray-900`}
                                />
                                {errors.title && <p className="text-xs text-red-500 mt-1.5 ml-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả (Không bắt buộc)</label>
                                <textarea
                                    rows={4}
                                    placeholder="Nhập mô tả ngắn gọn về bài học này..."
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className={`w-full px-4 py-3 bg-gray-50 border ${errors.description ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A8C] text-sm text-gray-900 resize-none`}
                                />
                                {errors.description && <p className="text-xs text-red-500 mt-1.5 ml-1">{errors.description}</p>}
                            </div>
                        </div>
                    )}

                    {step === 'content' && lessonId && (
                        <div className="space-y-6 min-h-[400px]">
                            {/* Tabs Switcher */}
                            <div className="flex border-b border-gray-100">
                                <button
                                    onClick={() => setActiveTab('vocab')}
                                    className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'vocab' ? 'border-[#253A8C] text-[#253A8C]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                >
                                    Từ vựng ({vocabs.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('grammar')}
                                    className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'grammar' ? 'border-[#253A8C] text-[#253A8C]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                >
                                    Ngữ pháp ({grammars.length})
                                </button>
                            </div>

                            {/* Tabs Content */}
                            <div className="mt-4">
                                {activeTab === 'vocab' && (
                                    <VocabTab
                                        lessonId={lessonId}
                                        vocabs={vocabs}
                                        setVocabs={setVocabs}
                                        isLoading={false}
                                        setToast={setToast}
                                    />
                                )}
                                {activeTab === 'grammar' && (
                                    <GrammarTab
                                        lessonId={lessonId}
                                        grammars={grammars}
                                        setGrammars={setGrammars}
                                        setToast={setToast}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-b-2xl">
                    <div className="text-sm text-gray-500 italic">
                        {step === 'info' ? '* Các trường bắt buộc' : 'Nội dung được lưu tự động khi bạn nhấn "Lưu" ở mỗi mục.'}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        {step === 'info' ? (
                            <button
                                onClick={handleNext}
                                disabled={isLoading}
                                className="px-8 py-2.5 bg-[#253A8C] text-white text-sm font-medium rounded-lg hover:bg-[#1e2e70] transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        Tiếp tục
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleFinish}
                                className="px-8 py-2.5 bg-[#253A8C] text-white text-sm font-medium rounded-lg hover:bg-[#1e2e70] transition-colors"
                            >
                                Hoàn tất
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
