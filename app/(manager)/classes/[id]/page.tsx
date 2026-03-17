'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import CommonTable, { Column } from '@/shared/components/CommonTable';
import PageHeader from '@/shared/components/PageHeader';
import Toast, { ToastType } from '@/shared/components/Toast';
import InfoItem from '@/shared/components/InfoItem';
import ConfirmModal from '@/shared/components/ConfirmModal';
import Pagination from '@/shared/components/Pagination';
import { classService, ClassResponse, ClassMemberResponse } from '@/shared/services/class.service';
import AddStudentModal from '@/features/classes/components/AddStudentModal';

const ITEMS_PER_PAGE = 5;

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
};

export default function ClassDetailPage() {
    const router = useRouter();
    const params = useParams();
    const classId = params?.id as string;

    const [classData, setClassData] = useState<ClassResponse | null>(null);
    const [students, setStudents] = useState<ClassMemberResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'INFO' | 'STUDENTS'>('INFO');
    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '', type: 'success', isVisible: false
    });
    
    const [studentToRemove, setStudentToRemove] = useState<string | null>(null);
    const [isRemoving, setIsRemoving] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Fetch danh sách học viên (được tách ra để tái sử dụng)
    const fetchStudents = useCallback(async () => {
        if (!classId) return;
        try {
            const data = await classService.getClassMembers(classId, currentPage, ITEMS_PER_PAGE);
            setStudents(data.content);
            setTotalItems(data.totalElements);
        } catch (error: any) {
            setToast({ message: error.message || 'Không thể tải danh sách học viên', type: 'error', isVisible: true });
        }
    }, [classId, currentPage]);

    const handleConfirmAddStudents = async (selectedIds: string[]) => {
        setIsAddModalOpen(false);
        try {
            // Backend chỉ hỗ trợ thêm từng học viên, nên dùng Promise.all để gọi song song
            await Promise.all(selectedIds.map(userId => classService.addMember(classId, userId)));
            
            setToast({ message: `Đã thêm ${selectedIds.length} học viên thành công!`, type: 'success', isVisible: true });
            fetchStudents(); // Tải lại danh sách sau khi thêm
        } catch (error: any) {
            setToast({ message: error.message || 'Lỗi khi thêm học viên', type: 'error', isVisible: true });
        }
    };

    useEffect(() => {
        if (!classId) return;
        const fetchDetail = async () => {
            setIsLoading(true);
            try {
                const data = await classService.getClassById(classId);
                setClassData(data);
            } catch (error: any) {
                setToast({ message: error.message || 'Không thể tải thông tin lớp học', type: 'error', isVisible: true });
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetail();
    }, [classId]);

    // Fetch danh sách học viên khi chuyển tab hoặc đổi trang
    useEffect(() => {
        if (activeTab === 'STUDENTS' && classId) {
            fetchStudents();
        }
    }, [activeTab, currentPage, classId, fetchStudents]);

    // Hành động xóa học viên khỏi lớp
    const handleRemoveStudent = (studentId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setStudentToRemove(studentId);
    };

    const confirmRemoveStudent = async () => {
        if (!studentToRemove) return;
        setIsRemoving(true);
        try {
            await classService.removeMember(classId, studentToRemove);
            setToast({ message: 'Đã xóa học viên khỏi lớp', type: 'success', isVisible: true });
            setStudentToRemove(null);
            fetchStudents(); // Tải lại danh sách sau khi xóa
        } catch (error: any) {
            setToast({ message: error.message || 'Lỗi khi xóa học viên', type: 'error', isVisible: true });
        } finally {
            setIsRemoving(false);
        }
    };

    // Cập nhật lại các cột theo đúng thiết kế
    const studentColumns = useMemo<Column<ClassMemberResponse>[]>(() => [
        {
            header: 'Tên học viên',
            render: (student) => (
                <div className="flex items-center gap-4">
                    {student.avatarUrl ? (
                        <img src={student.avatarUrl} alt={student.fullName} className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">{student.fullName.charAt(0)}</div>
                    )}
                    <div>
                        <p className="font-medium text-gray-900 text-sm">{student.fullName}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Ngày tham gia',
            className: 'text-sm text-gray-600 font-medium',
            render: (student) => formatDate(student.joinedAt)
        },
        {
            header: 'Trạng thái tài khoản',
            render: (student) => {
                // Logic: Nếu removedAt null -> Active, ngược lại Inactive
                const isActive = !student.removedAt;
                return (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold ${
                        isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                );
            }
        },
        {
            header: 'Hành động',
            className: 'text-right',
            render: (student) => (
                <div className="flex justify-end pr-4">
                    <button 
                        onClick={(e) => handleRemoveStudent(student.userId, e)}
                        className="text-gray-400 hover:text-red-500 transition-colors" 
                        title="Xóa khỏi lớp"
                    >
                        {/* Icon user-minus */}
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="8.5" cy="7" r="4"></circle>
                            <line x1="23" y1="11" x2="17" y2="11"></line>
                        </svg>
                    </button>
                </div>
            )
        }
    ], []);

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    if (isLoading) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen flex justify-center items-center w-full">
                <span className="w-8 h-8 border-4 border-[#253A8C] border-t-transparent rounded-full animate-spin"></span>
            </div>
        );
    }

    // Nếu không có dữ liệu (ví dụ: API lỗi), hiển thị thông báo và Toast
    if (!classData) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen font-sans w-full">
                <Toast 
                    message={toast.message} type={toast.type} 
                    isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
                />
                <div className="text-center text-gray-500 mt-10">Không tìm thấy thông tin lớp học hoặc có lỗi xảy ra.</div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans w-full">
            <Toast 
                message={toast.message} type={toast.type} 
                isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />

            <ConfirmModal 
                isOpen={!!studentToRemove}
                onClose={() => setStudentToRemove(null)}
                onConfirm={confirmRemoveStudent}
                title="Xóa học viên?"
                message="Hành động này sẽ xóa học viên khỏi lớp học. Bạn có chắc chắn không?"
                confirmText="Xóa"
                variant="danger"
                isLoading={isRemoving}
            />

            {/* HEADER */}
            <PageHeader 
                breadcrumb={[
                    { label: 'Quản lí lớp học', href: '/classes' },
                    { label: 'Chi tiết lớp', active: true }
                ]}
                backUrl="/classes" 
                title="Chi tiết lớp học"
                description="Quản lý thông tin chung và danh sách học viên tham gia khóa học này."
            />

            {/* TABS NATIVE CUSTOM BẰNG TAILWIND */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('INFO')}
                    className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors relative ${
                        activeTab === 'INFO' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Thông tin chung
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    {activeTab === 'INFO' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-md"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('STUDENTS')}
                    className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors relative ${
                        activeTab === 'STUDENTS' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Danh sách học viên
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    {activeTab === 'STUDENTS' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-md"></div>}
                </button>
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'INFO' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ... (Phần Info Tab giữ nguyên như cũ) ... */}
                    {/* CỘT TRÁI (Chiếm 2/3) */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Card: Chi tiết cơ bản */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Chi tiết cơ bản</h2>
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
                                    {classData.isActive ? 'Active' : 'Inactive'}
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1 font-medium">Tên lớp học</p>
                                    <p className="text-base font-bold text-gray-900">{classData.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1 font-medium">Khóa học</p>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-bold bg-blue-50 text-blue-600">
                                        {classData.courseLevel}
                                    </span>
                                </div>
                                <InfoItem 
                                    label="Ngày khai giảng" 
                                    value={formatDate(classData.startDate)} 
                                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>}
                                />
                                <InfoItem 
                                    label="Ngày kết thúc dự kiến" 
                                    value={formatDate(classData.endDate)} 
                                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>}
                                />
                                <InfoItem 
                                    label="Sĩ số tối đa" 
                                    value={`${classData.maxStudents} học viên`} 
                                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
                                />
                                <InfoItem 
                                    label="Sĩ số" 
                                    value={`${classData.memberCount} học viên`} 
                                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
                                />
                            </div>
                        </div>

                        {/* Card: Mô tả */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Mô tả</h2>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                {classData.description}
                            </p>
                        </div>
                    </div>

                    {/* CỘT PHẢI (Chiếm 1/3) */}
                    <div className="lg:col-span-1">
                        {/* Card: Giảng viên */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Giảng viên phụ trách</h2>
                            
                            <div className="flex items-center gap-4 mb-6">
                                {classData.teacherAvatarUrl ? (
                                    <img src={classData.teacherAvatarUrl} alt="Teacher Avatar" className="w-16 h-16 rounded-full object-cover border border-gray-200" />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">{classData.teacherName?.charAt(0)}</div>
                                )}
                                <h3 className="text-xl font-bold text-gray-900 leading-tight">
                                    {classData.teacherName?.split(' ').map((word, i) => <React.Fragment key={i}>{word}<br/></React.Fragment>)}
                                </h3>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-sm">
                                    <svg width="18" height="18" className="text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                    <span className="text-gray-600 truncate">{classData.teacherEmail}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <svg width="18" height="18" className="text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                    <span className="text-gray-600">{classData.teacherPhoneNumber}</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => router.push(`/users/${classData.teacherId}`)}
                                className="w-full py-2.5 bg-white border border-blue-200 text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors text-sm"
                            >
                                Xem hồ sơ giảng viên
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: Danh sách học viên */}
            {activeTab === 'STUDENTS' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    
                    {/* Header của Tab Học viên */}
                    <div className="flex justify-between items-center p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Danh sách học viên</h2>
                        <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-4 py-2 bg-[#253A8C] hover:bg-[#1e2e70] text-white font-medium rounded-lg text-sm transition-colors flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                            Thêm học viên vào lớp
                        </button>
                    </div>

                    <div className="px-2"> {/* Thêm padding x nhỏ để table không sát viền */}
                        <CommonTable 
                            data={students}
                            columns={studentColumns}
                            keyExtractor={(item) => item.id}
                            isLoading={isLoading}
                            onRowClick={(student) => router.push(`/users/${student.userId}`)}
                        />
                    </div>

                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={totalItems}
                        itemsPerPage={ITEMS_PER_PAGE}
                    />

                </div>
            )}

            <AddStudentModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onConfirm={handleConfirmAddStudents} 
                classId={classId}
            />

            {/* NÚT CHỈNH SỬA THÔNG TIN BÊN GÓC DƯỚI (Chỉ hiện ở Tab Info) */}
            {activeTab === 'INFO' && (
                <div className="flex justify-end mt-8">
                    <button 
                        onClick={() => router.push(`/classes/${classId}/update`)}
                        className="px-6 py-3 bg-[#253A8C] hover:bg-[#1e2e70] text-white font-medium rounded-xl shadow-md transition-all flex items-center gap-2 text-sm"
                    >
                        Chỉnh sửa thông tin
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </button>
                </div>
            )}
        </div>
    );
}