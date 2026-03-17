'use client';

import React, { useState } from 'react';
import { useSubmissionDetail, useAssignmentDetail } from '../hooks/useAssignments';
import { SubmissionDetail, AssignmentDetail, QuizQuestion } from '../types/assignment';
import SafeMarkdown from '@/shared/components/SafeMarkdown';
import Link from 'next/link';

export default function StudentSubmissionDetailClient({ 
    classId, 
    assignmentId, 
    studentId 
}: { 
    classId: string, 
    assignmentId: string, 
    studentId: string // This is submissionId from the URL
}) {
    const { data: submission, isLoading: isLoadingSub, error: subError } = useSubmissionDetail(studentId);
    const { data: assignment, isLoading: isLoadingAss, error: assError } = useAssignmentDetail(assignmentId);

    const [zoomLevel, setZoomLevel] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);

    if (isLoadingSub || isLoadingAss) {
        return <div className="flex items-center justify-center min-h-[400px]">Đang tải chi tiết bài nộp...</div>;
    }

    if (subError || assError || !submission || !assignment) {
        return <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 italic">Không tìm thấy thông tin bài nộp.</div>;
    }

    const isQuiz = assignment.assignmentType === 'QUIZ';
    const isWriting = assignment.assignmentType === 'WRITING' || assignment.assignmentType === 'TRANSLATION';

    // Parse answers if it's a quiz
    let studentAnswers: Record<string, string> = {};
    if (isQuiz && submission.answers) {
        try {
            studentAnswers = JSON.parse(submission.answers);
        } catch (e) {
            console.error('Failed to parse student answers:', e);
        }
    }

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
    const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto relative">
            {/* Header info & Stats */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                
                {/* Profile Section */}
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl shrink-0 overflow-hidden">
                        {submission.userFullName.split(' ').pop()?.charAt(0)}
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-xl font-bold text-gray-900">{submission.userFullName}</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                Nộp lúc: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString('vi-VN') : '---'}
                            </div>
                            <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full whitespace-nowrap ${
                                submission.status === 'GRADED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                                {submission.status === 'GRADED' ? 'Đã chấm' : 'Đã nộp'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Score Widgets */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                    {isQuiz && (
                        <div className="bg-[#FAFAFA] border border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center min-w-[120px] flex-1 md:flex-none">
                            <span className="text-xs font-bold text-gray-500 mb-1">Số câu đúng</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-[#00A15D]">{submission.correctCount || 0}</span>
                                <span className="text-sm font-medium text-gray-400">/ {submission.totalQuestions || assignment.questionCount || 0}</span>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-col items-end justify-center px-4">
                        <span className="text-sm font-bold text-gray-400 mb-1">Điểm tổng kết</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-[#1A8DFF]">{submission.score || submission.teacherScore || 0}</span>
                            <span className="text-xl font-medium text-gray-400">/ {assignment.maxScore || 100}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/*  LAYOUT: QUIZ */}
            {isQuiz && (
                <>
                    {/* List Header */}
                    <div className="flex items-center justify-between mt-2 px-1">
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-[15px] font-bold text-gray-900">Chi tiết từng câu hỏi</h3>
                            <span className="text-sm font-medium text-gray-400">({assignment.questionCount} câu)</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold">
                            <div className="flex items-center gap-1.5 text-[#00A15D]">
                                <div className="w-2 h-2 rounded-full bg-[#00A15D]"></div>
                                Đúng
                            </div>
                            <div className="flex items-center gap-1.5 text-[#F04438]">
                                <div className="w-2 h-2 rounded-full bg-[#F04438]"></div>
                                Sai
                            </div>
                        </div>
                    </div>

                    {/* QUESTIONS LIST */}
                    <div className="flex flex-col gap-6">
                        {assignment.questions?.map((q: QuizQuestion, idx: number) => {
                            const studentSelection = studentAnswers[q.id || ''];
                            const isCorrect = studentSelection === q.correctAnswer;
                            const borderColor = isCorrect ? 'border-[#008F52]' : 'border-[#F04438]';
                            
                            // Transform options from JSON string if needed
                            let options: string[] = [];
                            try {
                                options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options || [];
                            } catch(e) { console.error(e); }

                            return (
                                <div key={q.id || idx} className={`bg-white p-6 rounded-2xl border-l-[3px] border shadow-sm ${borderColor}`}>
                                    {/* Question Header */}
                                    <div className="flex items-start justify-between gap-4 mb-6">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-[#F1F5F9] text-[#334155] font-bold text-sm w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                                                {idx + 1}
                                            </div>
                                            <div className="mt-1.5">
                                                <SafeMarkdown content={q.questionText} className="text-[15px] text-gray-900 font-bold" />
                                            </div>
                                        </div>
                                        
                                        <div className="shrink-0 mt-1.5">
                                            {isCorrect ? (
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00A15D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            ) : (
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F04438" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                            )}
                                        </div>
                                    </div>

                                    {/* Options Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {options.map((optText, i) => {
                                            const optLabel = String.fromCharCode(65 + i);
                                            const isSelected = studentSelection === optText;
                                            const isOptionCorrect = q.correctAnswer === optText;

                                            // Determine styling
                                            let optionClasses = 'border-gray-100 bg-[#FAFAFA] text-gray-700';
                                            let labelClasses = 'text-gray-900';
                                            let labelBg = 'bg-transparent';
                                            
                                            if (isSelected && isOptionCorrect) {
                                                optionClasses = 'border-[#CCF2E3] bg-[#EFFFF6] text-gray-900';
                                                labelClasses = 'text-white';
                                                labelBg = 'bg-[#008F52] border-[#008F52]';
                                            } else if (isSelected && !isOptionCorrect) {
                                                optionClasses = 'border-[#FEE4E2] bg-[#FEF3F2] text-gray-900';
                                                labelClasses = 'text-white';
                                                labelBg = 'bg-[#F04438] border-[#F04438]';
                                            } else if (!isSelected && isOptionCorrect) {
                                                optionClasses = 'border-[#CCF2E3] bg-[#EFFFF6] text-gray-900';
                                                labelClasses = 'text-[#008F52] border-[#CCF2E3]';
                                                labelBg = 'bg-white';
                                            }
                                            
                                            return (
                                                <div 
                                                    key={i} 
                                                    className={`flex items-center p-3.5 rounded-xl border transition ${optionClasses}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold border uppercase tracking-wider ${labelBg} ${labelClasses}`}>
                                                            {optLabel}
                                                        </div>
                                                        <span className="text-[15px] font-medium">{optText}</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}

            {/*  LAYOUT: WRITING / TRANSLATION */}
            {isWriting && (
                <div className="flex flex-col lg:flex-row gap-6 items-start mt-2">
                    
                    {/* LEFT PANEL: The Submitted Image */}
                    <div className="flex-1 w-full min-w-0 flex flex-col gap-3">
                        <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-2 text-[#1A8DFF] font-bold text-[15px]">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                Bài làm của sinh viên
                            </div>
                            <div className="flex gap-3 text-gray-500">
                                <span className="text-sm font-medium mr-2">{Math.round(zoomLevel * 100)}%</span>
                                <button onClick={handleZoomOut} className="hover:text-gray-900 transition" title="Thu nhỏ"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg></button>
                                <button onClick={handleZoomIn} className="hover:text-gray-900 transition" title="Phóng to"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg></button>
                                <button onClick={toggleFullscreen} className="hover:text-gray-900 transition ml-2 border-l border-gray-300 pl-3" title="Toàn màn hình">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                                </button>
                            </div>
                        </div>
                        <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-auto p-2 min-h-[500px] h-[600px] flex items-center justify-center relative">
                             <div 
                                className="transition-transform duration-200 origin-center flex items-center justify-center min-w-full min-h-full"
                                style={{ transform: `scale(${zoomLevel})` }}
                             >
                                 <img 
                                    src={(submission.imageUrls && submission.imageUrls[0]) || "https://placehold.co/600x800?text=No+Submission+Image"} 
                                    alt="Student Submission" 
                                    className="max-w-none shadow-sm max-h-none"
                                    style={{ width: 'auto', height: '100%', maxHeight: '800px' }}
                                />
                             </div>
                        </div>
                        {submission.writtenAnswer && (
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-3">
                                <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Bài viết (Văn bản)</h4>
                                <div className="text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">
                                    {submission.writtenAnswer}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT PANEL: Prompt and Grading */}
                    <div className="w-full lg:w-[380px] lg:shrink-0 max-w-full flex flex-col gap-6">
                        
                        {/* Prompt Card */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Đề bài</h4>
                            <div className="bg-[#F8F9FA] rounded-xl p-4 border-l-4 border-[#1A8DFF]">
                                <SafeMarkdown 
                                    content={assignment.writingContent?.prompt || assignment.writingContent?.sourceText || ''} 
                                    className="text-[14px] text-gray-700 font-medium leading-relaxed"
                                />
                            </div>
                        </div>

                        {/* Grading Card */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Nhận xét của giáo viên</h4>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            </div>
                            
                            <div className="w-full bg-[#F8F9FA] rounded-xl p-4 text-[14px] text-gray-700 font-medium leading-relaxed min-h-[160px] whitespace-pre-wrap mb-4">
                                {submission.feedback || "Chưa có nhận xét nào..."}
                            </div>

                            <Link 
                                href={`/my-classes/${classId}/assignments/${assignmentId}/grade/${studentId}`}
                                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-[#EBF5FF] text-[#1A8DFF] hover:bg-[#F5FAFF] font-bold rounded-xl transition text-sm"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                {submission.status === 'GRADED' ? 'Chỉnh sửa điểm' : 'Chấm điểm ngay'}
                            </Link>
                        </div>
                    </div>
                </div>
            )}
            
            {/* FULLSCREEN LIGHTBOX */}
            {isFullscreen && isWriting && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center backdrop-blur-sm">
                    {/* Toolbar */}
                    <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-[101]">
                        <div className="flex items-center gap-3">
                            <span className="text-white font-medium text-lg">Bản thu phóng: {submission.userFullName}</span>
                        </div>
                        <div className="flex gap-4 items-center text-white">
                            <span className="text-sm font-medium mr-2">{Math.round(zoomLevel * 100)}%</span>
                            <button onClick={handleZoomOut} className="hover:text-gray-300 transition" title="Thu nhỏ"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg></button>
                            <button onClick={handleZoomIn} className="hover:text-gray-300 transition" title="Phóng to"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg></button>
                            <button onClick={toggleFullscreen} className="hover:text-gray-300 transition ml-4 border-l border-white/20 pl-4" title="Đóng toàn màn hình">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    </div>
                    {/* Image Area */}
                    <div className="w-full h-full overflow-auto flex items-center justify-center p-8 pt-20">
                        <div 
                            className="transition-transform duration-200 origin-center flex items-center justify-center min-w-full min-h-full"
                            style={{ transform: `scale(${zoomLevel})` }}
                        >
                            <img 
                                src={(submission.imageUrls && submission.imageUrls[0]) || "https://placehold.co/600x800?text=No+Submission+Image"} 
                                alt="Student Submission Fullscreen" 
                                className="max-w-none shadow-2xl max-h-none rounded-sm"
                                style={{ width: 'auto', height: '100%', maxHeight: '90vh' }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
