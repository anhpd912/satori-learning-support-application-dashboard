import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ToastType } from '@/shared/components/Toast';
import { courseService } from '@/features/courses/services/course.service';
import { validateCourseForm } from '../utils/validation';

export function useCourseCreate() {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [generalError, setGeneralError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        level: '',
        description: '',
    });
    

    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '', type: 'success', isVisible: false
    });

    const levelOptions = useMemo(() => [
        { label: 'N1', value: 'N1' },
        { label: 'N2', value: 'N2' },
        { label: 'N3', value: 'N3' },
        { label: 'N4', value: 'N4' },
        { label: 'N5', value: 'N5' },
    ], []);

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };


    const validateForm = () => {
        const { isValid, errors: newErrors } = validateCourseForm(formData);
        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});
        setGeneralError('');

        try {
            const payload = {
                name: formData.name.trim(),
                jlptLevel: formData.level,
                description: formData.description.trim() || undefined,
            };

            await courseService.createCourse(payload);
            
            setToast({ message: 'Tạo khóa học thành công!', type: 'success', isVisible: true });
            setTimeout(() => router.push('/courses'), 1500);
        } catch (error: any) {
            if (error.response?.data?.message) {
                setGeneralError(error.response.data.message);
            } else {
                setGeneralError('Có lỗi xảy ra khi tạo khóa học');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        errors,
        generalError,
        formData,
        toast, setToast,
        levelOptions,
        handleChange,
        handleSubmit
    };
}
