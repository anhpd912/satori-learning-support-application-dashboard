'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Toast, { ToastType } from '@/shared/components/Toast';
import AuthInput from '../../../components/AuthInput';
import { authService } from '../../../services/auth.service';

interface Props {
    token: string;
}

export default function NewPasswordForm({ token }: Props) {
    const router = useRouter();
    
    const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
    const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
    
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '', type: 'success', isVisible: false
    });

    const validateForm = () => {
        const newErrors: { newPassword?: string; confirmPassword?: string } = {};
        const { newPassword, confirmPassword } = formData;
        let isValid = true;

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            newErrors.newPassword = 'Mật khẩu yếu (Cần 8+ ký tự, Hoa, Thường, Số)';
            isValid = false;
        }

        if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            await authService.resetPassword({
                resetToken: token,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword
            });

            setToast({ message: 'Cập nhật mật khẩu thành công!', type: 'success', isVisible: true });
            
            setTimeout(() => {
                router.push('/login');
            }, 1500);

        } catch (error: any) {
            setToast({ message: error.message || 'Có lỗi xảy ra', type: 'error', isVisible: true });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full animate-in fade-in slide-in-from-right-4 duration-300">
            <Toast 
                message={toast.message} type={toast.type} 
                isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
            />
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Đặt lại mật khẩu</h2>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Vui lòng thiết lập mật khẩu mới cho tài khoản của bạn.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <AuthInput
                        label="Mật khẩu mới"
                        isPassword={true} // Bật chế độ password (có mắt)
                        value={formData.newPassword}
                        onChange={(e) => {
                            setFormData({ ...formData, newPassword: e.target.value });
                            if (errors.newPassword) setErrors({ ...errors, newPassword: undefined });
                        }}
                        placeholder="Nhập mật khẩu mới"
                        error={errors.newPassword} // Truyền lỗi vào đây
                    />

                    <AuthInput
                        label="Xác nhận mật khẩu mới"
                        isPassword={true}
                        value={formData.confirmPassword}
                        onChange={(e) => {
                            setFormData({ ...formData, confirmPassword: e.target.value });
                            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                        }}
                        placeholder="Nhập lại mật khẩu mới"
                        error={errors.confirmPassword}
                    />

                    <div className="bg-gray-50 p-4 rounded-lg flex items-start gap-3">
                        <div className="mt-0.5 text-gray-500">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                            </svg>
                        </div>
                        <p className="text-xs text-gray-500 leading-tight">
                            Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-[#253A8C] hover:bg-[#1e2e70] text-white font-bold rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading && (
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        )}
                        <span>Cập nhật mật khẩu</span>
                    </button>

                    <div className="text-center pt-2">
                        <Link 
                            href="/login" 
                            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-[#253A8C] transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}