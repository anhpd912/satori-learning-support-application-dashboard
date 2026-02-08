'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Toast, { ToastType } from '@/shared/components/Toast';
import FormInput from '@/shared/components/FormInput'; 
import { authService } from '../../../services/auth.service';

interface Props {
    onSuccess: (email: string) => void;
}

export default function RequestEmailForm({ onSuccess }: Props) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '', type: 'success', isVisible: false
    });

    const validateEmail = (val: string) => {
        if (!val.trim()) return 'Vui lòng nhập địa chỉ email';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val.trim())) return 'Email không đúng định dạng';
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const validationError = validateEmail(email);
        if (validationError) {
            setError(validationError);
            return;
        }
        setError(null); 

        setIsLoading(true);
        try {
            await authService.forgotPassword(email.trim());
            onSuccess(email.trim());
        } catch (err: any) {
            setToast({ message: err.message || 'Có lỗi xảy ra', type: 'error', isVisible: true });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full animate-in fade-in slide-in-from-right-4 duration-300">
            <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Quên mật khẩu?</h2>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Nhập email liên kết với tài khoản để nhận mã xác thực (OTP) thiết lập lại mật khẩu.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    <FormInput
                        label="Email"
                        placeholder="Nhập email của bạn"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) setError(null); 
                        }}
                        error={error}
                        icon={
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                        }
                    />

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-[#253A8C] hover:bg-[#1e2e70] text-white font-bold rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading && <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                        <span>Gửi mã OTP</span>
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