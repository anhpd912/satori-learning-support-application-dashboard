'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

import FormInput from '@/shared/components/FormInput';
import FormSelect from '@/shared/components/FormSelect';
import PageHeader from '@/shared/components/PageHeader';
import Toast, { ToastType } from '@/shared/components/Toast';
import FormTextarea from '@/shared/components/FormTextArea';
import { courseService } from '../../services/course.service';

export default function EditCoursePage() {
    const router = useRouter();
    const params = useParams();
    const courseId = params?.id as string;
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isFetching, setIsFetching] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [generalError, setGeneralError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        level: '',
        status: '',
        description: '',
    });
    
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '', type: 'success', isVisible: false
    });

    const levelOptions = useMemo(() => [
        { label: 'N1', value: 'N1' },
        { label: 'N2', value: 'N2' },
        { label: 'N3', value: 'N3' },
        { label: 'N4', value: 'N4' },
        { label: 'N5', value: 'N5' },
    ], []);

    const statusOptions = useMemo(() => [
        { label: 'Hoạt động (ACTIVE)', value: 'ACTIVE' },
        { label: 'Không hoạt động (INACTIVE)', value: 'INACTIVE' },
    ], []);

    useEffect(() => {
        const fetchCourseData = async () => {
            if (!courseId) return;
            setIsFetching(true);
            try {
                const data = await courseService.getCourseById(courseId);
                
                setFormData({
                    name: data.name || '',
                    level: data.jlptLevel || '',
                    status: data.status || 'ACTIVE',
                    description: data.description || '',
                });
                
                if (data.thumbnailUrl) {
                    setThumbnailPreview(data.thumbnailUrl);
                }
            } catch (error: any) {
                setToast({ message: error.message || 'Lỗi khi tải dữ liệu khóa học', type: 'error', isVisible: true });
            } finally {
                setIsFetching(false);
            }
        };

        fetchCourseData();
    }, [courseId]);

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
        if (!formData.status) { 
            newErrors.status = 'Vui lòng chọn trạng thái'; 
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
            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                jlptLevel: formData.level, 
                status: formData.status 
            };

            await courseService.updateCourse(courseId, payload, thumbnailFile || undefined);
            
            setToast({ message: 'Cập nhật khóa học thành công!', type: 'success', isVisible: true });
            
            setTimeout(() => router.push(`/courses/${courseId}`), 1500);

        } catch (error: any) {
            if (error.validationErrors) {
                setErrors(error.validationErrors);
            } else {
                setGeneralError(error.message || 'Có lỗi xảy ra khi cập nhật khóa học');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen flex justify-center items-center w-full">
                <span className="w-8 h-8 border-4 border-[#253A8C] border-t-transparent rounded-full animate-spin"></span>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans w-full">
            <Toast 
                message={toast.message} type={toast.type} 
                isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />

            <PageHeader 
                breadcrumb={
                    <>
                        <Link href="/courses" className="hover:text-gray-900 transition-colors">Quản lí khóa học</Link>
                        <span className="mx-1">{'>'}</span> 
                        <Link href={`/courses/${courseId}`} className="hover:text-gray-900 transition-colors">Chi tiết</Link>
                        <span className="mx-1">{'>'}</span> 
                        <span className="text-gray-900 font-medium">Chỉnh sửa</span>
                    </>
                }
                backUrl={`/courses/${courseId}`} 
                title="Chỉnh sửa khóa học"
                description={`Cập nhật thông tin khóa học`}
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
                    
                    <div>
                        <FormInput 
                            label="Tên khóa học" 
                            placeholder="Ví dụ: N3" 
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            required
                            error={errors.name}
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect 
                            label="Cấp độ"
                            placeholder="Chọn cấp độ"
                            options={levelOptions}
                            required
                            value={formData.level}
                            onChange={(e) => handleChange('level', e.target.value)}
                            error={errors.level}
                        />

                        <FormSelect 
                            label="Trạng thái"
                            placeholder="Chọn trạng thái"
                            options={statusOptions}
                            required
                            value={formData.status}
                            onChange={(e) => handleChange('status', e.target.value)}
                            error={errors.status}
                        />
                    </div>

                    <div className="mt-6">
                        <FormTextarea 
                            label="Mô tả khóa học"
                            name="description"
                            rows={4}
                            placeholder="Mô tả tóm tắt nội dung khóa học..."
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            error={errors.description} 
                        />
                    </div>

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
                                        <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-lg text-sm">Nhấn để đổi ảnh mới</span>
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

                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 mt-8">
                        <Link href={`/courses/${courseId}`}>
                            <button type="button" className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                                Hủy bỏ
                            </button>
                        </Link>
                        
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="px-6 py-2.5 rounded-lg bg-[#253A8C] text-white font-medium hover:bg-[#1e2e70] transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                        >
                            {isLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}