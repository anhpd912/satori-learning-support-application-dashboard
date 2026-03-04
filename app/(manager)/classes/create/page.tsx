'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import FormInput from '@/shared/components/FormInput';
import FormSelect from '@/shared/components/FormSelect';
import FormTextarea from '@/shared/components/FormTextArea';
import FormDate from '@/shared/components/FormDate'; 
import PageHeader from '@/shared/components/PageHeader';
import Toast, { ToastType } from '@/shared/components/Toast';
import { userService } from '@/shared/services/user.service';
import { courseService } from '@/app/(manager)/courses/services/course.service';
import { classService } from '@/shared/services/class.service';

export default function CreateClassPage() {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [generalError, setGeneralError] = useState('');

    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '', type: 'success', isVisible: false
    });

    const [formData, setFormData] = useState({
        name: '',
        teacherId: '',
        courseId: '',
        maxStudents: '',
        startDate: '',
        endDate: '',
        description: '',
    });

    const [teacherOptions, setTeacherOptions] = useState<{label: string, value: string}[]>([]);
    const [courseOptions, setCourseOptions] = useState<{label: string, value: string}[]>([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [teachersRes, coursesRes] = await Promise.all([
                    userService.getUsers(1, 100, '', 'TEACHER', 'ACTIVE'),
                    courseService.getCourses(1, 100, '', 'ALL', 'ACTIVE')
                ]);
                
                setTeacherOptions(teachersRes.data.map(t => ({ label: t.name, value: t.id })));
                setCourseOptions(coursesRes.data.map(c => ({ label: c.name, value: c.id })));
            } catch (error) {
                setToast({ message: 'Lỗi tải danh sách giảng viên/khóa học', type: 'error', isVisible: true });
            }
        };
        fetchOptions();
    }, []);

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        if (!formData.name.trim()) { newErrors.name = 'Vui lòng nhập tên lớp học'; isValid = false; }
        if (!formData.teacherId) { newErrors.teacherId = 'Vui lòng chọn giảng viên'; isValid = false; }
        if (!formData.courseId) { newErrors.courseId = 'Vui lòng chọn khóa học'; isValid = false; }
        
        if (formData.maxStudents) {
            const max = parseInt(formData.maxStudents, 10);
            if (isNaN(max) || max <= 0) {
                newErrors.maxStudents = 'Sĩ số phải là số lớn hơn 0';
                isValid = false;
            }
        }

        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            if (start > end) {
                newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
                isValid = false;
            }
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
                name: formData.name,
                teacherId: formData.teacherId,
                courseId: formData.courseId,
                maxStudents: parseInt(formData.maxStudents),
                startDate: formData.startDate,
                endDate: formData.endDate,
                description: formData.description
            };

            await classService.createClass(payload);
            
            setToast({ message: 'Tạo lớp học thành công!', type: 'success', isVisible: true });
            
            // Redirect về trang danh sách sau khi tạo thành công
            setTimeout(() => router.push('/classes'), 1500);

        } catch (error: any) {
            setGeneralError(error.message || 'Có lỗi xảy ra khi tạo lớp học');
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
                    <div className="flex items-center gap-2">
                        <Link href="/classes" className="hover:text-gray-900 transition-colors">Quản lí lớp học</Link>
                        <span className="mx-1">{'>'}</span> 
                        <span className="text-gray-900 font-medium">Tạo lớp học mới</span>
                    </div>
                }
                backUrl="/classes" 
                backLabel="Quay lại"
                title="Tạo lớp học mới"
                description="Thiết lập thông tin cơ bản cho lớp học mới."
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
                    
                    {/* Hàng 1: Tên lớp học (Full width) */}
                    <div>
                        <FormInput 
                            label="Tên lớp học" 
                            placeholder="Ví dụ: N3 Cấp tốc - Tháng 10/2023" 
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            required
                            error={errors.name}
                        />
                    </div>

                    {/* Hàng 2: Giảng viên và Khóa học (2 cột) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect 
                            label="Giảng viên phụ trách"
                            placeholder="Chọn giảng viên"
                            options={teacherOptions}
                            required
                            value={formData.teacherId}
                            onChange={(e) => handleChange('teacherId', e.target.value)}
                            error={errors.teacherId}
                        />
                        
                        <FormSelect 
                            label="Khóa học"
                            placeholder="Chọn khóa học"
                            options={courseOptions}
                            required
                            value={formData.courseId}
                            onChange={(e) => handleChange('courseId', e.target.value)}
                            error={errors.courseId}
                        />
                    </div>

                    {/* Hàng 3: Sĩ số, Ngày bắt đầu, Ngày kết thúc (3 cột) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormInput 
                            label="Sĩ số tối đa" 
                            type="number"
                            placeholder="20" 
                            value={formData.maxStudents}
                            onChange={(e) => handleChange('maxStudents', e.target.value)}
                            error={errors.maxStudents}
                        />

                        <FormDate 
                            label="Ngày bắt đầu" 
                            value={formData.startDate}
                            onChange={(e) => handleChange('startDate', e.target.value)}
                            error={errors.startDate}
                        />

                        <FormDate 
                            label="Ngày kết thúc" 
                            value={formData.endDate}
                            onChange={(e) => handleChange('endDate', e.target.value)}
                            error={errors.endDate}
                        />
                    </div>

                    {/* Hàng 4: Mô tả chi tiết (Full width) */}
                    <div className="mt-6">
                        <FormTextarea 
                            label="Mô tả chi tiết lớp học"
                            name="description"
                            rows={4}
                            placeholder="Nhập mục tiêu học tập, yêu cầu đầu vào hoặc thông tin bổ sung khác cho lớp học..."
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            error={errors.description}
                        />
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end items-center gap-4 pt-4 border-t border-gray-100 mt-8">
                        <Link href="/classes">
                            <button type="button" className="px-6 py-2.5 text-gray-500 font-medium hover:text-gray-700 transition-colors">
                                Hủy bỏ
                            </button>
                        </Link>
                        
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="px-6 py-2.5 rounded-lg bg-[#253A8C] text-white font-medium hover:bg-[#1e2e70] transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                        >
                            {isLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                            {isLoading ? 'Đang xử lý...' : 'Tạo lớp học'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}