'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AudioPlayerInput from './AudioPlayerInput';
import RichTextEditor from './RichTextEditor';
import ReuseAssignmentModal from './ReuseAssignmentModal';
import { 
    useCreateQuiz, 
    useUpdateQuiz, 
    useCreateWriting, 
    useUpdateWriting,
    useAiGenerateQuestions, 
    useAiGenerateExplanationFromDraft,
    useAssignmentDetail
} from '../hooks/useAssignments';
import { 
    AssignmentType, 
    AssignmentStatus, 
    QuizQuestion, 
    SaveFullQuizRequest, 
    SaveFullWritingRequest 
} from '../types/assignment';
import Toast, { ToastType } from '@/shared/components/Toast';
import Link from 'next/link';
import PageHeader from '@/shared/components/PageHeader';
import { assignmentService } from '../services/assignment.service';

export default function CreateAssignmentClient({ classId, assignmentId }: { classId: string, assignmentId?: string }) {
    const router = useRouter();
    const isEdit = !!assignmentId;

    // Queries & Mutations
    const { data: existingAssignment, isLoading: isFetching } = useAssignmentDetail(assignmentId || '');
    const createQuizMutation = useCreateQuiz();
    const updateQuizMutation = useUpdateQuiz();
    const createWritingMutation = useCreateWriting();
    const updateWritingMutation = useUpdateWriting();
    const aiGenMutation = useAiGenerateQuestions();
    const aiExplainMutation = useAiGenerateExplanationFromDraft();

    // UI State
    const [creationMethod, setCreationMethod] = useState<'MANUAL' | 'AI'>('MANUAL');
    const [assignmentType, setAssignmentType] = useState<AssignmentType>('QUIZ');
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [isReuseModalOpen, setIsReuseModalOpen] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState<AssignmentStatus>('DRAFT');
    
    // Quiz State
    const [questions, setQuestions] = useState<QuizQuestion[]>([
        { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, explanation: '' }
    ]);
    const [generalAudio, setGeneralAudio] = useState<File | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = React.useRef<HTMLAudioElement>(null);

    // Create object URL for audio file
    useEffect(() => {
        if (generalAudio) {
            const url = URL.createObjectURL(generalAudio);
            setAudioUrl(url);
            setIsPlaying(false);
            setCurrentTime(0);
            return () => URL.revokeObjectURL(url);
        } else {
            setAudioUrl(null);
            setIsPlaying(false);
            setCurrentTime(0);
        }
    }, [generalAudio]);

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

    // Writing/Translation State
    const [writingPrompt, setWritingPrompt] = useState('');
    const [sampleAnswer, setSampleAnswer] = useState('');
    const [instructions, setInstructions] = useState('');
    const [sourceText, setSourceText] = useState('');
    const [translationDirection, setTranslationDirection] = useState('JA_VI');

    // AI Config State
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiQuestionCount, setAiQuestionCount] = useState(10);

    // Populate form if editing
    useEffect(() => {
        if (existingAssignment) {
            setTitle(existingAssignment.title);
            setDescription(existingAssignment.description || '');
            setAssignmentType(existingAssignment.assignmentType);
            setStatus(existingAssignment.status);
            
            if (existingAssignment.dueDate) {
                // Format for datetime-local input
                const d = new Date(existingAssignment.dueDate);
                const isoStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                setDueDate(isoStr);
            }

            if (existingAssignment.assignmentType === 'QUIZ' && existingAssignment.questions) {
                setQuestions(existingAssignment.questions.map(q => ({
                    ...q,
                    questionText: q.questionText || '',
                    options: Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? JSON.parse(q.options) : q.options),
                    correctAnswerIndex: q.correctAnswerIndex ?? 0,
                    points: (q as any).point || q.points || 10
                })));
            } else if (existingAssignment.assignmentType === 'WRITING') {
                setWritingPrompt(existingAssignment.writingContent?.prompt || '');
                setSampleAnswer(existingAssignment.writingContent?.sampleAnswer || '');
                setInstructions(existingAssignment.instructions || '');
            } else if (existingAssignment.assignmentType === 'TRANSLATION') {
                setSourceText(existingAssignment.writingContent?.sourceText || '');
                setSampleAnswer(existingAssignment.writingContent?.sampleAnswer || '');
                setInstructions(existingAssignment.instructions || '');
            }
        }
    }, [existingAssignment]);

    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, explanation: '' }
        ]);
    };

    const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuestions(newQuestions);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        const newOptions = [...(newQuestions[qIndex].options as string[])];
        newOptions[oIndex] = value;
        newQuestions[qIndex].options = newOptions;
        setQuestions(newQuestions);
    };

    const removeQuestion = (index: number) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((_, i) => i !== index));
        }
    };

    const handleAiGenerate = async () => {
        if (!aiPrompt) {
            setToast({ message: 'Vui lòng nhập Prompt để AI tạo câu hỏi', type: 'error' });
            return;
        }

        if (assignmentType === 'WRITING' && !writingPrompt.replace(/<[^>]*>/g, '').trim()) {
            setToast({ message: 'Vui lòng nhập đề bài cho bài viết', type: 'error' });
            return;
        }

        if (assignmentType === 'TRANSLATION' && !sourceText.replace(/<[^>]*>/g, '').trim()) {
            setToast({ message: 'Vui lòng nhập nội dung cần dịch', type: 'error' });
            return;
        }

        try {
            const generated = await aiGenMutation.mutateAsync({
                classId,
                teacherPrompt: aiPrompt,
                questionCount: aiQuestionCount
            });
            
            if (!Array.isArray(generated)) {
                throw new Error('Định dạng dữ liệu từ AI không hợp lệ (không phải danh sách)');
            }

            // Populate questions and switch to Manual mode to review
            const mappedQuestions: QuizQuestion[] = generated.map((q: any) => {
                let finalOptions: string[] = [];
                let correctIndex = 0;

                // Handle nested options object vs flat array
                if (Array.isArray(q.options)) {
                    finalOptions = q.options;
                } else if (q.options && Array.isArray(q.options.options)) {
                    finalOptions = q.options.options.map((opt: any) => typeof opt === 'string' ? opt : (opt.text || ''));
                }

                // Handle correctAnswer as string "A", "B", "C" vs number
                if (typeof q.correctAnswerIndex === 'number') {
                    correctIndex = q.correctAnswerIndex;
                } else if (typeof q.correctAnswer === 'string') {
                    const letter = q.correctAnswer.toUpperCase();
                    correctIndex = letter.charCodeAt(0) - 65; // A=0, B=1...
                }

                return {
                    questionText: q.questionText || '',
                    options: finalOptions.length > 0 ? finalOptions : ['', '', '', ''],
                    correctAnswerIndex: isNaN(correctIndex) ? 0 : correctIndex,
                    explanation: q.explanation || q.explanationVi || '',
                    points: 10
                };
            });

            setQuestions(mappedQuestions);
            setCreationMethod('MANUAL');
            setToast({ message: `Đã nhận được ${mappedQuestions.length} câu hỏi từ AI. Vui lòng kiểm tra lại trước khi lưu.`, type: 'success' });
        } catch (error: any) {
            console.error('AI Generation Error:', error);
            setToast({ 
                message: 'Lỗi khi tạo câu hỏi bằng AI. Có thể do nội dung quá dài hoặc cấu hình AI chưa đúng.', 
                type: 'error' 
            });
        }
    };

    const handleAiExplain = async (index: number) => {
        const q = questions[index];
        if (!q.questionText) return;

        try {
            const res = await aiExplainMutation.mutateAsync({
                questionText: q.questionText,
                options: q.options,
                correctAnswerIndex: q.correctAnswerIndex,
                questionType: 'multiple_choice', // Backend requires this
                correctAnswer: q.correctAnswerIndex !== undefined ? q.options[q.correctAnswerIndex] : '' // Text of the correct option
            });
            updateQuestion(index, 'explanation', res.explanation);
            setToast({ message: 'Đã tạo giải thích thành công', type: 'success' });
        } catch (error: any) {
            setToast({ message: 'Lỗi khi tạo giải thích: ' + error.message, type: 'error' });
        }
    };

    const { refetch: fetchFullAssignment } = useAssignmentDetail(''); // Hook for fetching full details

    const handleSelectAssignment = async (assignmentId: string) => {
        setIsReuseModalOpen(false);
        try {
            // We need to fetch the full assignment because the summary doesn't have questions/content
            const fullAssignment = await assignmentService.getAssignment(assignmentId);
            
            setTitle(fullAssignment.title + ' (Copy)');
            setDescription(fullAssignment.description || '');
            setAssignmentType(fullAssignment.assignmentType);
            
            if (fullAssignment.assignmentType === 'QUIZ' && fullAssignment.questions) {
                setQuestions(fullAssignment.questions.map((q: any) => ({
                    ...q,
                    questionText: q.questionText || '',
                    options: Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? JSON.parse(q.options) : q.options),
                    correctAnswerIndex: q.correctAnswerIndex ?? 0,
                    points: (q as any).point || q.points || 10
                })));
            } else if (fullAssignment.assignmentType === 'WRITING') {
                setWritingPrompt(fullAssignment.writingContent?.prompt || '');
                setSampleAnswer(fullAssignment.writingContent?.sampleAnswer || '');
                setInstructions(fullAssignment.instructions || '');
            } else if (fullAssignment.assignmentType === 'TRANSLATION') {
                setSourceText(fullAssignment.writingContent?.sourceText || '');
                setSampleAnswer(fullAssignment.writingContent?.sampleAnswer || '');
                setInstructions(fullAssignment.instructions || '');
            }
            
            setCreationMethod('MANUAL');
            setToast({ message: 'Đã tải nội dung bài tập thành công', type: 'success' });
        } catch (error: any) {
            setToast({ message: 'Lỗi khi tải thông tin bài tập: ' + error.message, type: 'error' });
        }
    };

    const toUTC = (localStr: string) => {
        if (!localStr) return null;
        // Explicitly parse parts to avoid browser-specific string parsing issues
        const [year, month, day, hour, minute] = localStr.split(/[-T:]/).map(Number);
        const d = new Date(year, month - 1, day, hour, minute);
        return d.toISOString();
    };

    const handleSubmit = async (submitStatus: 'DRAFT' | 'PUBLISHED') => {
        if (!title.trim()) {
            setToast({ message: 'Vui lòng nhập tiêu đề bài tập.', type: 'error' });
            return;
        }

        try {
            if (assignmentType === 'QUIZ') {
                const emptyQuestionIdx = questions.findIndex(q => {
                    const hasText = q.questionText && q.questionText.replace(/<[^>]*>/g, '').trim() !== '';
                    return !hasText;
                });

                if (emptyQuestionIdx !== -1) {
                    setToast({ 
                        message: `Câu hỏi số ${emptyQuestionIdx + 1} đang để trống nội dung.`, 
                        type: 'error' 
                    });
                    return;
                }

                const hasEmptyOption = questions.some(q => (q.options as string[]).some((opt: string) => !opt || opt.trim() === ''));
                if (hasEmptyOption) {
                    setToast({ message: 'Vui lòng điền đầy đủ tất cả các đáp án.', type: 'error' });
                    return;
                }

                // Check if dueDate matches original local format to avoid jitter or timezone jumps
                const originalLocalISO = existingAssignment?.dueDate 
                    ? new Date(new Date(existingAssignment.dueDate).getTime() - new Date(existingAssignment.dueDate).getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                    : '';
                
                const finalDueDate = (isEdit && dueDate === originalLocalISO && existingAssignment?.dueDate)
                    ? existingAssignment.dueDate // Keep original string exactly
                    : (dueDate ? toUTC(dueDate) : new Date().toISOString());

                const data: SaveFullQuizRequest = {
                    title,
                    description,
                    dueDate: finalDueDate as string,
                    questions,
                    status: submitStatus
                };

                console.log('====================================');
                console.log('🚀 SUBMITTING QUIZ TO BE');
                console.log('Title:', data.title);
                console.log('Questions:', data.questions);
                console.log('Full Payload:', data);
                console.log('====================================');

                if (isEdit) {
                    await updateQuizMutation.mutateAsync({ assignmentId: assignmentId!, data, audioFile: generalAudio || undefined });
                } else {
                    await createQuizMutation.mutateAsync({ classId, data, audioFile: generalAudio || undefined });
                }
            } else {
                const isTranslation = assignmentType === 'TRANSLATION';
                const promptValue = isTranslation ? sourceText : writingPrompt;

                if (!promptValue.trim()) {
                    setToast({ 
                        message: isTranslation ? 'Vui lòng nhập nội dung cần dịch.' : 'Vui lòng nhập đề bài viết.', 
                        type: 'error' 
                    });
                    return;
                }

                const originalLocalISO = existingAssignment?.dueDate 
                    ? new Date(new Date(existingAssignment.dueDate).getTime() - new Date(existingAssignment.dueDate).getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                    : '';
                
                const finalDueDate = (isEdit && dueDate === originalLocalISO && existingAssignment?.dueDate)
                    ? existingAssignment.dueDate
                    : (dueDate ? toUTC(dueDate) : new Date().toISOString());

                const writingRequest: SaveFullWritingRequest = {
                    title,
                    description,
                    dueDate: finalDueDate as string,
                    prompt: promptValue,
                    writingPrompt: assignmentType === 'WRITING' ? writingPrompt : undefined,
                    sourceText: assignmentType === 'TRANSLATION' ? sourceText : undefined,
                    translationDirection: isTranslation ? translationDirection : undefined,
                    status: submitStatus
                };

                console.log('====================================');
                console.log('🚀 SUBMITTING WRITING/TRANSLATION TO BE');
                console.log('Title:', writingRequest.title);
                console.log('Prompt Content:', writingRequest.prompt);
                console.log('Full Payload:', writingRequest);
                console.log('====================================');

                if (isEdit && existingAssignment) {
                    await updateWritingMutation.mutateAsync({ assignmentId: existingAssignment.id, data: writingRequest, isTranslation });
                } else {
                    await createWritingMutation.mutateAsync({ classId, data: writingRequest, isTranslation });
                }
            }

            setToast({ message: 'Đã lưu bài tập thành công', type: 'success' });
            setTimeout(() => router.push(`/my-classes/${classId}/assignments`), 1500);
        } catch (error: any) {
            setToast({ message: 'Lưu thất bại: ' + error.message, type: 'error' });
        }
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full pb-32">
            {toast && <Toast message={toast.message} type={toast.type} isVisible={!!toast} onClose={() => setToast(null)} />}

            <ReuseAssignmentModal 
                isOpen={isReuseModalOpen}
                onClose={() => setIsReuseModalOpen(false)}
                onSelect={handleSelectAssignment}
            />

            <PageHeader 
                breadcrumb={[
                    { label: 'Quản lí lớp học', href: '/my-classes' },
                    { label: 'UD102', href: `/my-classes/${classId}` },
                    { label: 'Quản lí bài tập', href: `/my-classes/${classId}/assignments` },
                    { label: isEdit ? 'Chỉnh sửa bài tập' : 'Tạo bài tập mới', active: true }
                ]}
                backUrl={`/my-classes/${classId}/assignments`}
                title={isEdit ? 'Chỉnh sửa bài tập' : 'Tạo bài tập mới'}
                action={
                    <button 
                        onClick={() => setIsReuseModalOpen(true)}
                        className="px-6 py-2.5 bg-[#253A8C] text-white rounded-xl font-bold text-sm flex items-center gap-3 shadow-lg shadow-blue-900/10 hover:bg-[#1e2e70] transition-all"
                    >
                        <span className="flex items-center gap-2">
                            Tái sử dụng bài tập cũ
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/></svg>
                        </span>
                    </button>
                }
            />

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm mb-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">Thông tin chung</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-bold text-gray-600">Tên bài tập</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Nhập tên bài tập (ví dụ: Kiểm tra Kanji N3)"
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-800 placeholder-gray-300 shadow-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600">Loại bài tập</label>
                        <select
                            value={assignmentType}
                            onChange={(e) => setAssignmentType(e.target.value as AssignmentType)}
                            disabled={isEdit}
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-700 appearance-none cursor-pointer disabled:bg-gray-100 shadow-sm"
                        >
                            <option value="QUIZ">Quiz / Trắc nghiệm</option>
                            <option value="WRITING">Tự luận / Viết văn</option>
                            <option value="TRANSLATION">Dịch thuật (Translation)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600">Hạn chót</label>
                        <div className="relative group">
                            <input
                                type="datetime-local"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-700 shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6 space-y-2">
                    <label className="text-sm font-bold text-gray-600">Mô tả</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Mô tả ngắn gọn bài tập"
                        className="w-full h-24 px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-800 placeholder-gray-300 resize-none shadow-sm"
                    />
                </div>
            </div>

            {/* 2. THIẾT LẬP NỘI DUNG */}
            <div className="flex items-center gap-3 mb-6 mt-4">
                <div className="w-6 h-6 text-blue-500 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
                </div>
                <h2 className="text-lg font-bold text-gray-800">Thiết lập nội dung</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div 
                    onClick={() => setCreationMethod('MANUAL')}
                    className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 bg-white ${creationMethod === 'MANUAL' ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-gray-100 hover:border-gray-200'}`}
                >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${creationMethod === 'MANUAL' ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-400'}`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">Tạo thủ công</h3>
                        <p className="text-sm text-gray-400 font-medium">Tự soạn câu hỏi và đáp án</p>
                    </div>
                    {creationMethod === 'MANUAL' && (
                        <div className="absolute right-6 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                    )}
                </div>

                {assignmentType === 'QUIZ' && !isEdit && (
                    <div 
                        onClick={() => setCreationMethod('AI')}
                        className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 bg-white ${creationMethod === 'AI' ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${creationMethod === 'AI' ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-400'}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.5L14.2 9.49997L21.5 12L14.2 14.5L12 21.5L9.8 14.5L2.5 12L9.8 9.49997L12 2.5ZM6 5L6.6 6.89999L8.5 7.5L6.6 8.1L6 10L5.4 8.1L3.5 7.5L5.4 6.89999L6 5ZM18 14L18.6 15.9L20.5 16.5L18.6 17.1L18 19L17.4 17.1L15.5 16.5L17.4 15.9L18 14Z"></path></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">Tạo bằng AI</h3>
                            <p className="text-sm text-gray-400 font-medium">Tạo câu hỏi theo yêu cầu</p>
                        </div>
                        {creationMethod === 'AI' && (
                            <div className="absolute right-6 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Audio Section */}
            {assignmentType === 'QUIZ' && (
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-md font-bold text-gray-800">Audio chung cho toàn bài (Tùy chọn)</h3>
                            <p className="text-xs text-gray-400 font-medium mt-1">Phát xuyên suốt quá trình làm bài</p>
                        </div>
                        <label className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                            Upload MP3
                            <input type="file" className="hidden" accept="audio/*" onChange={(e) => setGeneralAudio(e.target.files?.[0] || null)} />
                        </label>
                    </div>

                    {generalAudio && (
                        <div className="flex items-center gap-4 w-full bg-slate-50/50 p-4 rounded-3xl border border-blue-100 shadow-sm animate-in fade-in slide-in-from-left-2">
                             <audio 
                                ref={audioRef}
                                src={audioUrl || ''}
                                preload="auto"
                                onTimeUpdate={() => {
                                    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
                                }}
                                onLoadedMetadata={() => {
                                    if (audioRef.current) setDuration(audioRef.current.duration);
                                }}
                                onEnded={() => setIsPlaying(false)}
                            />

                            <button 
                                onClick={togglePlay}
                                className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                {isPlaying ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><path d="M5 3l14 9-14 9V3z"></path></svg>
                                )}
                            </button>
                            
                            <div className="flex-1 flex flex-col gap-1.5 ">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-black text-blue-600 truncate max-w-[200px] bg-blue-50 px-2 py-0.5 rounded-md">{generalAudio.name}</span>
                                    <span className="text-[10px] font-black text-slate-400 tabular-nums">{formatTime(currentTime)} / {formatTime(duration)}</span>
                                </div>
                                
                                <div 
                                    className="h-2 bg-blue-100/50 rounded-full relative overflow-hidden cursor-pointer group/progress"
                                    onClick={(e) => {
                                        if (audioRef.current && duration) {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const clickRatio = (e.clientX - rect.left) / rect.width;
                                            audioRef.current.currentTime = clickRatio * duration;
                                        }
                                    }}
                                >
                                    <div 
                                        className="absolute top-0 left-0 h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all duration-100"
                                        style={{ width: `${(currentTime / duration || 0) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <button onClick={() => setGeneralAudio(null)} className="p-3 text-slate-300 hover:text-red-500 transition-colors">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    )}
                </div>
            )}

            <ReuseAssignmentModal 
                isOpen={isReuseModalOpen}
                onClose={() => setIsReuseModalOpen(false)}
                onSelect={handleSelectAssignment}
            />

            {/* CONTENT AREA */}
            <div className="pb-24">
                {creationMethod === 'AI' && assignmentType === 'QUIZ' ? (
                    <div className="space-y-6">
                        <div className="bg-blue-50 px-8 py-10 rounded-3xl border border-blue-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500"><path d="M12 2.5L14.2 9.49997L21.5 12L14.2 14.5L12 21.5L9.8 14.5L2.5 12L9.8 9.49997L12 2.5Z"/></svg>
                            </div>
                            <label className="block text-sm font-bold text-blue-800 mb-4 uppercase tracking-widest">Mô tả nội dung để AI tạo câu hỏi</label>
                            <textarea
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                className="w-full h-40 px-6 py-5 bg-white border border-blue-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-gray-700 placeholder-blue-300 shadow-sm resize-none"
                                placeholder="Ví dụ: Tạo 10 câu trắc nghiệm kiểm tra trợ từ Ni, De, Wo và động từ di chuyển của Bài 5 Minna no Nihongo..."
                            />
                            <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-2xl border border-blue-100 shadow-sm">
                                    <span className="text-sm font-bold text-gray-500">Số lượng:</span>
                                    <input 
                                        type="number"
                                        value={aiQuestionCount}
                                        onChange={(e) => setAiQuestionCount(parseInt(e.target.value) || 1)}
                                        className="w-12 bg-transparent text-center font-black text-blue-600 focus:outline-none"
                                        min={1} max={50}
                                    />
                                    <span className="text-sm font-bold text-gray-400">câu</span>
                                </div>
                                <button 
                                    onClick={handleAiGenerate}
                                    disabled={aiGenMutation.isPending}
                                    className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-base shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {aiGenMutation.isPending ? 'Đang tạo đề...' : (
                                        <>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5L14.2 9.49997L21.5 12L14.2 14.5L12 21.5L9.8 14.5L2.5 12L9.8 9.49997L12 2.5ZM6 5L6.6 6.89999L8.5 7.5L6.6 8.1L6 10L5.4 8.1L3.5 7.5L5.4 6.89999L6 5ZM18 14L18.6 15.9L20.5 16.5L18.6 17.1L18 19L17.4 17.1L15.5 16.5L17.4 15.9L18 14Z"></path></svg>
                                            Bắt đầu tạo bằng AI
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {assignmentType === 'QUIZ' ? (
                            <div className="space-y-8">
                                {questions.map((q, idx) => (
                                    <div key={idx} className="relative bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm group hover:border-blue-200 transition-all hover:shadow-xl hover:shadow-blue-500/5">
                                        <div className="flex items-center justify-between mb-8">
                                            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest">CÂU HỎI {idx + 1}</span>
                                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => removeQuestion(idx)}
                                                    className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-10">
                                            <div className="bg-gray-50/50 rounded-2xl p-1 border border-gray-100 shadow-inner">
                                                <RichTextEditor 
                                                    value={q.questionText}
                                                    onChange={(val) => updateQuestion(idx, 'questionText', val)}
                                                    placeholder="Nhập nội dung câu hỏi..."
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {(q.options as string[]).map((opt, oIdx) => (
                                                    <div key={oIdx} className="relative flex items-center group/opt">
                                                        <div className={`absolute left-5 w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center pointer-events-none ${
                                                            q.correctAnswerIndex === oIdx 
                                                            ? 'border-blue-600 bg-blue-600' 
                                                            : 'border-gray-200 group-hover/opt:border-blue-400'
                                                        }`}>
                                                            {q.correctAnswerIndex === oIdx && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                                        </div>
                                                        <input 
                                                            type="text"
                                                            value={opt}
                                                            onChange={(e) => updateOption(idx, oIdx, e.target.value)}
                                                            onClick={() => updateQuestion(idx, 'correctAnswerIndex', oIdx)}
                                                            className={`w-full pl-14 pr-6 py-4 border rounded-2xl font-bold transition-all appearance-none cursor-pointer focus:outline-none ${
                                                                q.correctAnswerIndex === oIdx 
                                                                ? 'bg-blue-50/50 border-blue-200 text-blue-900 shadow-sm' 
                                                                : 'bg-gray-50/50 border-gray-100 text-gray-700 hover:bg-white hover:border-blue-100'
                                                            }`}
                                                            placeholder={`Đáp án ${String.fromCharCode(65 + oIdx)}...`}
                                                        />
                                                        <span className={`absolute left-6 text-[10px] font-black pointer-events-none transition-colors ${
                                                            q.correctAnswerIndex === oIdx ? 'text-white' : 'text-gray-400 group-hover/opt:text-blue-500'
                                                        }`}>
                                                            {String.fromCharCode(65 + oIdx)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 relative group/explain shadow-inner">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500/50"><path d="M12 2.5L14.2 9.49997L21.5 12L14.2 14.5L12 21.5L9.8 14.5L2.5 12L9.8 9.49997L12 2.5Z"/></svg>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Giải thích đáp án</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleAiExplain(idx)}
                                                        disabled={aiExplainMutation.isPending || !q.questionText}
                                                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
                                                    >
                                                        {aiExplainMutation.isPending ? 'Đang tạo...' : 'AI Tạo giải thích'}
                                                    </button>
                                                </div>
                                                <textarea 
                                                    value={q.explanation}
                                                    onChange={(e) => updateQuestion(idx, 'explanation', e.target.value)}
                                                    className="w-full h-12 bg-transparent border-none focus:ring-0 p-0 text-sm text-slate-600 placeholder-gray-300 font-bold resize-none leading-relaxed"
                                                    placeholder="Đáp án đúng vì..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button 
                                    onClick={handleAddQuestion}
                                    className="w-full py-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[32px] text-gray-400 font-bold text-xs uppercase tracking-widest hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-4 active:scale-95 group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white group-hover:bg-blue-100 flex items-center justify-center transition-colors shadow-sm">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                    </div>
                                    Thêm câu hỏi mới
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-10">
                                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">
                                            {assignmentType === 'WRITING' ? 'Đề bài văn / Prompt' : 'Văn bản gốc cần dịch'}
                                        </h3>
                                    </div>
                                    <div className="bg-gray-50/50 rounded-2xl p-1 border border-gray-100 shadow-inner min-h-[300px]">
                                        <RichTextEditor 
                                            value={assignmentType === 'WRITING' ? writingPrompt : sourceText}
                                            onChange={(val) => assignmentType === 'WRITING' ? setWritingPrompt(val) : setSourceText(val)}
                                            placeholder={assignmentType === 'WRITING' ? 'Hãy viết một đoạn văn ngắn về gia đình của bạn...' : 'Hãy dịch đoạn văn sau sang tiếng Nhật...'}
                                        />
                                    </div>
                                </div>

                                {assignmentType === 'TRANSLATION' && (
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm max-w-sm">
                                        <div className="space-y-3">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Hướng dịch ngôn ngữ</span>
                                            <div className="relative">
                                                <select 
                                                    value={translationDirection}
                                                    onChange={(e) => setTranslationDirection(e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                                                >
                                                    <option value="JA_VI">Tiếng Nhật → Tiếng Việt</option>
                                                    <option value="VI_JA">Tiếng Việt → Tiếng Nhật</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ACTION BAR */}
            <div className="fixed bottom-0 left-0 lg:left-[280px] w-full lg:w-[calc(100%-280px)] bg-white/80 backdrop-blur-xl border-t border-gray-100 p-6 px-12 flex items-center justify-between z-30 shadow-[0_-15px_30px_-5px_rgba(0,0,0,0.03)]">
                <div className="flex items-center gap-8">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2.5 text-xs font-bold text-gray-400 hover:text-gray-900 transition-all"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        HUỶ BỎ
                    </button>
                    
                    <button 
                        onClick={() => handleSubmit('DRAFT')}
                        disabled={isFetching || createQuizMutation.isPending || updateQuizMutation.isPending || createWritingMutation.isPending}
                        className="text-xs font-bold text-gray-500 hover:text-blue-600 uppercase tracking-widest transition-colors disabled:opacity-50"
                    >
                        Lưu bản nháp
                    </button>
                </div>

                <button 
                    onClick={() => handleSubmit('PUBLISHED')}
                    disabled={isFetching || createQuizMutation.isPending || updateQuizMutation.isPending || createWritingMutation.isPending}
                    className="px-10 py-4 bg-[#2D4396] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-900/20 hover:bg-[#253A8C] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50"
                >
                    {isEdit ? 'Cập nhật bài tập' : 'Xác nhận giao bài'}
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </div>
                </button>
            </div>
        </div>
    );
}
