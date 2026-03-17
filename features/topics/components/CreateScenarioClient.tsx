'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/shared/components/PageHeader';

interface Mission {
    id: string;
    text: string;
}

interface ScenarioForm {
    name: string;
    description: string;
    level: string;
    studentRole: string;
    aiRole: string;
    context: string;
    missions: Mission[];
}

const LEVEL_OPTIONS = [
    'N5 - Sơ cấp 1',
    'N4 - Sơ cấp 2',
    'N3 - Trung cấp',
    'N2 - Cao cấp',
    'N1 - Thành thạo',
];

export default function CreateScenarioClient({ topicId }: { topicId: string }) {
    const router = useRouter();

    const [form, setForm] = useState<ScenarioForm>({
        name: '',
        description: '',
        level: LEVEL_OPTIONS[0],
        studentRole: '',
        aiRole: '',
        context: '',
        missions: [
            { id: '1', text: '' },
            { id: '2', text: '' },
            { id: '3', text: '' },
        ],
    });

    const updateForm = (field: keyof ScenarioForm, value: any) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const updateMission = (id: string, text: string) =>
        updateForm(
            'missions',
            form.missions.map(m => (m.id === id ? { ...m, text } : m))
        );

    const handleSubmit = () => {
        const payload = {
            topicId,
            ...form,
            missions: form.missions.map(m => m.text).filter(Boolean),
        };
        console.log('=== PAYLOAD GỬI VỀ BACKEND ===');
        console.log(JSON.stringify(payload, null, 2));
        alert('Đã in payload ra Console (F12)!');
    };

    const handleAIFill = () => {
        // Mock AI auto-fill
        setForm({
            name: 'Mua sắm tại siêu thị',
            description: 'Trong bài thực hành này, bạn đang đi du lịch tại Nhật Bản và ghé vào một cửa hàng. Hãy vận dụng từ vựng bài 5 để hỏi giá và mặc cả một chiếc áo thun nhé!',
            level: 'N5 - Sơ cấp 1',
            studentRole: 'Khách hàng tìm mua thực phẩm',
            aiRole: 'Nhân viên bán hàng thân thiện',
            context: 'Khách hàng vào siêu thị để mua thực phẩm cho bữa tối. Nhân viên hỗ trợ tìm hàng, giới thiệu sản phẩm và hướng dẫn thanh toán.',
            missions: [
                { id: '1', text: 'Hỏi giá tiền của sản phẩm' },
                { id: '2', text: 'Mặc cả giảm giá' },
                { id: '3', text: 'Yêu cầu thanh toán bằng thẻ tín dụng' },
            ],
        });
    };

    return (
        <div className="flex flex-col gap-6">

            <PageHeader 
                breadcrumb={[
                    { label: 'Quản lý Chủ đề Giao tiếp', href: '/topics' },
                    { label: 'Mua sắm & Siêu thị', href: `/topics/${topicId}` },
                    { label: 'Tạo kịch bản hội thoại', active: true }
                ]}
                backUrl={`/topics/${topicId}`}
                title="Thiết lập kịch bản hội thoại"
                titleAlign="right"
            />

            {/* ── 1. THÔNG TIN CƠ BẢN ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#1A8DFF] text-white flex items-center justify-center text-[10px] font-bold shrink-0">i</div>
                        <h2 className="text-base font-bold text-gray-900">Thông tin cơ bản</h2>
                    </div>

                    {/* AI Auto-fill button */}
                    <button
                        type="button"
                        onClick={handleAIFill}
                        className="flex items-center gap-2 bg-[#253A8C] hover:bg-[#1a2b6b] text-white text-sm font-bold px-4 py-2 rounded-xl shadow-sm transition-all"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                            <path d="M12 2.5L14.2 9.49997L21.5 12L14.2 14.5L12 21.5L9.8 14.5L2.5 12L9.8 9.49997L12 2.5ZM6 5L6.6 6.89999L8.5 7.5L6.6 8.1L6 10L5.4 8.1L3.5 7.5L5.4 6.89999L6 5ZM18 14L18.6 15.9L20.5 16.5L18.6 17.1L18 19L17.4 17.1L15.5 16.5L17.4 15.9L18 14Z" />
                        </svg>
                        AI tự động điền Form
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tên bài hội thoại */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Tên bài hội thoại <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => updateForm('name', e.target.value)}
                            placeholder="Ví dụ: Mua sắm tại siêu thị"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1A8DFF] placeholder-gray-400 font-medium"
                        />
                    </div>

                    {/* Trình độ áp dụng */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Trình độ áp dụng</label>
                        <div className="relative">
                            <select
                                value={form.level}
                                onChange={e => updateForm('level', e.target.value)}
                                className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 font-bold appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#1A8DFF] cursor-pointer"
                            >
                                {LEVEL_OPTIONS.map(opt => (
                                    <option key={opt}>{opt}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Mô tả */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả</label>
                        <textarea
                            value={form.description}
                            onChange={e => updateForm('description', e.target.value)}
                            placeholder="Mô tả ngắn gọn bài hội thoại"
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1A8DFF] placeholder-gray-400 font-medium resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* ── 2. CHI TIẾT KỊCH BẢN ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-[#1A8DFF]">
                        <path d="M12 2.5L14.2 9.49997L21.5 12L14.2 14.5L12 21.5L9.8 14.5L2.5 12L9.8 9.49997L12 2.5ZM6 5L6.6 6.89999L8.5 7.5L6.6 8.1L6 10L5.4 8.1L3.5 7.5L5.4 6.89999L6 5ZM18 14L18.6 15.9L20.5 16.5L18.6 17.1L18 19L17.4 17.1L15.5 16.5L17.4 15.9L18 14Z" />
                    </svg>
                    <h2 className="text-base font-bold text-gray-900">Chi tiết kịch bản</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Vai trò học viên */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Vai trò của Học viên</label>
                        <input
                            type="text"
                            value={form.studentRole}
                            onChange={e => updateForm('studentRole', e.target.value)}
                            placeholder="Ví dụ: Khách hàng tìm mua thực phẩm"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1A8DFF] placeholder-gray-400 font-medium"
                        />
                    </div>

                    {/* Vai trò AI */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Vai trò của AI</label>
                        <input
                            type="text"
                            value={form.aiRole}
                            onChange={e => updateForm('aiRole', e.target.value)}
                            placeholder="Ví dụ: Nhân viên bán hàng thân thiện"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1A8DFF] placeholder-gray-400 font-medium"
                        />
                    </div>
                </div>

                {/* Bối cảnh */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Bối cảnh</label>
                    <div className="relative">
                        <textarea
                            value={form.context}
                            onChange={e => updateForm('context', e.target.value)}
                            rows={4}
                            placeholder="Mô tả chi tiết bối cảnh hội thoại và các quy tắc ứng xử cho AI..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1A8DFF] placeholder-gray-400 font-medium resize-none"
                        />
                        <p className="text-xs text-gray-400 mt-1.5 pl-1">
                            Gợi ý: Hãy mô tả nơi chốn, thời gian và mục tiêu cụ thể của cuộc hội thoại.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── 3. NHIỆM VỤ HỘI THOẠI ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-1">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <h2 className="text-base font-bold text-gray-900">Nhiệm vụ hội thoại</h2>
                </div>
                <p className="text-xs text-gray-500 mb-5 ml-6">Học viên cần hoàn thành các nhiệm vụ này để đạt điểm cao.</p>

                <div className="flex flex-col gap-3">
                    {form.missions.map((mission, index) => (
                        <div key={mission.id} className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center shrink-0">
                                {index + 1}
                            </div>
                            <input
                                type="text"
                                value={mission.text}
                                onChange={e => updateMission(mission.id, e.target.value)}
                                placeholder={`Nhập nhiệm vụ ${index + 1}...`}
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1A8DFF] placeholder-gray-400 font-medium"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── STICKY ACTION BAR ── */}
            <div className="fixed bottom-0 left-0 w-full lg:left-[260px] lg:w-[calc(100%-260px)] bg-white border-t border-gray-100 px-8 py-4 flex justify-end items-center gap-4 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="text-gray-500 font-bold text-sm hover:text-gray-900 transition"
                >
                    Hủy bỏ
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex items-center gap-2 bg-[#1A8DFF] hover:bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all text-sm"
                >
                    Lưu Kịch bản
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                    </svg>
                </button>
            </div>

        </div>
    );
}
