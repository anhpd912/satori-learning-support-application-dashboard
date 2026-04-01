import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ToastType } from '@/shared/components/Toast';
import { courseService } from '@/features/courses/services/course.service';
import { validateCourseForm } from '../utils/validation';

export function useCourseUpdate(courseId: string) {
    const router = useRouter();

    const [isFetching, setIsFetching] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [generalError, setGeneralError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        level: '',
        status: '',
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

    const statusOptions = useMemo(() => [
        { label: 'Hoạt động (ACTIVE)', value: 'ACTIVE' },
        { label: 'Không hoạt động (INACTIVE)', value: 'INACTIVE' },
    ], []);

    useEffect(() => {
        const fetchCourseData = async () => {
            if (!courseId) return;
            setIsFetching(true);
            try {
                const data = await courseService.getCourseById(courseId);
                
                setFormData({
                    name: data.name || '',
                    level: data.jlptLevel || '',
                    status: data.status || 'ACTIVE',
                    description: data.description || '',
                });

            } catch (error: any) {
                setToast({ message: error.message || 'Lỗi khi tải dữ liệu khóa học', type: 'error', isVisible: true });
            } finally {
                setIsFetching(false);
            }
        };

        fetchCourseData();
    }, [courseId]);

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
                description: formData.description.trim() || undefined,
                jlptLevel: formData.level, 
                status: formData.status 
            };

            await courseService.updateCourse(courseId, payload);
            
            setToast({ message: 'Cập nhật khóa học thành công!', type: 'success', isVisible: true });
            
            setTimeout(() => router.push(`/courses/${courseId}`), 1500);

        } catch (error: any) {
            if (error.validationErrors) {
                setErrors(error.validationErrors);
            } else {
                setGeneralError(error.message || 'Có lỗi xảy ra khi cập nhật khóa học');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isFetching,
        isLoading,
        errors,
        generalError,
        formData,
        toast, setToast,
        levelOptions,
        statusOptions,
        handleChange,
        handleSubmit
    };
}
