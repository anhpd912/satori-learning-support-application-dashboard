'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import FormInput from '@/shared/components/FormInput';
import FormSelect from '@/shared/components/FormSelect';
import FormDate from '@/shared/components/FormDate';
import PageHeader from '@/shared/components/PageHeader';
import Toast, { ToastType } from '@/shared/components/Toast';
import ConfirmModal from '@/shared/components/ConfirmModal';
import { userService, CreateUserRequest } from '@/features/users/services/user.service';

interface CreateUserFeatureProps {
  currentRole?: 'ADMIN' | 'CONTENT_MANAGER' | 'OPERATION_MANAGER';
}

export default function CreateUserFeature({ currentRole = 'ADMIN' }: CreateUserFeatureProps) {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  const [restoreUserData, setRestoreUserData] = useState<any>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '', type: 'success', isVisible: false
  });

  const [formData, setFormData] = useState<CreateUserRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: '' as any,
    dateOfBirth: ''
  });

  const roleOptions = useMemo(() => {
      const options = [
        { label: 'Giáo viên', value: 'TEACHER' },
        { label: 'Học viên', value: 'LEARNER' },
      ];

      if (currentRole === 'ADMIN') {
          options.push(
              { label: 'Quản lý nội dung (Content)', value: 'CONTENT_MANAGER' },
              { label: 'Quản lý vận hành (Operation)', value: 'OPERATION_MANAGER' },
              { label: 'Quản trị viên (Admin)', value: 'ADMIN' }
          );
      }
      return options;
  }, [currentRole]);

  const backUrl = currentRole === 'ADMIN' ? '/admin/users' : '/users';

  const handleCancelClick = () => {
    const hasChanges = formData.firstName !== '' || 
                       formData.lastName !== '' || 
                       formData.email !== '' || 
                       (formData.phoneNumber !== undefined && formData.phoneNumber !== '') || 
                       formData.role !== ('' as any) || 
                       formData.dateOfBirth !== '';
                       
    if (hasChanges) {
        setShowConfirmCancel(true);
    } else {
        router.push(backUrl);
    }
  };

  const handleConfirmCancel = () => {
      setShowConfirmCancel(false);
      router.push(backUrl);
  };

  const handleChange = (field: keyof CreateUserRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRestore = async () => {
      if (!restoreUserData?.userId) return;
      
      setIsRestoring(true);
      try {
          const payload = {
              userId: restoreUserData.userId, 
              email: formData.email.trim(),
              firstName: formData.firstName.trim(),
              lastName: formData.lastName.trim(),
              role: formData.role
          };

          await userService.restoreUser(payload);
          
          setToast({ message: 'Khôi phục tài khoản thành công!', type: 'success', isVisible: true });
          setRestoreUserData(null);

          setTimeout(() => router.push(backUrl), 1500);

      } catch (error: any) {
          setToast({ message: error.message || 'Lỗi khôi phục', type: 'error', isVisible: true });
      } finally {
          setIsRestoring(false); 
      }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!formData.lastName.trim()) { newErrors.lastName = 'Vui lòng nhập họ'; isValid = false; }
    else if (formData.lastName.length > 100) { newErrors.lastName = 'Họ quá 100 ký tự'; isValid = false; }

    if (!formData.firstName.trim()) { newErrors.firstName = 'Vui lòng nhập tên'; isValid = false; }
    else if (formData.firstName.length > 100) { newErrors.firstName = 'Tên quá 100 ký tự'; isValid = false; }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) { newErrors.email = 'Vui lòng nhập email'; isValid = false; }
    else if (!emailRegex.test(formData.email)) { newErrors.email = 'Email sai định dạng'; isValid = false; }
    else if (formData.email.length > 255) { newErrors.email = 'Email quá 255 ký tự'; isValid = false; }

    const phoneRegex = /^[+]?[0-9]{10,15}$/;
    if (formData.phoneNumber && formData.phoneNumber.trim() !== '') {
        if (!phoneRegex.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'SĐT không hợp lệ (10-15 số)';
            isValid = false;
        }
    }

    if (!formData.role) { newErrors.role = 'Vui lòng chọn vai trò'; isValid = false; }

    if (formData.dateOfBirth) {
        const dob = new Date(formData.dateOfBirth);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dob > today) { newErrors.dateOfBirth = 'Ngày sinh không được ở tương lai'; isValid = false; }
    }

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
          ...formData,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phoneNumber: formData.phoneNumber ? formData.phoneNumber.trim() : undefined,
          dateOfBirth: formData.dateOfBirth || undefined
      };

      await userService.createUser(payload);
      
      setToast({ message: 'Tạo người dùng mới thành công!', type: 'success', isVisible: true });
      setTimeout(() => router.push(backUrl), 1500);

    } catch (error: any) {
      if (error.code === 'DELETED_USER_EXISTS' && error.data) {
          setRestoreUserData(error.data); 
      } 
      else if (error.validationErrors) {
          setErrors(error.validationErrors); 
          if (error.validationErrors.email) document.getElementById('email-input')?.focus();
      } 
      else {
          setGeneralError(error.message || 'Có lỗi xảy ra khi tạo người dùng');
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />

      <ConfirmModal 
        isOpen={!!restoreUserData}
        onClose={() => setRestoreUserData(null)}
        onConfirm={handleRestore}
        isLoading={isRestoring}
        variant="info"
        title="Tài khoản đã tồn tại"
        message={restoreUserData ? (
             restoreUserData.message || 
             `Email "${restoreUserData.email}" đã tồn tại nhưng đang ở trạng thái bị xóa. Bạn có muốn khôi phục lại tài khoản này với thông tin mới nhập không?`
        ) : ''}
        confirmText="Khôi phục tài khoản"
        cancelText="Hủy bỏ"
      />

      <ConfirmModal 
        isOpen={showConfirmCancel}
        onClose={() => setShowConfirmCancel(false)}
        onConfirm={handleConfirmCancel}
        title="Xác nhận hủy"
        message="Bạn có chắc chắn muốn hủy? Mọi thông tin bạn vừa nhập sẽ không được lưu."
        confirmText="Đồng ý hủy"
        cancelText="Đóng"
        variant="danger"
      />

      <PageHeader 
        breadcrumb={
          <>
             Quản lí người dùng <span className="mx-1">{'>'}</span> <span className="text-gray-900 font-medium">Tạo người dùng mới</span>
          </>
        }
        backUrl={backUrl} 
        title="Tạo người dùng mới"
        description={`Tạo người dùng mới với quyền ${currentRole === 'ADMIN' ? 'Quản trị' : 'Quản lý'}`}
      />

      {generalError && (
        <div className="max-w-4xl mx-auto mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <div className="text-red-500 shrink-0">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <p className="text-sm text-red-600">{generalError}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput 
                    label="Họ" 
                    placeholder="Nhập họ" 
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    required
                    error={errors.lastName}
                />
                <FormInput 
                    label="Tên" 
                    placeholder="Nhập tên" 
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    required
                    error={errors.firstName}
                />
            </div>

            <FormInput 
                id="email-input"
                label="Email" 
                type="email"
                placeholder="name@company.com" 
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                error={errors.email}
            />

            <FormInput 
                label="Số điện thoại" 
                type="tel"
                placeholder="0912345678" 
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                error={errors.phoneNumber}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormSelect 
                    label="Vai trò"
                    placeholder="Chọn vai trò"
                    options={roleOptions}
                    required
                    value={formData.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    error={errors.role}
                />
                <FormDate 
                    label="Ngày sinh" 
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    error={errors.dateOfBirth}
                />
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 mt-8">
                <button 
                    type="button" 
                    onClick={handleCancelClick}
                    className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                    Hủy
                </button>
                
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="px-6 py-2.5 rounded-lg bg-[#253A8C] text-white font-medium hover:bg-[#1e2e70] transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                >
                    {isLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                    {isLoading ? 'Đang xử lý...' : 'Tạo mới'}
                </button>
            </div>
        </form>
      </div>

      <div className="max-w-4xl mx-auto bg-blue-50 rounded-xl p-6 flex items-start gap-4 border border-blue-100">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 font-bold">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
        </div>
        <div>
            <h3 className="text-blue-900 font-bold text-sm">Lưu ý thiết lập</h3>
            <p className="text-blue-700 text-sm mt-1 leading-relaxed">
                Sau khi tài khoản được tạo, hệ thống sẽ tự động gửi email mời người dùng thiết lập mật khẩu.
            </p>
        </div>
      </div>
    </div>
  );
}