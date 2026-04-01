'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { userService } from './services/user.service';
import Toast, { ToastType } from '@/shared/components/Toast';
import CommonTable, { Column } from '@/shared/components/CommonTable';
import Pagination from '@/shared/components/Pagination';

interface UserImportFeatureProps {
    role?: 'ADMIN' | 'OPERATION_MANAGER';
}

type PreviewType = 'ALL' | 'NEW' | 'UPDATE' | 'ERROR';

export default function UserImportFeature({ role = 'ADMIN' }: UserImportFeatureProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- States ---
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [previewResult, setPreviewResult] = useState<{
        created: any[];
        updated: any[];
        errors: any[];
        createdCount: number;
        updatedCount: number;
        errorCount: number;
        totalRows: number;
    } | null>(null);

    const [typeFilter, setTypeFilter] = useState<PreviewType>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '',
        type: 'success',
        isVisible: false
    });

    const basePath = role === 'ADMIN' ? '/admin/users' : '/users';

    // --- Handlers ---
    const handleBack = () => router.push(basePath);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (selectedFile: File) => {
        const isExcel = selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            selectedFile.name.endsWith('.xlsx');

        if (!isExcel) {
            setToast({ message: 'Vui lòng chọn tệp định dạng .xlsx', type: 'error', isVisible: true });
            return;
        }

        if (selectedFile.size > 20 * 1024 * 1024) {
            setToast({ message: 'Kích thước tệp không được vượt quá 20MB', type: 'error', isVisible: true });
            return;
        }

        setFile(selectedFile);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) validateAndSetFile(droppedFile);
    };

    const handleDownloadTemplate = async () => {
        try {
            await userService.getImportTemplate();
        } catch (error: any) {
            setToast({ message: error.message, type: 'error', isVisible: true });
        }
    };

    const handleUploadAndPreview = async () => {
        if (!file) return;

        setIsLoading(true);
        try {
            const result = await userService.previewUserImport(file);
            setPreviewResult(result);
            setToast({ message: 'Trích xuất dữ liệu thành công!', type: 'success', isVisible: true });
        } catch (error: any) {
            setToast({ message: error.message, type: 'error', isVisible: true });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveItem = (item: any) => {
        if (!previewResult) return;

        const type = item._type;
        const newResult = { ...previewResult };

        if (type === 'NEW') {
            newResult.created = newResult.created.filter(i => i.email !== item.email);
            newResult.createdCount--;
        } else if (type === 'UPDATE') {
            newResult.updated = newResult.updated.filter(i => i.email !== item.email);
            newResult.updatedCount--;
        } else if (type === 'ERROR') {
            newResult.errors = newResult.errors.filter(i => i.email !== item.email);
            newResult.errorCount--;
        }

        newResult.totalRows--;
        setPreviewResult(newResult);
    };

    const handleConfirmImport = async () => {
        if (!previewResult) return;

        setIsLoading(true);
        try {
            const requestBody = {
                createUserRequests: previewResult.created.map(item => ({
                    fullName: item.fullName || item.name || '',
                    email: item.email || '',
                    phoneNumber: item.phoneNumber || '',
                    role: item.role || '',
                    dateOfBirth: item.birthDay ? (item.birthDay.includes('T') ? item.birthDay.split('T')[0] : item.birthDay) : (item.dateOfBirth ? (item.dateOfBirth.includes('T') ? item.dateOfBirth.split('T')[0] : item.dateOfBirth) : '')
                })),
                updateUserRequests: previewResult.updated.map(item => ({
                    userId: item.userId || item.id,
                    fullName: item.newFullName || item.fullName,
                    phoneNumber: item.newPhoneNumber || item.phoneNumber,
                    email: item.newEmail || item.email,
                    dateOfBirth: item.newDateOfBirth ? (item.newDateOfBirth.includes('T') ? item.newDateOfBirth.split('T')[0] : item.newDateOfBirth) : (item.dateOfBirth ? (item.dateOfBirth.includes('T') ? item.dateOfBirth.split('T')[0] : item.dateOfBirth) : null)
                }))
            };

            await userService.confirmUserImport(requestBody);
            setToast({ message: 'Import người dùng thành công!', type: 'success', isVisible: true });
            setTimeout(() => router.push(basePath), 1500);
        } catch (error: any) {
            setToast({ message: error.message, type: 'error', isVisible: true });
        } finally {
            setIsLoading(false);
        }
    };

    // --- Table Configuration ---
    const columns: Column<any>[] = [
        {
            header: 'Họ và Tên',
            render: (item) => {
                const isUpdate = item._type === 'UPDATE';
                const isError = item._type === 'ERROR';
                const name = item.fullName || item.newFullName || item.oldFullName || item.name || '';
                const oldName = item.oldFullName;
                const errorMsg = item.fullNameErrorMessage;

                const initials = name ? name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : '??';
                const colors = ['bg-blue-100 text-blue-600', 'bg-indigo-100 text-indigo-600', 'bg-pink-100 text-pink-600'];
                const colorClass = colors[name.length % 3] || 'bg-gray-100 text-gray-600';

                return (
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center font-bold text-sm shrink-0 uppercase tracking-tighter`}>
                            {initials}
                        </div>
                        <div className="flex flex-col">
                            {isError && errorMsg ? (
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-red-50 px-3 py-1 rounded-lg border border-red-100 text-red-600 font-bold text-sm">{name || 'Trống'}</div>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                    </div>
                                    <span className="text-red-500 text-[11px] font-medium mt-1">{errorMsg}</span>
                                </div>
                            ) : (
                                <>
                                    <span className="font-semibold text-gray-800 text-sm truncate max-w-[200px]" title={name}>
                                        {name || <span className="text-gray-300 italic">Trống</span>}
                                    </span>
                                    {isUpdate && oldName && name !== oldName && (
                                        <span className="text-gray-400 text-xs line-through">{oldName}</span>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )
            }
        },
        {
            header: 'Email',
            render: (item) => {
                const isUpdate = item._type === 'UPDATE';
                const isError = item._type === 'ERROR';
                const email = item.email || item.newEmail || item.oldEmail;
                const oldEmail = item.oldEmail;
                const errorMsg = item.emailErrorMessage;

                return (
                    <div className="flex items-center">
                        {isError && errorMsg ? (
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <div className="bg-red-50 px-3 py-1 rounded-lg border border-red-100 text-red-600 font-bold text-sm">{email || 'Trống'}</div>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                </div>
                                <span className="text-red-500 text-[11px] font-medium mt-1">{errorMsg}</span>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                <span className="text-[#64748B] text-sm font-medium">{email}</span>
                                {isUpdate && oldEmail && email !== oldEmail && (
                                    <span className="text-gray-400 text-xs line-through">{oldEmail}</span>
                                )}
                            </div>
                        )}
                    </div>
                )
            }
        },
        {
            header: 'Vai trò',
            render: (item) => {
                const roleText = item.role === 'LEARNER' ? 'Học viên' : item.role === 'TEACHER' ? 'Giáo viên' : (item.role || '—');
                return (
                    <span className={`px-4 py-1 rounded-full text-xs font-bold ${item.role === 'ADMIN' ? 'bg-red-50 text-red-600' :
                            item.role === 'TEACHER' ? 'bg-purple-50 text-purple-600' :
                                item.role === 'LEARNER' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'
                        }`}>
                        {roleText}
                    </span>
                );
            }
        },
        {
            header: 'SĐT',
            render: (item) => {
                const isUpdate = item._type === 'UPDATE';
                const isError = item._type === 'ERROR';
                const phone = item.phoneNumber || item.newPhoneNumber;
                const oldPhone = item.oldPhoneNumber;
                const errorMsg = item.phoneNumberErrorMessage;

                return (
                    <div className="flex flex-col">
                        {isError && errorMsg ? (
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <div className="bg-red-50 px-3 py-1 rounded-lg border border-red-100 text-red-600 font-bold text-sm">{phone || 'Trống'}</div>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                </div>
                                <span className="text-red-500 text-[11px] font-medium mt-1">{errorMsg}</span>
                            </div>
                        ) : (
                            <>
                                <span className="text-gray-600 text-sm font-medium">{phone || '—'}</span>
                                {isUpdate && oldPhone && phone !== oldPhone && (
                                    <span className="text-gray-400 text-xs line-through">{oldPhone}</span>
                                )}
                            </>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Ngày sinh',
            render: (item) => {
                const isUpdate = item._type === 'UPDATE';
                const isError = item._type === 'ERROR';
                const dob = item.birthDay || item.newDateOfBirth || item.dateOfBirth;
                const oldDob = item.oldDateOfBirth;
                const errorMsg = item.birthDayErrorMessage;

                const formattedDob = dob ? (isNaN(Date.parse(dob)) ? dob : new Date(dob).toLocaleDateString('vi-VN')) : '—';
                const formattedOldDob = oldDob ? new Date(oldDob).toLocaleDateString('vi-VN') : null;

                return (
                    <div className="flex flex-col">
                        {isError && errorMsg ? (
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <div className="bg-red-50 px-3 py-1 rounded-lg border border-red-100 text-red-600 font-bold text-sm">{formattedDob || 'Trống'}</div>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                </div>
                                <span className="text-red-500 text-[11px] font-medium mt-1">{errorMsg}</span>
                            </div>
                        ) : (
                            <>
                                <span className="text-gray-600 text-sm font-medium">{formattedDob}</span>
                                {isUpdate && oldDob && dob !== oldDob && formattedOldDob && (
                                    <span className="text-gray-400 text-xs line-through">{formattedOldDob}</span>
                                )}
                            </>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Loại xử lý',
            render: (item) => (
                <span className={`font-bold text-sm ${item._type === 'NEW' ? 'text-gray-900' :
                        item._type === 'UPDATE' ? 'text-gray-500' : 'text-red-600'
                    }`}>
                    {item._type === 'NEW' ? 'Tạo mới' : item._type === 'UPDATE' ? 'Cập nhật' : 'Lỗi'}
                </span>
            )
        },
        {
            header: 'Hành động',
            className: 'text-right',
            render: (item) => (
                <div className="flex justify-end pr-4">
                    {item._type === 'ERROR' ? (
                        <div className="flex items-center gap-1.5 text-red-500 font-bold text-xs uppercase">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                            Error
                        </div>
                    ) : (
                        <button
                            onClick={() => handleRemoveItem(item)}
                            className="text-gray-300 hover:text-red-500 transition-colors p-1.5"
                            title="Xóa dòng"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    )}
                </div>
            )
        }
    ];

    // Combine any data for table and filter
    const allItems = [
        ...(previewResult?.created || []).map(i => ({ ...i, _type: 'NEW' })),
        ...(previewResult?.updated || []).map(i => ({ ...i, _type: 'UPDATE' })),
        ...(previewResult?.errors || []).map(i => ({ ...i, _type: 'ERROR' }))
    ];

    const filteredItems = allItems.filter(item => {
        if (typeFilter === 'ALL') return true;
        return item._type === typeFilter;
    });

    const paginatedItems = filteredItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="p-8 bg-[#F9FAFB] min-h-screen font-sans">
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />

            {/* BREADCRUMB */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                <span className="hover:text-gray-700 cursor-pointer" onClick={handleBack}>Quản lí người dùng</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                <span className="hover:text-gray-700 cursor-pointer" onClick={handleBack}>Thông tin người dùng</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                <span className="text-gray-900 font-medium">Cập nhật thông tin</span>
            </nav>

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                    Quay lại
                </button>
                <div className="text-right">
                    <h1 className="text-3xl font-extrabold text-[#111827] mb-2 tracking-tight">Import người dùng từ file Excel</h1>
                    <p className="text-[#6B7280]">Tải lên file Excel để có thể tạo mới và cập nhật người dùng</p>
                </div>
            </div>

            {/* MAIN CONTENT */}
            {!previewResult ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-5xl mx-auto">
                    {/* DROPZONE */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center transition-all cursor-pointer mb-8 ${isDragging ? 'border-[#253A8C] bg-blue-50' : 'border-[#E5E7EB] hover:border-gray-300 bg-white'
                            }`}
                    >
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx" />
                        <div className="w-16 h-16 bg-[#EEF2FF] rounded-full flex items-center justify-center mb-6">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#253A8C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                        </div>
                        <p className="text-xl font-bold text-gray-900 mb-2">{file ? file.name : 'Kéo và thả tệp Excel vào đây hoặc nhấn để chọn tệp'}</p>
                        <p className="text-gray-400 text-sm">Hỗ trợ định dạng .xlsx (Tối đa 20MB)</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4 bg-[#F3F4F6] p-4 rounded-xl">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                            </div>
                            <div>
                                <button onClick={handleDownloadTemplate} className="text-sm font-bold text-[#253A8C] hover:underline flex items-center gap-1">
                                    Tải xuống tệp mẫu
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                </button>
                                <p className="text-[11px] text-gray-500 mt-0.5">Sử dụng tệp mẫu để đảm bảo dữ liệu đúng định dạng</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleBack} className="px-8 py-3 bg-[#E5E7EB] hover:bg-gray-300 text-gray-700 font-bold rounded-xl">Hủy bỏ</button>
                            <button onClick={handleUploadAndPreview} disabled={!file || isLoading} className={`px-8 py-3 bg-[#0056B3] hover:bg-[#004494] text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 ${(!file || isLoading) ? 'opacity-50' : ''}`}>
                                {isLoading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Tải lên & Xem trước'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
                    {/* PREVIEW CONTENT */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-[#253A8C] rounded-xl mb-4 shadow-lg shadow-blue-200">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
                        </div>
                        <h2 className="text-3xl font-black text-[#111827] mb-3">Xem trước & Kiểm tra dữ liệu</h2>
                        <p className="text-[#4B5563] text-lg max-w-2xl mx-auto">Vui lòng rà soát lại thông tin bên dưới trước khi hoàn tất quá trình nhập dữ liệu vào hệ thống.</p>
                    </div>

                    {/* STATS CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        {[
                            { label: 'Tạo mới', count: previewResult.createdCount, type: 'NEW', color: 'text-green-500', iconBg: 'bg-green-50', icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></> },
                            { label: 'Cập nhật', count: previewResult.updatedCount, type: 'UPDATE', color: 'text-blue-600', iconBg: 'bg-blue-50', icon: <><rect x="6" y="2" width="12" height="20" rx="2" ry="2" /><line x1="9" y1="6" x2="15" y2="6" /><line x1="9" y1="10" x2="15" y2="10" /><line x1="9" y1="14" x2="15" y2="14" /><line x1="9" y1="18" x2="13" y2="18" /></> },
                            { label: 'Lỗi', count: previewResult.errorCount, type: 'ERROR', color: 'text-red-500', iconBg: 'bg-red-50', icon: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></> },
                        ].map((stat, idx) => (
                            <div
                                key={idx}
                                onClick={() => {
                                    setTypeFilter(typeFilter === stat.type ? 'ALL' : stat.type as any);
                                    setCurrentPage(1);
                                }}
                                className={`bg-white rounded-2xl p-8 flex items-center gap-6 shadow-sm border-2 transition-all cursor-pointer hover:scale-[1.03] active:scale-95 ${typeFilter === stat.type ? 'border-[#253A8C] shadow-lg shadow-blue-100' : 'border-transparent hover:border-gray-100'
                                    }`}
                            >
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${stat.iconBg} ${stat.color}`}>
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">{stat.icon}</svg>
                                </div>
                                <div>
                                    <p className="text-gray-400 font-bold text-sm mb-1 uppercase tracking-wider">{stat.label}</p>
                                    <p className={`text-4xl font-black ${stat.color} leading-none`}>{stat.count}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* TABLE AREA */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-10">
                        {/* TABLE FILTERS */}
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                Danh sách chi tiết
                                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-lg text-[10px]">{filteredItems.length}</span>
                            </h3>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Lọc theo:</span>
                                <div className="relative">
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => {
                                            setTypeFilter(e.target.value as any);
                                            setCurrentPage(1);
                                        }}
                                        className="appearance-none pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer hover:border-gray-300 transition-colors"
                                    >
                                        <option value="ALL">Tất cả dữ liệu</option>
                                        <option value="NEW">Tạo mới</option>
                                        <option value="UPDATE">Cập nhật</option>
                                        <option value="ERROR">Lỗi</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="import-table-container">
                                <CommonTable
                                    data={paginatedItems}
                                    columns={columns}
                                    keyExtractor={(item: any) => item.email}
                                    className="import-preview-table"
                                />
                            </div>

                            <Pagination
                                currentPage={currentPage}
                                totalPages={Math.ceil(filteredItems.length / itemsPerPage)}
                                onPageChange={setCurrentPage}
                                totalItems={filteredItems.length}
                                itemsPerPage={itemsPerPage}
                            />
                    </div>

                    {/* FOOTER ACTIONS */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-8 bg-white/50 backdrop-blur-sm p-8 rounded-2xl border border-white">
                        <div className="flex items-start gap-3 max-w-xl">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#253A8C" strokeWidth="4"><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            </div>
                            <p className="text-[#64748B] text-sm leading-relaxed font-medium">
                                <span className="font-bold text-gray-900 leading-none mr-1">Ghi chú:</span>
                                Chỉ các bản ghi hợp lệ mới được xử lý và đưa vào danh sách lớp học chính thức.
                            </p>
                        </div>
                        <div className="flex gap-4 w-full sm:w-auto">
                            <button
                                onClick={() => setPreviewResult(null)}
                                className="flex-1 sm:flex-none px-10 py-4 bg-[#F1F5F9] hover:bg-gray-200 text-[#475569] font-black rounded-2xl transition-all"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleConfirmImport}
                                disabled={isLoading || (previewResult.createdCount + previewResult.updatedCount === 0)}
                                className={`flex-1 sm:flex-none px-12 py-4 bg-[#253A8C] hover:bg-[#1e2e70] text-white font-black rounded-2xl shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-3 ${(isLoading || (previewResult.createdCount + previewResult.updatedCount === 0)) ? 'opacity-50 grayscale' : ''
                                    }`}
                            >
                                {isLoading ? (
                                    <span className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        Xác nhận Import
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ERROR/NOTE BOX Step 1 */}
            {!previewResult && (
                <div className="max-w-5xl mx-auto mt-12">
                    <div className="bg-[#FFF1F2] border border-[#FECACA] rounded-2xl p-8 flex items-start gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        </div>
                        <div>
                            <h3 className="text-[#991B1B] text-xl font-black mb-1">Lưu ý quan trọng</h3>
                            <p className="text-[#B91C1C] font-medium">Hệ thống chỉ chấp nhận định dạng tệp .xlsx và tuân thủ tuyệt đối cấu trúc theo tệp mẫu.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
