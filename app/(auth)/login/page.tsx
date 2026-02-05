'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthBranding from '../components/AuthBranding';
import AuthInput from '../components/AuthInput';
import { authService } from '../login/services/auth.service';

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

    // 1. Validate Email
    if (!formData.email.trim()) {
        newErrors.email = 'Vui lòng nhập email';
        isValid = false;
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Email không đúng định dạng';
            isValid = false;
        }
    }

    // 2. Validate Password
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
        localStorage.setItem('currentUser', JSON.stringify(data.user));

        const role = data.user.role;

        switch (role) {
            case 'ADMIN':
                router.push('/admin/users'); 
                break;

            case 'MANAGER':
                router.push('/users'); 
                break;

            case 'TEACHER':
                router.push('/dashboard'); 
                break;
            default:
                router.push('/dashboard');
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
    <div className="min-h-screen w-full flex font-sans bg-white">
      
      <AuthBranding />

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-[440px]">
            
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
                    <div className="flex items-center">
                        <input 
                            id="remember-me" 
                            type="checkbox" 
                            className="h-4 w-4 text-[#253A8C] focus:ring-[#253A8C] border-gray-300 rounded cursor-pointer"
                            checked={formData.remember}
                            onChange={(e) => setFormData({...formData, remember: e.target.checked})}
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer select-none">
                            Ghi nhớ đăng nhập
                        </label>
                    </div>
                    <Link href="/forgot-password" className="text-sm font-medium text-[#253A8C] hover:text-[#1e2e70] hover:underline">
                        Quên mật khẩu?
                    </Link>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading} // 1. Vô hiệu hóa nút khi đang tải
                    className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white transition-all duration-200 ${
                        isLoading 
                        ? 'bg-indigo-400 cursor-not-allowed opacity-90' // Style khi đang loading (mờ đi, không bấm được)
                        : 'bg-[#253A8C] hover:bg-[#1e2e70] active:scale-[0.99]' // Style bình thường
                    }`}
                >
                    {isLoading ? (
                        // 2. Hiển thị Spinner khi đang loading
                        <div className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Đang xử lý...</span>
                        </div>
                    ) : (
                        // 3. Hiển thị chữ bình thường khi chưa bấm
                        'Đăng nhập'
                    )}
                </button>
            </form>

            <div className="mt-8 mb-6 relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="px-4 bg-white text-sm text-gray-500">hoặc</span>
                </div>
            </div>

            <button 
                type="button" 
                className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-200 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                    <path d="M12 4.36c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Tiếp tục với Google
            </button>

        </div>
      </div>
    </div>
  );
}