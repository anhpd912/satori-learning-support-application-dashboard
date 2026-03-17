'use client';

import React, { useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '@/shared/components/PageHeader';
import Toast, { ToastType } from '@/shared/components/Toast';
import { lessonImportService } from '../services/lesson.service';

export default function ImportAIPage() {
    const router = useRouter();
    const params = useParams();
    const courseId = params?.id as string;

    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '', type: 'success', isVisible: false
    });

    // Xử lý khi chọn file
    const handleFileChange = (selectedFile: File) => {
        if (selectedFile.type !== 'application/pdf') {
            setToast({ message: 'Chỉ hỗ trợ định dạng tệp PDF', type: 'error', isVisible: true });
            return;
        }
        if (selectedFile.size > 100 * 1024 * 1024) {
            setToast({ message: 'Dung lượng tệp không được vượt quá 100MB', type: 'error', isVisible: true });
            return;
        }
        setFile(selectedFile);
    };

    // Logic Kéo & Thả
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) handleFileChange(droppedFile);
    };

    // Gửi dữ liệu lên Server
    const handleConfirmUpload = async () => {
        if (!file) return;
        setIsUploading(true);
        
        try {
            const response = await lessonImportService.importByAI(file, courseId);
            console.log('Import initiated:', response);
            
            setToast({ message: 'Tệp đã được chấp nhận! Hệ thống đang bắt đầu phân tích...', type: 'success', isVisible: true });
            
            setTimeout(() => router.push(`/courses/${courseId}/lessons`), 2000);
        } catch (error: any) {
            setToast({ message: error.message || 'Có lỗi xảy ra khi tải tệp lên', type: 'error', isVisible: true });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans w-full flex flex-col">
            <Toast 
                message={toast.message} type={toast.type} 
                isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />

            {/* BREADCRUMB & HEADER */}
            <PageHeader 
                breadcrumb={[
                    { label: 'Quản lí khóa học', href: '/courses' },
                    { label: 'N1', href: `/courses/${courseId}` },
                    { label: 'Quản lý nội dung bài học', href: `/courses/${courseId}/lessons` },
                    { label: 'Nhập giáo trình', active: true }
                ]}
                backUrl={`/courses/${courseId}/lessons`}
                title="Nhập giáo trình"
            />

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 flex-1 flex flex-col">
                {/* Phần giới thiệu AI */}
                <div className="mb-10">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Nạp giáo trình bằng AI</h2>
                    <p className="text-gray-500 leading-relaxed max-w-4xl">
                        Hệ thống sẽ tự động phân tích và bóc tách (chunking) từ vựng, ngữ pháp từ tệp PDF giáo trình của bạn bằng công nghệ xử lý ngôn ngữ tự nhiên.
                    </p>
                </div>

                {/* KHU VỰC UPLOAD (DRAG & DROP) */}
                <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-[32px] transition-all duration-300 relative ${
                        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                    }`}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".pdf"
                        onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                    />

                    {/* Icon và Text */}
                    <div className="flex flex-col items-center text-center p-6">
                        <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-blue-500" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                        </div>

                        {file ? (
                            <div className="space-y-2">
                                <p className="text-lg font-bold text-gray-900">Tệp đã chọn:</p>
                                <p className="text-blue-600 font-medium italic underline">{file.name}</p>
                                <button 
                                    onClick={() => setFile(null)} 
                                    className="text-red-500 text-xs hover:underline mt-2"
                                >
                                    Thay đổi tệp khác
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Kéo và thả tệp PDF vào đây</h3>
                                <p className="text-gray-400 mb-8">Hoặc nhấn để chọn tệp từ máy tính của bạn</p>
                                
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
                                >
                                    Duyệt tệp tin
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                                </button>
                            </>
                        )}

                        {/* Hint nhỏ dưới cùng */}
                        <div className="mt-6 flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-4 py-2 rounded-full">
                            Chỉ hỗ trợ định dạng .pdf (Tối đa 100MB)
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="mt-8 flex justify-end items-center gap-6">
                <button 
                    onClick={() => router.back()}
                    className="text-gray-500 font-medium hover:text-gray-700 transition-colors"
                >
                    Hủy bỏ
                </button>
                <button 
                    onClick={handleConfirmUpload}
                    disabled={!file || isUploading}
                    className="flex items-center gap-3 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:shadow-none"
                >
                    {isUploading ? 'Đang xử lý...' : 'Xác nhận nạp dữ liệu'}
                    {!isUploading && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    )}
                </button>
            </div>
        </div>
    );
}