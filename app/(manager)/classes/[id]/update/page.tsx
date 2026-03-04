'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

import FormInput from '@/shared/components/FormInput';
import FormSelect from '@/shared/components/FormSelect';
import FormTextarea from '@/shared/components/FormTextArea';
import FormDate from '@/shared/components/FormDate';
import PageHeader from '@/shared/components/PageHeader';
import Toast, { ToastType } from '@/shared/components/Toast';
import { classService } from '@/shared/services/class.service';
import { userService } from '@/shared/services/user.service';
import { courseService } from '@/app/(manager)/courses/services/course.service';

export default function EditClassPage() {
    const router = useRouter();
    const params = useParams();
    const classId = params?.id as string;

    const [isFetching, setIsFetching] = useState(true);
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

    const [teacherOptions, setTeacherOptions] = useState<{ label: string; value: string }[]>([]);
    const [courseOptions, setCourseOptions] = useState<{ label: string; value: string }[]>([]);

    // 1. Fetch Options (Giảng viên & Khóa học) từ API
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
                console.error('Failed to fetch options', error);
            }
        };
        fetchOptions();
    }, []);

    // 2. GỌI API LẤY DỮ LIỆU CŨ ĐỔ VÀO FORM
    useEffect(() => {
        const fetchClassDetail = async () => {
            if (!classId) return;
            setIsFetching(true);
            try {
                const data = await classService.getClassById(classId);

                setFormData({
                    name: data.name,
                    teacherId: data.teacherId,
                    courseId: data.courseId,
                    maxStudents: data.maxStudents.toString(),
                    startDate: data.startDate ? data.startDate.split('T')[0] : '',
                    endDate: data.endDate ? data.endDate.split('T')[0] : '',
                    description: data.description || '',
                });
            } catch (error: any) {
                setToast({ message: error.message || 'Lỗi tải dữ liệu lớp học', type: 'error', isVisible: true });
            } finally {
                setIsFetching(false);
            }
        };

        fetchClassDetail();
    }, [classId]);

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
            await classService.updateClass(classId, {
                name: formData.name,
                teacherId: formData.teacherId,
                maxStudents: parseInt(formData.maxStudents),
                startDate: formData.startDate,
                endDate: formData.endDate,
                description: formData.description
            });
            
            setToast({ message: 'Cập nhật thông tin thành công!', type: 'success', isVisible: true });
            
            // Quay lại trang chi tiết sau khi cập nhật thành công
            setTimeout(() => router.push(`/classes/${classId}`), 1500);

        } catch (error: any) {
            setGeneralError(error.message || 'Có lỗi xảy ra khi cập nhật lớp học');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsLoading(false);
        }
    };

    // Hiển thị vòng xoay loading khi đang lấy dữ liệu cũ
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
                    <div className="flex items-center gap-2">
                        <Link href="/classes" className="hover:text-gray-900 transition-colors">Quản lí lớp học</Link>
                        <span className="mx-1">{'>'}</span> 
                        <span className="text-gray-900 font-medium">Cập nhật thông tin</span>
                    </div>
                }
                backUrl={`/classes/${classId}`} 
                backLabel="Quay lại"
                title="Cập nhật thông tin lớp học"
                description="Chỉnh sửa chi tiết thông tin lớp học"
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
                        <Link href={`/classes/${classId}`}>
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
                            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}