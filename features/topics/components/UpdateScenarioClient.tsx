'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '@/shared/components/PageHeader';
import Toast from '@/shared/components/Toast';
import { topicService } from '../services/topic-service';

interface Mission {
    id: string;
    text: string;
    description?: string;
    orderIndex?: number;
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

export default function UpdateScenarioClient({ 
    topicId, 
    scenarioId 
}: { 
    topicId: string; 
    scenarioId: string;
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
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

    useEffect(() => {
        const fetchScenario = async () => {
            setIsLoading(true);
            try {
                const response = await topicService.getScenarioById(scenarioId);
                if (response.success) {
                    const s = response.data;
                    setForm({
                        name: s.title || '',
                        titleJapanese: s.titleJapanese || '',
                        description: s.description || '',
                        descriptionVi: s.descriptionVi || '',
                        level: s.jlptLevel || 'N5',
                        learnerRole: s.learnerRole || '',
                        aiRole: s.aiRole || '',
                        context: s.roleplayContext 
                            ? (s.roleplayContext.startsWith('"') ? JSON.parse(s.roleplayContext) : s.roleplayContext)
                            : (s.scenario || ''),
                        missions: s.missions && s.missions.length > 0 
                            ? s.missions.map(m => ({
                                id: m.id || Math.random().toString(),
                                text: m.title || '',
                                description: m.description || '',
                                orderIndex: m.orderIndex || 0
                            }))
                            : [
                                { id: '1', text: '' },
                                { id: '2', text: '' },
                                { id: '3', text: '' },
                            ],
                    });
                }
            } catch (error) {
                console.error('Failed to fetch scenario:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchScenario();
    }, [scenarioId]);

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

            const response = await topicService.updateScenario(scenarioId, payload);
            if (response.success) {
                showToast('Cập nhật kịch bản thành công!');
                setTimeout(() => {
                    router.push(`/topics/${topicId}/scenarios/${scenarioId}`);
                }, 1500);
            }
        } catch (error) {
            console.error('Failed to update scenario:', error);
            alert('Có lỗi xảy ra khi cập nhật kịch bản.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#1A8DFF] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">

            {/* ── HEADER ── */}
            <PageHeader 
                breadcrumb={[
                    { label: 'Quản lý Chủ đề Giao tiếp', href: '/topics' },
                    { label: 'Chi tiết Chủ đề', href: `/topics/${topicId}` },
                    { label: 'Chi tiết hội thoại', href: `/topics/${topicId}/scenarios/${scenarioId}` },
                    { label: 'Cập nhật', active: true }
                ]}
                backUrl={`/topics/${topicId}/scenarios/${scenarioId}`}
                title="Cập nhật kịch bản hội thoại"
                titleAlign="right"
            />

            {/* ── 1. THÔNG TIN CƠ BẢN ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#1A8DFF] text-white flex items-center justify-center text-[10px] font-bold shrink-0">i</div>
                        <h2 className="text-base font-bold text-gray-900">Thông tin cơ bản</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Tên bài hội thoại (Tiếng Việt) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => updateForm('name', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-base font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all placeholder-slate-300"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Tên bài hội thoại (Tiếng Nhật)
                        </label>
                        <input
                            type="text"
                            value={form.titleJapanese}
                            onChange={e => updateForm('titleJapanese', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-base font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all placeholder-slate-300"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Trình độ áp dụng</label>
                        <div className="relative">
                            <select
                                value={form.level}
                                onChange={e => updateForm('level', e.target.value)}
                                className="w-full pl-4 pr-10 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-base font-bold text-slate-900 appearance-none focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all cursor-pointer"
                            >
                                {LEVEL_OPTIONS.map(opt => (
                                    <option key={opt}>{opt}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Mô tả (Tiếng Việt)</label>
                        <textarea
                            value={form.descriptionVi}
                            onChange={e => updateForm('descriptionVi', e.target.value)}
                            placeholder="Mô tả ngắn gọn bài hội thoại bằng tiếng Việt"
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-base font-semibold text-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all placeholder-slate-300 resize-none"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Mô tả (Gốc/Tiếng Nhật)</label>
                        <textarea
                            value={form.description}
                            onChange={e => updateForm('description', e.target.value)}
                            placeholder="Mô tả bài hội thoại bằng tiếng Nhật (nếu có)"
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-base font-semibold text-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all placeholder-slate-300 resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* ── 2. CHI TIẾT KỊCH BẢN ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                <div className="flex items-center gap-2 mb-8">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-[#1A8DFF]">
                        <path d="M12 2.5L14.2 9.49997L21.5 12L14.2 14.5L12 21.5L9.8 14.5L2.5 12L9.8 9.49997L12 2.5ZM6 5L6.6 6.89999L8.5 7.5L6.6 8.1L6 10L5.4 8.1L3.5 7.5L5.4 6.89999L6 5ZM18 14L18.6 15.9L20.5 16.5L18.6 17.1L18 19L17.4 17.1L15.5 16.5L17.4 15.9L18 14Z" />
                    </svg>
                    <h2 className="text-base font-bold text-gray-900">Chi tiết kịch bản</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Vai trò của Học viên</label>
                        <input
                            type="text"
                            value={form.learnerRole}
                            onChange={e => updateForm('learnerRole', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-base font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all placeholder-slate-300"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Vai trò của AI</label>
                        <input
                            type="text"
                            value={form.aiRole}
                            onChange={e => updateForm('aiRole', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-base font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all placeholder-slate-300"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ngữ cảnh & Chỉ thị</label>
                    <textarea
                        value={form.context}
                        onChange={e => updateForm('context', e.target.value)}
                        rows={5}
                        className="w-full px-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-base font-semibold text-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all placeholder-slate-300 resize-none italic"
                    />
                </div>
            </div>

            {/* ── 3. NHIỆM VỤ HỘI THOẠI ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                <div className="flex items-center gap-2 mb-8">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <h2 className="text-base font-bold text-gray-900">Mục tiêu Bài học</h2>
                </div>

                <div className="flex flex-col gap-4">
                    {form.missions.map((mission, index) => (
                        <div key={mission.id} className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 text-slate-400 text-xs font-bold flex items-center justify-center shrink-0">
                                {index + 1}
                            </div>
                            <input
                                type="text"
                                value={mission.text}
                                onChange={e => updateMission(mission.id, e.target.value)}
                                className="flex-1 px-5 py-3.5 bg-white border border-slate-100 rounded-xl text-base font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all placeholder-slate-300"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── ACTION BAR ── */}
            <div className="fixed bottom-0 left-0 w-full lg:left-[260px] lg:w-[calc(100%-260px)] bg-white/80 backdrop-blur-md border-t border-slate-100 px-8 py-6 flex justify-end items-center gap-6 z-10 shadow-[0_-4px_20px_rgba(15,23,42,0.05)]">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="text-slate-400 font-bold text-sm hover:text-slate-900 transition-colors px-4"
                >
                    Hủy bỏ
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-3 bg-[#1A8DFF] hover:bg-blue-600 text-white font-bold px-8 py-3 rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 text-sm uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                    {!isSubmitting && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    )}
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
