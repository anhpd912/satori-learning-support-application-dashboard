'use client';

import React, { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import FormInput from '@/shared/components/FormInput';
import FormSelect from '@/shared/components/FormSelect';
import PageHeader from '@/shared/components/PageHeader';
import Toast, { ToastType } from '@/shared/components/Toast';
import FormTextarea from '@/shared/components/FormTextArea';
import { courseService } from '../services/course.service'; 

export default function CreateCoursePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [generalError, setGeneralError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        level: '',
        description: '',
    });
    
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '', type: 'success', isVisible: false
    });

    // Cấu hình options cho FormSelect
    const levelOptions = useMemo(() => [
        { label: 'N1', value: 'N1' },
        { label: 'N2', value: 'N2' },
        { label: 'N3', value: 'N3' },
        { label: 'N4', value: 'N4' },
        { label: 'N5', value: 'N5' },
    ], []);

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setToast({ message: 'Ảnh vượt quá dung lượng 5MB cho phép', type: 'error', isVisible: true });
                return;
            }
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        if (!formData.name.trim()) { 
            newErrors.name = 'Vui lòng nhập tên khóa học'; 
            isValid = false; 
        }
        if (!formData.level) { 
            newErrors.level = 'Vui lòng chọn cấp độ'; 
            isValid = false; 
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});
        setGeneralError('');

        try {
            // Chuẩn bị cục JSON gửi xuống API Create
            const payload = {
                name: formData.name.trim(),
                jlptLevel: formData.level, // Ép từ 'level' của state sang 'jlptLevel' của BE
                description: formData.description.trim() || undefined, // Nếu rỗng thì bỏ qua
            };

            // Gọi API tạo khóa học, truyền file ảnh trực tiếp để backend xử lý upload Cloudinary
            await courseService.createCourse(payload, thumbnailFile || undefined);
            
            setToast({ message: 'Tạo khóa học thành công!', type: 'success', isVisible: true });
            setTimeout(() => router.push('/courses'), 1500);

        } catch (error: any) {
            // Xử lý lỗi từ BE trả về (ví dụ lỗi validate min/max kí tự)
            if (error.response?.data?.message) {
                setGeneralError(error.response.data.message);
            } else {
                setGeneralError('Có lỗi xảy ra khi tạo khóa học');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans w-full">
            <Toast 
                message={toast.message} type={toast.type} 
                isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />

            <PageHeader 
                breadcrumb={
                    <>Quản lí khóa học <span className="mx-1">{'>'}</span> <span className="text-gray-900 font-medium">Tạo khóa học mới</span></>
                }
                backUrl="/courses" 
                title="Tạo khóa học mới"
                description="Tạo khóa học mới cho ứng dụng"
            />

            {generalError && (
                <div className="max-w-4xl mx-auto mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <div className="text-red-500 shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    </div>
                    <p className="text-sm text-red-600">{generalError}</p>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6 max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Hàng 1: Sử dụng FormInput và FormSelect */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput 
                            label="Tên khóa học" 
                            placeholder="Ví dụ: N3" 
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            required
                            error={errors.name}
                        />
                        
                        <FormSelect 
                            label="Cấp độ"
                            placeholder="Chọn cấp độ"
                            options={levelOptions}
                            required
                            value={formData.level}
                            onChange={(e) => handleChange('level', e.target.value)}
                            error={errors.level}
                        />
                    </div>

                    {/* Hàng 2: Mô tả (Textarea tùy chỉnh) */}
                    <div className="mt-6">
                        <FormTextarea 
                            label="Mô tả khóa học"
                            name="description"
                            rows={4}
                            placeholder="Mô tả tóm tắt nội dung khóa học..."
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            error={errors.description} // Nếu sau này bạn muốn bắt lỗi độ dài mô tả
                        />
                    </div>

                    {/* Hàng 3: Upload Ảnh (Giữ nguyên logic kéo thả xịn xò) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ảnh đại diện (Thumbnail)
                        </label>
                        <input 
                            type="file" ref={fileInputRef} onChange={handleFileChange} 
                            accept="image/png, image/jpeg, image/jpg" className="hidden" 
                        />
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-48 rounded-xl border-2 border-dashed border-[#BFDBFE] bg-[#EFF6FF] hover:bg-[#DBEAFE] transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden relative"
                        >
                            {thumbnailPreview ? (
                                <>
                                    <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-contain bg-black/5" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-lg text-sm">Nhấn để đổi ảnh</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-[#3B82F6] text-white flex items-center justify-center mb-4 shadow-sm">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                    </div>
                                    <p className="text-gray-900 font-semibold mb-1 text-sm">Kéo thả hoặc click để tải ảnh lên</p>
                                    <p className="text-gray-500 text-xs">PNG, JPG, JPEG (Tối đa 5MB)</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 mt-8">
                        <Link href="/courses">
                            <button type="button" className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                                Hủy
                            </button>
                        </Link>
                        
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="px-6 py-2.5 rounded-lg bg-[#253A8C] text-white font-medium hover:bg-[#1e2e70] transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                        >
                            {isLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                            {isLoading ? 'Đang xử lý...' : 'Tạo mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}