'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthInput from '../../components/AuthInput';
import { authService } from '../../services/auth.service';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });

  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '' };

    if (!formData.email.trim()) {
        newErrors.email = 'Vui lòng nhập email';
        isValid = false;
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Hãy nhập email hợp lệ';
            isValid = false;
        }
    }

    if (!formData.password) {
        newErrors.password = 'Vui lòng nhập mật khẩu';
        isValid = false;
    } else {
        if (formData.password.length < 8) {
            newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
            isValid = false;
        } else if (!/[A-Z]/.test(formData.password)) {
            newErrors.password = 'Mật khẩu phải chứa ít nhất 1 chữ hoa';
            isValid = false;
        } else if (!/[0-9]/.test(formData.password)) {
            newErrors.password = 'Mật khẩu phải chứa ít nhất 1 số';
            isValid = false;
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
            newErrors.password = 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt';
            isValid = false;
        }
    }

    setFieldErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setErrorMessage('');
    
    if (!validateForm()) {
        return;
    }

    setIsLoading(true);

    try {
        const data = await authService.login(formData.email, formData.password);
        
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('currentUser', JSON.stringify(data.user));

        const role = data.user.role;

        switch (role) {
            case 'ADMIN':
                router.push('/admin/users'); 
                break;

            case 'CONTENT_MANAGER':
                router.push('/content-manager-homepage'); 
                break;
                
            case 'OPERATION_MANAGER':
                router.push('/operation-manager-homepage'); 
                break;

            case 'TEACHER':
                router.push('/my-classes'); 
                break;
            default:
                router.push('/forbidden');
        }

    } catch (err: unknown) {
        setErrorMessage((err as Error).message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (fieldErrors[field as keyof typeof fieldErrors]) {
          setFieldErrors(prev => ({ ...prev, [field]: '' }));
      }
  };

  return (
    <>
        <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng quay trở lại</h2>
            <p className="text-gray-500">Vui lòng đăng nhập</p>
        </div>

        {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="text-red-500 mt-0.5 shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>                        
                        </svg>
                </div>
                <div className="text-sm text-red-800">
                    <span className="font-semibold block mb-1">Đăng nhập thất bại</span>
                    {errorMessage}
                </div>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">        
            <AuthInput 
                label="Email"
                placeholder="Nhập email của bạn"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={fieldErrors.email}
                icon={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                         <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                }
            />

            <AuthInput 
                label="Mật khẩu"
                placeholder="Nhập mật khẩu"
                isPassword={true}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={fieldErrors.password}
            />

                <div className="flex items-center justify-between pt-1">
                    <Link href="/forgot-password" className="text-sm font-medium text-[#253A8C] hover:text-[#1e2e70] hover:underline">
                        Quên mật khẩu?
                    </Link>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white transition-all duration-200 ${
                        isLoading 
                        ? 'bg-indigo-400 cursor-not-allowed opacity-90'
                        : 'bg-[#253A8C] hover:bg-[#1e2e70] active:scale-[0.99]'
                    }`}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Đang xử lý...</span>
                        </div>
                    ) : (
                        'Đăng nhập'
                    )}
                </button>
            </form>
        </>
    );
}