export interface CourseFormData {
    name: string;
    level: string;
    description: string;
    status?: string; // Trạng thái chỉ bắt buộc khi update
}

export function validateCourseForm(formData: CourseFormData): { isValid: boolean, errors: Record<string, string> } {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (!formData.name.trim()) { 
        errors.name = 'Vui lòng nhập tên khóa học'; 
        isValid = false; 
    } else if (formData.name.length > 100) {
        errors.name = 'Tên khóa học không được vượt quá 100 ký tự';
        isValid = false;
    }

    if (!formData.level) { 
        errors.level = 'Vui lòng chọn cấp độ'; 
        isValid = false; 
    }

    if (formData.description.trim() && formData.description.length > 5000) {
        errors.description = 'Mô tả khóa học không được vượt quá 5000 ký tự';
        isValid = false;
    }

    // Nếu object form data có truyền status (Trường hợp Update) thì validate
    if (formData.status !== undefined && !formData.status) {
        errors.status = 'Vui lòng chọn trạng thái'; 
        isValid = false;
    }

    return { isValid, errors };
}

export interface LessonFormData {
    title: string;
    description: string;
}

export function validateLessonForm(formData: LessonFormData): { isValid: boolean, errors: Record<string, string> } {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (!formData.title.trim()) { 
        errors.title = 'Vui lòng nhập tiêu đề bài học'; 
        isValid = false; 
    } else if (formData.title.length > 200) {
        errors.title = 'Tiêu đề bài học không được vượt quá 200 ký tự';
        isValid = false;
    }

    if (formData.description.trim() && formData.description.length > 5000) {
        errors.description = 'Mô tả bài học không được vượt quá 5000 ký tự';
        isValid = false;
    }

    return { isValid, errors };
}
