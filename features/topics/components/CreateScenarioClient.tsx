'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { topicService } from '../services/topic-service';
import PageHeader from '@/shared/components/PageHeader';
import Toast from '@/shared/components/Toast';

interface Mission {
    id: string;
    text: string;
    description?: string;
}

interface ScenarioForm {
    name: string;
    titleJapanese: string;
    description: string;
    descriptionVi: string;
    level: string;
    learnerRole: string;
    aiRole: string;
    context: string;
    missions: Mission[];
}

const LEVEL_OPTIONS = [
    'N5',
    'N4',
    'N3',
    'N2',
    'N1',
];

export default function CreateScenarioClient({ topicId }: { topicId: string }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Toast state
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
        message: '',
        type: 'success',
        isVisible: false
    });

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type, isVisible: true });
    };

    const [form, setForm] = useState<ScenarioForm>({
        name: '',
        titleJapanese: '',
        description: '',
        descriptionVi: '',
        level: LEVEL_OPTIONS[0],
        learnerRole: '',
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

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            alert('Vui lòng nhập tên bài hội thoại');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                themeId: topicId,
                title: form.name,
                titleJapanese: form.titleJapanese,
                description: form.description,
                descriptionVi: form.descriptionVi,
                jlptLevel: form.level,
                roleplayContext: JSON.stringify(form.context),
                learnerRole: form.learnerRole,
                aiRole: form.aiRole,
                scenario: form.context,
                status: 'DRAFT',
                vocabularyHints: JSON.stringify(''),
                grammarPoints: JSON.stringify(''),
                usefulExpressions: JSON.stringify(''),
                missions: form.missions
                    .filter(m => m.text.trim())
                    .map((m, idx) => ({
                        title: m.text,
                        description: m.description || '',
                        orderIndex: idx + 1
                    })),
            };

            const response = await topicService.createScenario(payload);
            if (response.success) {
                showToast('Tạo kịch bản thành công!');
                setTimeout(() => {
                    router.push(`/topics/${topicId}/scenarios/${response.data.id}`);
                }, 1500);
            }
        } catch (error) {
            console.error('Failed to create scenario:', error);
            alert('Có lỗi xảy ra khi tạo kịch bản.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAIFill = () => {
        setForm({
            name: 'Mua sắm tại siêu thị',
            titleJapanese: 'スーパーで買い物',
            description: 'スーパーで買い物をするシチュエーションです',
            descriptionVi: 'Thực hành hội thoại khi đi mua sắm tại siêu thị Nhật Bản.',
            level: 'N5',
            learnerRole: 'Khách hàng',
            aiRole: 'Nhân viên bán hàng',
            context: 'Bạn đang ở trong một siêu thị tại Tokyo. Bạn muốn mua một số thực phẩm và cần hỏi nhân viên về vị trí của chúng cũng như giá cả.',
            missions: [
                { id: '1', text: 'Hỏi vị trí của sữa và trứng' },
                { id: '2', text: 'Hỏi giá của một túi táo' },
                { id: '3', text: 'Thanh toán tại quầy' },
            ],
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <PageHeader 
                breadcrumb={[
                    { label: 'Quản lý Chủ đề Giao tiếp', href: '/topics' },
                    { label: 'Chi tiết Chủ đề', href: `/topics/${topicId}` },
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

                    <button
                        type="button"
                        onClick={handleAIFill}
                        className="flex items-center gap-2 bg-[#253A8C] hover:bg-[#1a2b6b] text-white text-sm font-bold px-4 py-2 rounded-xl shadow-sm transition-all"
                    >
                        AI tự động điền Form
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Tên bài hội thoại (Tiếng Việt) *</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => updateForm('name', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A8DFF]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Tên bài hội thoại (Tiếng Nhật)</label>
                        <input
                            type="text"
                            value={form.titleJapanese}
                            onChange={e => updateForm('titleJapanese', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A8DFF]"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả (Tiếng Việt)</label>
                        <textarea
                            value={form.descriptionVi}
                            onChange={e => updateForm('descriptionVi', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A8DFF] resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả (Tiếng Nhật)</label>
                        <textarea
                            value={form.description}
                            onChange={e => updateForm('description', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A8DFF] resize-none"
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Trình độ áp dụng</label>
                    <select
                        value={form.level}
                        onChange={e => updateForm('level', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#1A8DFF]"
                    >
                        {LEVEL_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                </div>
            </div>

            {/* ── 2. CHI TIẾT KỊCH BẢN ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-6">Chi tiết kịch bản</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Vai trò của Học viên</label>
                        <input
                            type="text"
                            value={form.learnerRole}
                            onChange={e => updateForm('learnerRole', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A8DFF]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Vai trò của AI</label>
                        <input
                            type="text"
                            value={form.aiRole}
                            onChange={e => updateForm('aiRole', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A8DFF]"
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Bối cảnh</label>
                    <textarea
                        value={form.context}
                        onChange={e => updateForm('context', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A8DFF] resize-none"
                    />
                </div>
            </div>

            {/* ── 3. NHIỆM VỤ HỘI THOẠI ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-6">Nhiệm vụ hội thoại</h2>
                <div className="flex flex-col gap-3">
                    {form.missions.map((mission, index) => (
                        <div key={mission.id} className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center shrink-0">{index + 1}</span>
                            <input
                                type="text"
                                value={mission.text}
                                onChange={e => updateMission(mission.id, e.target.value)}
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A8DFF]"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="fixed bottom-0 left-0 w-full lg:left-[260px] lg:w-[calc(100%-260px)] bg-white border-t border-gray-100 px-8 py-4 flex justify-end items-center gap-4 z-10 shadow-lg">
                <button type="button" onClick={() => router.back()} className="text-gray-500 font-bold text-sm hover:text-gray-900 transition">Hủy bỏ</button>
                <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="bg-[#1A8DFF] hover:bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all text-sm disabled:opacity-50">
                    {isSubmitting ? 'Đang lưu...' : 'Lưu Kịch bản'}
                </button>
            </div>

            <Toast 
                message={toast.message} 
                type={toast.type} 
                isVisible={toast.isVisible} 
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
            />
        </div>
    );
}
