'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import FormInput from '@/shared/components/FormInput';
import FormSelect from '@/shared/components/FormSelect';
import PageHeader from '@/shared/components/PageHeader';
import Toast from '@/shared/components/Toast';
import FormTextarea from '@/shared/components/FormTextArea';
import { useCourseUpdate } from '@/features/courses/hooks/useCourseUpdate';

export default function EditCoursePage() {
    const params = useParams();
    const courseId = params?.id as string;
    
    const {
        isFetching,
        isLoading,
        errors,
        generalError,
        formData,
        toast, setToast,
        levelOptions,
        statusOptions,
        handleChange,
        handleSubmit
    } = useCourseUpdate(courseId);

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
                breadcrumb={[
                    { label: 'Quản lí khóa học', href: '/courses' },
                    { label: 'Chi tiết', href: `/courses/${courseId}` },
                    { label: 'Chỉnh sửa', active: true }
                ]}
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