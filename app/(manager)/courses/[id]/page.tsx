'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import PageHeader from '@/shared/components/PageHeader';
import { CourseDetail, courseService} from '../services/course.service';
import { ToastType } from '@/shared/components/Toast';
import Toast from '@/shared/components/Toast';

export default function CourseDetailPage() {
    const router = useRouter();
    const params = useParams();
    const courseId = params?.id as string;

    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '', type: 'success', isVisible: false
    });

    useEffect(() => {
        const fetchCourseDetail = async () => {
            if (!courseId) return;
            
            setIsLoading(true);
            try {
                const data = await courseService.getCourseById(courseId);
                setCourse(data);
            } catch (error: any) {
                setToast({ message: error.message || 'Lỗi tải dữ liệu', type: 'error', isVisible: true });
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourseDetail();
    }, [courseId]);

    const formatDate = (dateString?: string) => {
        if (!dateString) return '---';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    // Helper render Badge trạng thái
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">ACTIVE</span>;
            case 'INACTIVE':
                return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-600">INACTIVE</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-600">{status}</span>;
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen flex justify-center items-center w-full">
                <span className="w-8 h-8 border-4 border-[#253A8C] border-t-transparent rounded-full animate-spin"></span>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen text-center">
                <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />
                <p className="text-gray-500">Không tìm thấy thông tin khóa học.</p>
                <button onClick={() => router.push('/courses')} className="mt-4 text-blue-600 underline">Quay lại danh sách</button>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans w-full">
            
            {/* 1. BREADCRUMB & BACK BUTTON */}
            <PageHeader 
                breadcrumb={[
                    { label: 'Quản lí khóa học', href: '/courses' },
                    { label: 'Chi tiết', active: true }
                ]}
                backUrl="/courses" 
                title={course.name}
            />

            {/* 2. MAIN CARD */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                
                {/* Phần trên: Ảnh + Thông tin */}
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Thumbnail Khóa học */}
                    <div className="w-full lg:w-64 h-80 shrink-0 bg-gray-50 rounded-xl border border-gray-100 p-4 flex items-center justify-center">
                        <div className="w-full h-full bg-white shadow-sm border border-gray-200 flex items-center justify-center relative overflow-hidden rounded-lg">
                           {course.thumbnailUrl ? (
                               <img src={course.thumbnailUrl} alt={course.name} className="object-cover w-full h-full" />
                           ) : (
                               <div className="flex flex-col items-center justify-center text-gray-400">
                                   <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                       <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                       <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                       <polyline points="21 15 16 10 5 21"></polyline>
                                   </svg>
                                   <span className="text-sm mt-2 font-medium">Chưa có ảnh</span>
                               </div>
                           )}
                        </div>
                    </div>

                    {/* Nội dung chi tiết */}
                    <div className="flex-1 flex flex-col pt-2">
                        <div className="flex items-center gap-4 mb-6">
                            {getStatusBadge(course.status)}
                        </div>

                        {/* Mô tả */}
                        <div className="mb-8">
                            <h3 className="text-sm font-medium text-gray-400 mb-2">Mô tả khóa học</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {course.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Phần giữa: Grid 5 cột thống kê (Stats) */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <p className="text-xs font-medium text-gray-500 mb-2">Cấp độ</p>
                        <p className="text-xl font-bold text-blue-600">{course.jlptLevel}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <p className="text-xs font-medium text-gray-500 mb-2">Số lượng bài học</p>
                        <p className="text-xl font-bold text-gray-900">{course.lessonCount} bài</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <p className="text-xs font-medium text-gray-500 mb-2">Số lượng học viên</p>
                        <p className="text-xl font-bold text-gray-900">{course.studentCount} học viên</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <p className="text-xs font-medium text-gray-500 mb-2">Ngày thêm</p>
                        <p className="text-xl font-bold text-gray-900">{formatDate(course.createdAt)}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <p className="text-xs font-medium text-gray-500 mb-2">Ngày cập nhật</p>
                        <p className="text-xl font-bold text-gray-900">{formatDate(course.updatedAt)}</p>
                    </div>
                </div>

                {/* Phần dưới: Buttons Hành động */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
                    <button 
                        onClick={() => router.push(`/courses/${courseId}/update`)}
                        className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                        Chỉnh sửa thông tin
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    
                    <button 
                        onClick={() => router.push(`/courses/${courseId}/lessons`)}
                        className="px-6 py-2.5 bg-[#253A8C] hover:bg-[#1e2e70] text-white font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                        Quản lí nội dung bài học
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                    </button>
                </div>

            </div>
        </div>
    );
}