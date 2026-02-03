'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AuthBranding from '../components/AuthBranding';
import AuthInput from '../components/AuthInput';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login Submit:', formData);
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

            <form onSubmit={handleSubmit} className="space-y-6">
                
                <AuthInput 
                    label="Email"
                    placeholder="Nhập email của bạn"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
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
                    className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#253A8C] hover:bg-[#1e2e70] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#253A8C] transition-all transform active:scale-[0.99]"
                >
                    Đăng nhập
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