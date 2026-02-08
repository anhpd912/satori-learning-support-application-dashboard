'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Toast, { ToastType } from '@/shared/components/Toast';
import AuthInput from '@/app/(auth)/components/AuthInput'; 
import { authService } from '@/app/(auth)/services/auth.service';

export default function ChangePasswordForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '', type: 'success', isVisible: false
    });

    const handleChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        const { oldPassword, newPassword, confirmPassword } = formData;
        let isValid = true;

        if (!oldPassword) {
            newErrors.oldPassword = 'Vui lòng nhập mật khẩu hiện tại';
            isValid = false;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            newErrors.newPassword = 'Mật khẩu chưa đủ mạnh';
            isValid = false;
        }

        if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';
            isValid = false;
        }

        if (oldPassword && newPassword && oldPassword === newPassword) {
            newErrors.newPassword = 'Mật khẩu mới không được trùng với mật khẩu cũ';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        // Reset lỗi cũ và toast trước khi gọi API
        setErrors({}); 
        setToast(prev => ({ ...prev, isVisible: false }));

        try {
            await authService.changePassword({
                currentPassword: formData.oldPassword,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword,
                logoutOtherDevices: true
            });

            setToast({ message: 'Cập nhật mật khẩu thành công! Vui lòng đăng nhập lại.', type: 'success', isVisible: true });
            setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });

            setTimeout(() => {
                authService.logout();
                router.push('/login');
            }, 1500);
        } catch (err: any) {
            const errorMessage = err.message || 'Đổi mật khẩu thất bại';

            // 👇 LOGIC MỚI: Kiểm tra nếu thông báo lỗi liên quan đến mật khẩu cũ
            if (errorMessage === "Mật khẩu hiện tại không chính xác") {
                setErrors(prev => ({
                    ...prev,
                    oldPassword: errorMessage // Gán lỗi vào đúng ô Input mật khẩu cũ
                }));
            } else {
                // Các lỗi khác (như lỗi server, mất mạng...) thì hiện Toast như bình thường
                setToast({ message: errorMessage, type: 'error', isVisible: true });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setErrors({});
    };

    return (
        <div className="w-full">
            <Toast 
                message={toast.message} type={toast.type} 
                isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
            />

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Đổi mật khẩu</h1>
                <p className="text-gray-500 text-base">
                    Vui lòng nhập mật khẩu hiện tại và mật khẩu mới để bảo mật tài khoản.
                </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full">
                <form onSubmit={handleSubmit}>
                    
                    <div className="p-8 space-y-6">
                    
                        <div className="max-w-xl">
                            <AuthInput
                                label="Mật khẩu hiện tại"
                                isPassword={true}
                                placeholder="••••••••"
                                value={formData.oldPassword}
                                onChange={(e) => handleChange('oldPassword', e.target.value)}
                                error={errors.oldPassword}
                            />
                        </div>

                        <div className="max-w-xl">
                            <AuthInput
                                label="Mật khẩu mới"
                                isPassword={true}
                                placeholder="••••••••"
                                value={formData.newPassword}
                                onChange={(e) => handleChange('newPassword', e.target.value)}
                                error={errors.newPassword}
                            />
                        </div>

                        <div className="max-w-xl">
                            <AuthInput
                                label="Xác nhận mật khẩu mới"
                                isPassword={true}
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                error={errors.confirmPassword}
                            />
                        </div>

                        <div className="flex gap-3 items-start pt-2 max-w-2xl">
                            <div className="text-gray-400 mt-0.5 shrink-0">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                                </svg>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Mật khẩu phải có ít nhất 8 ký tự, bao gồm cả chữ và số. Tránh sử dụng mật khẩu dễ đoán như tên hoặc ngày sinh.
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 sm:px-8 sm:py-6 border-t border-gray-100 flex flex-row items-center gap-4">
    
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="whitespace-nowrap px-6 py-2.5 bg-[#253A8C] hover:bg-[#1e2e70] text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {isLoading && (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            )}
                            Cập nhật mật khẩu
                        </button>

                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="whitespace-nowrap px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                        >
                            Hủy bỏ
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}