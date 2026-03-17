'use client';

import React from 'react';
import Link from 'next/link';
import PageHeader from '@/shared/components/PageHeader';

interface ScenarioDetailProps {
    topicId: string;
    scenarioId: string;
}

export default function ScenarioDetailClient({ topicId, scenarioId }: ScenarioDetailProps) {
    // Mock Data
    const scenario = {
        title: "Mặc cả mua áo thun",
        level: "N5",
        status: "PUBLISHED",
        description: "Trong bài thực hành này, bạn đang đi du lịch tại Nhật Bản và ghé vào một cửa hàng. Hãy vận dụng từ vựng bài 5 để hỏi giá và mặc một chiếc áo thun nhé!",
        studentRole: "Khách du lịch nước",
        aiRole: "Nhân viên bán hàng khó tính",
        context: "Nhập bối cảnh cuộc gọi. Bạn đang ở chợ Asakusa. Hãy vào vai một nhân viên bán hàng khó tính. Chỉ sử dụng từ vựng và ngữ pháp cấp độ N5. Trả lời ngắn gọn dưới 3 câu. Thể hiện thái độ nhiệt tình nhưng kiên quyết về giá cả. Luôn nhắc đến chất lượng của vải áo...",
        objectives: [
            "Hỏi giá của một chiếc áo thun",
            "Đề nghị giảm giá 10%",
            "Yêu cầu thanh toán bằng thẻ"
        ]
    };

    return (
        <div className="bg-slate-50/50 min-h-screen pb-20">
            <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
                {/* Header section with breadcrumbs */}
                <PageHeader 
                    breadcrumb={[
                        { label: 'Quản lý Chủ đề Giao tiếp', href: '/topics' },
                        { label: 'Mua sắm', href: `/topics/${topicId}` },
                        { label: 'Chi tiết hội thoại', active: true }
                    ]}
                    backUrl={`/topics/${topicId}`}
                    title="Chi tiết hội thoại"
                    titleAlign="right"
                />

                {/* Thông tin chung */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 pb-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 flex items-center gap-4">
                        <Link 
                            href={`/topics/${topicId}/scenarios/${scenarioId}/edit`} 
                            className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-bold border border-slate-100 hover:bg-slate-100 transition-all shadow-sm"
                        >
                            Chỉnh sửa Thông tin
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        </Link>
                        <button className="flex items-center gap-2 text-red-500 text-sm font-bold hover:opacity-70 transition-opacity">
                            Xóa hội thoại
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{scenario.title}</h1>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                            Đang hoạt động
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        </span>
                    </div>

                    <p className="text-slate-500 leading-relaxed font-normal max-w-4xl">
                        {scenario.description}
                    </p>
                </div>

                {/* Cấu hình AI & Phân vai */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-50 flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                        </div>
                        <h2 className="text-base font-bold text-gray-900">Cấu hình AI & Phân vai</h2>
                    </div>
                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex items-center gap-4 p-6 bg-slate-50/50 rounded-2xl border border-slate-50 group hover:bg-white hover:border-blue-100 hover:shadow-md transition-all">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                </div>
                                <div>
                                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Vai của Học viên</div>
                                    <div className="text-base font-bold text-slate-800 tracking-tight">{scenario.studentRole}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-6 bg-slate-50/50 rounded-2xl border border-slate-50 group hover:bg-white hover:border-purple-100 hover:shadow-md transition-all">
                                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
                                </div>
                                <div>
                                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Vai của AI</div>
                                    <div className="text-base font-bold text-slate-800 tracking-tight">{scenario.aiRole}</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Ngữ cảnh & Chỉ thị</h3>
                            </div>
                            <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-100 text-slate-500 font-normal leading-relaxed italic">
                                {scenario.context}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mục tiêu Bài học */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-50 flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Mục tiêu Bài học</h2>
                    </div>
                    <div className="p-8">
                        <p className="text-slate-400 text-sm font-normal mb-8">Các mục tiêu học viên cần đạt được trong cuộc hội thoại.</p>
                        <div className="space-y-4">
                            {scenario.objectives.map((obj, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-2xl hover:border-blue-100 hover:shadow-sm transition-all group">
                                    <div className="w-8 h-8 rounded-full border-2 border-slate-100 flex items-center justify-center group-hover:border-blue-500 group-hover:bg-blue-50 transition-all">
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-100 group-hover:bg-blue-500 transition-all"></div>
                                    </div>
                                    <span className="text-base font-semibold text-slate-700">{obj}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
