import Link from 'next/link';
import PageHeader from '@/shared/components/PageHeader';
import ClassListClient from './_components/ClassListClient';

export default function ClassListPage() {
    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans w-full">
            {/* HEADER */}
            <PageHeader 
                title="Danh sách lớp học"
                action={
                    <Link href="/classes/create">
                        <button className="px-4 py-2.5 bg-[#253A8C] hover:bg-[#1e2e70] text-white text-sm font-medium rounded-lg shadow-sm transition-all flex items-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                            Tạo lớp học mới
                        </button>
                    </Link>
                }
            />

            <ClassListClient />
        </div>
    );
}