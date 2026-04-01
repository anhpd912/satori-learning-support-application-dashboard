'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAssignmentDetail, useDeleteAssignment, useAssignmentSubmissions } from '../hooks/useAssignments';
import { AssignmentDetail, SubmissionSummary } from '../types/assignment';
import SafeMarkdown from '@/shared/components/SafeMarkdown';
import Toast, { ToastType } from '@/shared/components/Toast';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

const mapAssignmentType = (type: string) => {
    switch (type) {
        case 'QUIZ': return 'Quiz';
        case 'WRITING': return 'Viết';
        case 'TRANSLATION': return 'Dịch';
        default: return type;
    }
};

const mapAssignmentStatus = (status: string) => {
    switch (status) {
        case 'DRAFT': return 'Bản nháp';
        case 'PUBLISHED': return 'Đang mở';
        case 'CLOSED': return 'Đã đóng';
        default: return status;
    }
};

export default function AssignmentDetailClient({ classId, assignmentId }: { classId: string, assignmentId: string }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data: assignment, isLoading, error } = useAssignmentDetail(assignmentId);
    const { mutate: deleteAssignment, isPending: isDeleting } = useDeleteAssignment();
    
    // Submissions fetching
    const [page, setPage] = useState(1);
    const { data: submissionPage, isLoading: isLoadingSubmissions } = useAssignmentSubmissions(assignmentId, page, 10);
    
    const [activeTab, setActiveTab] = useState<'RESULTS' | 'CONTENT'>('RESULTS');
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    // Audio states
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const formatTime = (time: number) => {
        if (isNaN(time)) return "00:00";
        const m = Math.floor(time / 60);
        const s = Math.floor(time % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleDeleteAssignment = () => {
        if (confirm('Bạn có chắc chắn muốn xóa bài tập này? Hành động này không thể hoàn tác.')) {
            deleteAssignment(assignmentId, {
                onSuccess: () => {
                    setToast({ message: 'Bài tập đã được xóa thành công!', type: 'success' });
                    queryClient.invalidateQueries({ queryKey: ['assignments', classId] });
                    setTimeout(() => router.push(`/my-classes/${classId}/assignments`), 1500);
                },
                onError: (err: any) => {
                    setToast({ message: `Lỗi khi xóa bài tập: ${err.message || 'Vui lòng thử lại.'}`, type: 'error' });
                },
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !assignment) {
        return (
            <div className="bg-red-50 p-6 rounded-2xl text-center">
                <p className="text-red-600 font-bold mb-4">Không tìm thấy bài tập hoặc có lỗi xảy ra</p>
                <Link href={`/my-classes/${classId}/assignments`} className="text-blue-500 font-medium hover:underline">Quay lại danh sách</Link>
            </div>
        );
    }

    const isQuiz = assignment.assignmentType === 'QUIZ';
    const isWriting = assignment.assignmentType === 'WRITING';
    const isTranslation = assignment.assignmentType === 'TRANSLATION';
    const isOverdue = assignment.dueDate ? new Date(assignment.dueDate) < new Date() : false;

    console.log('>>> DEBUG: Assignment Data:', assignment);

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            {/* Header info section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{assignment.title}</h1>
                    <div className="flex flex-wrap items-center gap-6 text-gray-500 text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                            <span>Loại: {mapAssignmentType(assignment.assignmentType)} ({assignment.assignmentType === 'QUIZ' ? 'Trắc nghiệm' : 'Tự luận'})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            <span>Hạn nộp: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }).replace(',', ' -') : 'Không có hạn'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {!isOverdue ? (
                        <Link
                            href={`/my-classes/${classId}/assignments/${assignmentId}/edit`}
                            className="flex items-center gap-2 px-5 py-2 whitespace-nowrap bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 transition-all"
                        >
                            Chỉnh sửa
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </Link>
                    ) : (
                        <div
                            className="flex items-center gap-2 px-5 py-2 whitespace-nowrap bg-gray-50 border border-gray-100 text-gray-400 rounded-lg text-sm font-bold cursor-not-allowed"
                            title="Không thể chỉnh sửa bài tập đã quá hạn"
                        >
                            Chỉnh sửa
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        </div>
                    )}
                    <button 
                        onClick={handleDeleteAssignment}
                        disabled={isDeleting}
                        className="flex items-center gap-2 px-5 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold shadow-sm hover:bg-red-100 transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? 'Đang xóa...' : 'Xóa'}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </div>

            {/* TABS */}
            <div className="flex items-center gap-8 border-b border-gray-100 mt-2">
                <button
                    onClick={() => setActiveTab('RESULTS')}
                    className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'RESULTS' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Kết quả nộp bài
                    {activeTab === 'RESULTS' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('CONTENT')}
                    className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'CONTENT' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Nội dung đề bài
                    {activeTab === 'CONTENT' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
                </button>
            </div>

            {/* Content section */}
            {activeTab === 'CONTENT' && (
                <div className="space-y-6">
                    {/* Instructions Card */}
                    <div className="bg-[#F8F9FB] p-6 rounded-xl border border-gray-100 flex items-start gap-4 shadow-sm">
                        <div className="bg-blue-500 p-2 rounded-full shrink-0">
                            <svg className="text-white" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        </div>
                        <div>
                            <span className="block text-sm font-bold text-gray-900 mb-1">Mô tả</span>
                            <SafeMarkdown 
                                content={assignment.description || (assignment as any).prompt || 'Học viên xem đề bài và thực hiện các câu hỏi bên dưới.'} 
                                className="text-gray-600 font-medium leading-relaxed"
                            />
                        </div>
                    </div>

                    {/* Audio Player Card (Fixed implementation if exists) */}
                    {assignment.audioUrl && (
                        <div className="bg-[#F8FBFF] p-5 rounded-xl border border-gray-100 shadow-sm">
                            <audio
                                ref={audioRef}
                                src={assignment.audioUrl}
                                onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
                                onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
                                onEnded={() => setIsPlaying(false)}
                            />
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Audio toàn bài</span>
                                <span className="text-[11px] font-bold text-gray-400 tabular-nums">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={togglePlay}
                                    className="bg-blue-500 p-3 rounded-full text-white hover:bg-blue-600 transition-colors shadow-md"
                                >
                                    {isPlaying ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5"><path d="M8 5v14l11-7z"></path></svg>
                                    )}
                                </button>
                                <div
                                    className="flex-1 h-1 bg-gray-200 rounded-full relative cursor-pointer"
                                    onClick={(e) => {
                                        if (audioRef.current && duration) {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const clickRatio = (e.clientX - rect.left) / rect.width;
                                            audioRef.current.currentTime = clickRatio * duration;
                                            setCurrentTime(clickRatio * duration);
                                        }
                                    }}
                                >
                                    <div className="absolute top-0 left-0 h-full bg-blue-200 w-full opacity-30"></div>
                                    <div
                                        className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-100"
                                        style={{ width: `${(currentTime / duration || 0) * 100}%` }}
                                    ></div>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {isQuiz && assignment.questions?.map((q, idx) => (
                        <div key={q.id || idx} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-baseline gap-2">
                                <span className="text-gray-800 shrink-0">Câu {idx + 1}:</span>
                                <SafeMarkdown 
                                    content={q.questionText} 
                                    className="text-gray-700 leading-relaxed font-medium"
                                />
                            </h3>

                            <div className="space-y-3">
                                {(() => {
                                    let options: any[] = [];
                                    try {
                                        options = Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? JSON.parse(q.options) : []);
                                        // If it's the complex structure from AI generation
                                        if (!Array.isArray(options) && (options as any).options) {
                                            options = (options as any).options;
                                        }
                                    } catch (e) {
                                        options = [];
                                    }

                                    return options.map((opt, oIdx) => {
                                        const optText = typeof opt === 'string' ? opt : (opt?.text || '');
                                        const isCorrect = q.correctAnswer ? (optText === q.correctAnswer || String.fromCharCode(65 + oIdx) === q.correctAnswer) : (oIdx === (q as any).correctAnswerIndex);

                                        return (
                                            <div
                                                key={oIdx}
                                                className={`group relative p-4 rounded-xl border flex items-center justify-between transition-all ${isCorrect
                                                        ? 'bg-green-50 border-green-200 ring-1 ring-green-100'
                                                        : 'bg-[#F9FAFC] border-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isCorrect
                                                            ? 'border-green-500 bg-white'
                                                            : 'border-gray-200 bg-white'
                                                        }`}>
                                                        {isCorrect && <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>}
                                                    </div>
                                                    <span className={`text-base font-bold ${isCorrect ? 'text-green-700' : 'text-gray-500'}`}>
                                                        {String.fromCharCode(65 + oIdx)}.
                                                    </span>
                                                    <SafeMarkdown 
                                                        content={optText} 
                                                        className={`text-base font-medium ${isCorrect ? 'text-green-800' : 'text-gray-700'}`} 
                                                    />
                                                </div>

                                                {isCorrect && (
                                                    <span className="text-[10px] font-black uppercase text-green-600 tracking-widest bg-green-100/50 px-2 py-1 rounded">
                                                        Đáp án đúng
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    });
                                })()}
                            </div>

                            {q.explanation && (
                                <div className="mt-8 bg-blue-50/40 p-5 rounded-2xl border border-blue-100 flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                                        <svg className="text-blue-600" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-black text-blue-800 uppercase tracking-widest mb-1">Giải thích</span>
                                        <SafeMarkdown content={q.explanation || ''} className="text-[15px] text-blue-700 leading-relaxed font-medium" />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {(isWriting || isTranslation) && (
                        <div className="space-y-6">
                            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                                <h3 className="text-xl font-bold font-display text-gray-900 mb-6 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                    </div>
                                    {isWriting ? 'Yêu cầu bài viết' : 'Nội dung cần dịch'}
                                </h3>
                                <SafeMarkdown 
                                    content={assignment.writingContent?.prompt || assignment.writingContent?.sourceText || (assignment as any).prompt || ''} 
                                    className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 italic font-medium text-gray-700 leading-relaxed shadow-inner min-h-[100px]"
                                />
                            </div>

                            {assignment.instructions && (
                                <div className="bg-blue-50/30 p-8 rounded-2xl border border-blue-100 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                        Gợi ý / Hướng dẫn
                                    </h3>
                                    <div className="text-blue-800 font-medium leading-relaxed whitespace-pre-wrap">
                                        {assignment.instructions}
                                    </div>
                                </div>
                            )}

                            {assignment.writingContent?.sampleAnswer && (
                                <div className="bg-green-50/30 p-8 rounded-2xl border border-green-100 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                        Đáp án mẫu
                                    </h3>
                                    <div className="text-green-800 font-medium leading-relaxed whitespace-pre-wrap">
                                        {assignment.writingContent.sampleAnswer}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'RESULTS' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Học sinh</th>
                                    <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Thời gian nộp</th>
                                    <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-center">Trạng thái</th>
                                    <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-center">Điểm số</th>
                                    <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoadingSubmissions ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">Đang tải danh sách bài nộp...</td>
                                    </tr>
                                ) : !submissionPage?.content || submissionPage.content.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">Chưa có học sinh nào nộp bài.</td>
                                    </tr>
                                ) : (
                                    submissionPage.content.map((sub: SubmissionSummary) => (
                                        <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                        {sub.userFullName.split(' ').pop()?.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-gray-900">{sub.userFullName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-gray-600 font-medium">
                                                {sub.submittedAt && new Date(sub.submittedAt).getTime() > 0 
                                                    ? new Date(sub.submittedAt).toLocaleString('vi-VN') 
                                                    : '---'}
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                                                    sub.status === 'GRADED' ? 'bg-green-100 text-green-700' : 
                                                    sub.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' :
                                                    sub.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {sub.status === 'GRADED' ? 'Đã chấm' : 
                                                     sub.status === 'SUBMITTED' ? 'Đã nộp' : 
                                                     sub.status === 'IN_PROGRESS' ? 'Đang làm' :
                                                     sub.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center font-black text-gray-900">
                                                {sub.score !== null ? `${sub.score}` : '--'}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <Link 
                                                    href={`/my-classes/${classId}/assignments/${assignmentId}/results/${sub.id}`}
                                                    className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline"
                                                >
                                                    {sub.status === 'GRADED' ? 'Xem lại' : 'Chấm điểm'}
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    isVisible={!!toast} 
                    onClose={() => setToast(null)} 
                />
            )}
        </div>
    );
}
