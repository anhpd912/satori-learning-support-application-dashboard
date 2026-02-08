'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MenuItem } from '@/shared/constants/sidebar-menus';
import Image from 'next/image';
import { authService } from '@/app/(auth)/services/auth.service'; // Đảm bảo đường dẫn import đúng

interface SidebarProps {
  menuItems: MenuItem[];
}

export default function Sidebar({ menuItems }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState({
    fullName: 'Đang tải...',
    role: '...',
    avatar: ''
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('currentUser');
        
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setTimeout(() => {
                    setCurrentUser({
                        fullName: parsedUser.fullName || 'Người dùng',
                        role: parsedUser.role || 'Manager',
                        avatar: parsedUser.avatar || '' 
                    });
                }, 0);
            } catch (error) {
                console.error("Lỗi đọc dữ liệu user:", error);
            }
        }
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsUserMenuOpen(false);
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col justify-between sticky top-0 left-0 overflow-y-auto z-50">
      
      {/* --- LOGO & MENU --- */}
      <div>
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="relative w-10 h-10 border border-gray-200 rounded-lg p-0.5 bg-white overflow-hidden shadow-sm">
            <Image
              src="/Images/logo.svg" 
              alt="Logo JLSA"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-lg leading-none">JLSA Portal</h1>
            <span className="text-xs text-gray-500 font-medium">Trang Quản Trị</span>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="px-4 space-y-1 mt-2">
          {menuItems.map((item) => {
            const isDashboard = item.path === '/' || item.path === '/dashboard';
            const isActive = isDashboard 
                ? pathname === item.path 
                : pathname.startsWith('/users') && item.path.includes('/users') 
                ? true 
                : pathname === item.path;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className={`${isActive ? 'text-indigo-700' : 'text-gray-400'}`}>
                   {item.icon}
                </div>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* --- USER PROFILE --- */}
      <div className="p-4 border-t border-gray-100 relative">
        
        {/* 1. MENU DROP-UP (Popup Menu) */}
        {isUserMenuOpen && (
            <>
                <div 
                    className="fixed inset-0 z-40 cursor-default" 
                    onClick={() => setIsUserMenuOpen(false)}
                ></div>

                <div className="absolute bottom-[110%] left-4 right-4 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
                    
                    <Link 
                        href="/change-password"
                        onClick={() => setIsUserMenuOpen(false)} // Đóng menu khi click
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors text-left border-b border-gray-50"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Đổi mật khẩu
                    </Link>

                    {/* Nút Đăng xuất */}
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Đăng xuất
                    </button>
                </div>
            </>
        )}

        {/* 2. NÚT PROFILE HIỂN THỊ THÔNG TIN */}
        <div 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition border ${
                isUserMenuOpen ? 'bg-gray-50 border-gray-200' : 'hover:bg-gray-50 border-transparent'
            }`}
        >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-200 flex-shrink-0 relative">
              {currentUser.avatar ? (
                  <img 
                      src={currentUser.avatar} 
                      alt={currentUser.fullName} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.fullName)}&background=random`;
                      }} 
                  />
              ) : (
                  <img 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.fullName)}&background=random`}
                      alt={currentUser.fullName}
                      className="w-full h-full object-cover"
                  />
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-700 truncate">{currentUser.fullName}</p>
                <p className="text-xs text-gray-500 truncate capitalize">{currentUser.role}</p>
            </div>

            <div className={`text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}>
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
                 </svg>
            </div>
        </div>
      </div>
    </aside>
  );
}