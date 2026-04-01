'use client';

import React, { useState, useEffect } from 'react';
import { useSubmissionDetail, useAssignmentDetail, useGradeWriting } from '../hooks/useAssignments';
import SafeMarkdown from '@/shared/components/SafeMarkdown';
import Toast, { ToastType } from '@/shared/components/Toast';
import { useRouter } from 'next/navigation';

export default function StudentGradingClient({
    classId,
    assignmentId,
    studentId // the submissionId from URL
}: {
    classId: string,
    assignmentId: string,
    studentId: string
}) {
    const router = useRouter();
    const { data: submission, isLoading: isLoadingSub, error: subError } = useSubmissionDetail(studentId);
    const { data: assignment, isLoading: isLoadingAss, error: assError } = useAssignmentDetail(assignmentId);
    const { mutate: gradeWriting, isPending: isGrading } = useGradeWriting();

    const [zoomLevel, setZoomLevel] = useState(1);
    const [score, setScore] = useState<number>(0);
    const [feedback, setFeedback] = useState<string>('');
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    useEffect(() => {
        if (submission) {
            setScore(submission.score || submission.teacherScore || 0);
            setFeedback(submission.feedback || '');
        }
    }, [submission]);

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));

    const handleSaveGrade = () => {
        if (!assignment) return;
        
        gradeWriting({
            submissionId: studentId,
            assignmentId: assignmentId,
            request: {
                teacherScore: score,
                feedback: feedback
            }
        }, {
            onSuccess: () => {
                setToast({ message: 'Đã lưu điểm thành công!', type: 'success' });
                // Optional: redirect back to results after a short delay
                setTimeout(() => {
                    router.push(`/my-classes/${classId}/assignments/${assignmentId}`);
                }, 1500);
            },
            onError: () => {
                setToast({ message: 'Lỗi khi lưu điểm. Vui lòng thử lại.', type: 'error' });
            }
        });
    };

    if (isLoadingSub || isLoadingAss) {
        return <div className="flex items-center justify-center min-h-[400px]">Đang tải dữ liệu chấm bài...</div>;
    }

    if (subError || assError || !submission || !assignment) {
        return <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 italic">Không tìm thấy thông tin bài nộp để chấm.</div>;
    }

    return (
        <div className="flex flex-col lg:flex-row gap-0 items-stretch -mx-8 -mb-8 mt-4 min-h-[calc(100vh-140px)] overflow-hidden bg-white border-t border-gray-200">
            {/* LEFT PANEL: The Submitted Image Viewer (Dark Mode) */}
            <div className="flex-1 w-full min-w-0 bg-[#0F172A] flex flex-col relative">
                {/* Header Overlay (Student Info) */}
                <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-[101]">
                    <div className="flex items-center gap-3">
                        <span className="text-white font-medium text-lg">Đang chấm: {submission.userFullName}</span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-semibold">
                        {Math.round(zoomLevel * 100)}%
                    </div>
                </div>

                {/* Image Area */}
                <div className="flex-1 overflow-auto flex items-center justify-center p-8 pt-20">
                    <div
                        className="transition-transform duration-200 origin-center flex items-center justify-center min-w-full min-h-full"
                        style={{ transform: `scale(${zoomLevel})` }}
                    >
                        <img
                            src={(submission.imageUrls && submission.imageUrls[0]) || "https://placehold.co/600x800?text=No+Submission+Image"}
                            alt="Student Submission"
                            className="max-w-none shadow-2xl max-h-none rounded-md"
                            style={{ width: 'auto', height: '100%', maxHeight: '80vh' }}
                        />
                    </div>
                </div>

                {/* Bottom Toolbar */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#1E293B] p-2 rounded-xl border border-white/10 shadow-xl z-10">
                    <button onClick={handleZoomIn} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition" title="Phóng to">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                    </button>
                    <button onClick={handleZoomOut} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition" title="Thu nhỏ">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                    </button>
                </div>
            </div>

            {/* RIGHT PANEL: Prompt and Grading (Sticky, White Background) */}
            <div className="w-full lg:w-[420px] lg:shrink-0 bg-white flex flex-col justify-between border-l border-gray-100 h-full overflow-hidden">
                <div className="p-6 flex flex-col gap-8 overflow-y-auto flex-1">
                    {/* Prompt Card */}
                    <div>
                        <h4 className="text-[13px] font-bold text-gray-700 mb-3 uppercase tracking-wider">Đề bài</h4>
                        <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-200">
                            <h5 className="text-[13px] font-bold text-[#1A8DFF] mb-2">Yêu cầu:</h5>
                            <SafeMarkdown 
                                content={assignment.writingContent?.prompt || assignment.writingContent?.sourceText || ''} 
                                className="text-[14px] text-gray-700 font-medium leading-relaxed"
                            />
                        </div>
                    </div>

                    {submission.writtenAnswer && (
                        <div>
                            <h4 className="text-[13px] font-bold text-gray-700 mb-3 uppercase tracking-wider">Bài làm (Văn bản)</h4>
                            <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-200">
                                <p className="text-[14px] text-gray-800 font-medium leading-relaxed whitespace-pre-wrap">
                                    {submission.writtenAnswer}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Score Input Card */}
                    <div>
                        <h4 className="text-[13px] font-bold text-gray-700 mb-3 uppercase tracking-wider">Điểm số</h4>
                        <div className="flex items-end gap-3">
                            <div className="flex-1">
                                <input
                                    type="number"
                                    value={score}
                                    onChange={(e) => setScore(Number(e.target.value))}
                                    min="0"
                                    max={assignment.maxScore || 100}
                                    className="w-full h-16 bg-white border-2 border-gray-200 rounded-xl text-center text-4xl font-bold text-gray-700 focus:border-[#1A8DFF] focus:ring-4 focus:ring-[#1A8DFF]/10 focus:text-[#1A8DFF] transition outline-none"
                                />
                            </div>
                            <div className="text-xl font-bold text-gray-400 mb-4">/ {assignment.maxScore || 100}</div>
                        </div>
                    </div>

                    {/* Grading Feedback Form */}
                    <div className="flex-1 flex flex-col">
                        <h4 className="text-[13px] font-bold text-gray-700 mb-3 uppercase tracking-wider">Nhận xét của Giáo viên</h4>
                        <textarea
                            className="w-full flex-1 bg-[#F8F9FA] border border-gray-200 rounded-xl p-4 text-[14px] text-gray-800 font-medium leading-relaxed outline-none focus:border-[#1A8DFF] focus:bg-white focus:ring-4 focus:ring-[#1A8DFF]/10 transition min-h-[160px] resize-none mb-4"
                            placeholder="Nhập nhận xét chi tiết cho học sinh tại đây..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        />
                        <div className="flex flex-wrap gap-2 mt-auto">
                            <button onClick={() => setFeedback(prev => (prev ? prev + ' ' : '') + 'Viết tốt.')} className="px-3 py-1.5 border border-[#1A8DFF]/20 bg-[#F0F7FF] text-[#1A8DFF] text-xs font-bold rounded-full hover:bg-blue-100 transition whitespace-nowrap">Viết tốt</button>
                            <button onClick={() => setFeedback(prev => (prev ? prev + ' ' : '') + 'Cần nắn nót hơn.')} className="px-3 py-1.5 border border-[#1A8DFF]/20 bg-[#F0F7FF] text-[#1A8DFF] text-xs font-bold rounded-full hover:bg-blue-100 transition whitespace-nowrap">Cần nắn nót hơn</button>
                            <button onClick={() => setFeedback(prev => (prev ? prev + ' ' : '') + 'Lạc đề.')} className="px-3 py-1.5 border border-gray-200 bg-gray-50 text-gray-600 text-xs font-bold rounded-full hover:bg-gray-100 transition whitespace-nowrap">Lạc đề</button>
                        </div>
                    </div>
                </div>

                {/* Pagination / Save Action (Sticky Bottom) */}
                <div className="p-6 border-t border-gray-100 bg-white">
                    <button 
                        onClick={handleSaveGrade}
                        disabled={isGrading}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-[#1A8DFF] hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold rounded-xl transition text-[15px] shadow-lg shadow-blue-500/30"
                    >
                        {isGrading ? 'Đang lưu...' : 'Lưu điểm & Hoàn tất'}
                        {!isGrading && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>}
                    </button>
                </div>
            </div>
            
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
