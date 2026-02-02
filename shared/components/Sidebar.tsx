'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuItem } from '@/shared/constants/sidebar-menus';
import Image from 'next/image';

interface SidebarProps {
  menuItems: MenuItem[];
  user: {
    name: string;
    role: string;
    avatar: string;
  };
}

export default function Sidebar({ menuItems, user }: SidebarProps) {
  const pathname = usePathname(); // Lấy URL hiện tại

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col justify-between sticky top-0 left-0 overflow-y-auto">
      
      {/* --- PHẦN TRÊN: LOGO & MENU --- */}
      <div>
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="relative w-10 h-10 border border-gray-200 rounded-lg p-0.5 bg-white overflow-hidden shadow-sm"> {/* Bọc trong div để dễ chỉnh size */}
            <Image
              src="/Images/logo.svg" 
              alt="Logo JLSA"
              width={40}              // Chiều rộng ảnh (px)
              height={40}             // Chiều cao ảnh (px)
              className="object-contain" // Giữ tỉ lệ ảnh không bị méo
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
            // Kiểm tra xem URL hiện tại có bắt đầu bằng path của menu không (để active cả trang con)
            const isDashboard = item.path === '/' || item.path === '/dashboard';
          
            const isActive = isDashboard 
                ? pathname === item.path 
                : pathname.startsWith('/users') && item.path.includes('/users') 
                ? true // Hardcode tạm cho module Users (hoặc dùng logic cắt chuỗi bên dưới)
                : pathname === item.path;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm' // Style khi Active
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900' // Style thường
                }`}
              >
                {/* Icon */}
                <div className={`${isActive ? 'text-indigo-700' : 'text-gray-400'}`}>
                   {item.icon}
                </div>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* --- PHẦN DƯỚI: USER PROFILE --- */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-200">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-full h-full object-cover" 
                  onError={(e) => e.currentTarget.src = 'https://ui-avatars.com/api/?name=User&background=random'} 
                />
            </div>
            <div>
                <p className="text-sm font-semibold text-gray-700">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
            </div>
        </div>
      </div>
    </aside>
  );
}