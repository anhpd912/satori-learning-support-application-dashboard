'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Toast, { ToastType } from '@/shared/components/Toast';
import { authService } from '../../../services/auth.service';

interface Props {
    email: string;
    onVerified: (token: string) => void;
    onBack: () => void; 
}

export default function VerifyOtpForm({ email, onVerified, onBack }: Props) {
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    
    const [timer, setTimer] = useState(60);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '', type: 'success', isVisible: false
    });

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleChange = (element: HTMLInputElement, index: number) => {
        const val = element.value;
        if (isNaN(Number(val))) return;

        const newOtp = [...otp];
        newOtp[index] = val.substring(val.length - 1);
        setOtp(newOtp);

        if (val && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim().slice(0, 6).split('');
        if (pastedData.every(char => !isNaN(Number(char)))) {
            const newOtp = [...otp];
            pastedData.forEach((val, i) => { if (i < 6) newOtp[i] = val; });
            setOtp(newOtp);
            inputRefs.current[Math.min(pastedData.length - 1, 5)]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpCode = otp.join('');
        if (otpCode.length < 6) return;

        setIsLoading(true);
        try {
            const response = await authService.verifyOtp(email, otpCode);
            
            onVerified(response.resetToken);
        } catch (error: any) {
            setToast({ message: error.message || 'Mã OTP không chính xác', type: 'error', isVisible: true });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;
        try {
            await authService.forgotPassword(email);
            setTimer(60);
            setToast({ message: 'Đã gửi lại mã OTP mới', type: 'success', isVisible: true });
        } catch (error: any) {
            setToast({ message: error.message, type: 'error', isVisible: true });
        }
    };

    return (
        <div className="w-full animate-in fade-in slide-in-from-right-4 duration-300">
            <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Xác thực OTP</h2>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Nhập mã xác thực gồm 6 chữ số đã được gửi đến email của bạn.
                    </p>
                </div>

                <div className="space-y-8">
                    <div className="flex justify-between gap-2">
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                maxLength={1}
                                value={data}
                                onChange={(e) => handleChange(e.target, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onPaste={index === 0 ? handlePaste : undefined}
                                className="w-10 h-10 sm:w-12 sm:h-12 border border-gray-200 rounded-lg text-center text-xl font-bold text-gray-900 focus:border-[#253A8C] focus:ring-2 focus:ring-[#253A8C]/20 outline-none transition-all"
                            />
                        ))}
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-gray-500">Bạn không nhận được mã? </span>
                        <button 
                            onClick={handleResend} 
                            disabled={timer > 0}
                            className={`font-medium transition-colors ${timer > 0 ? 'text-blue-400 cursor-not-allowed' : 'text-[#253A8C] hover:underline'}`}
                        >
                            {timer > 0 ? `Gửi lại mã sau ${timer}s` : 'Gửi lại mã'}
                        </button>
                    </div>

                    <button
                        onClick={handleVerify}
                        disabled={isLoading || otp.join('').length < 6}
                        className="w-full py-3 px-4 bg-[#253A8C] hover:bg-[#1e2e70] text-white font-bold rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading && <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                        <span>Xác nhận mã OTP</span>
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
                </div>
            </div>
        </div>
    );
}