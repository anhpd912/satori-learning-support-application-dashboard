'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import PageHeader from '@/shared/components/PageHeader';
import FormInput from '@/shared/components/FormInput';
import FormSelect from '@/shared/components/FormSelect';
import FormDate from '@/shared/components/FormDate';
import Toast, { ToastType } from '@/shared/components/Toast';
import { userService, UpdateUserRequest } from '@/features/users/services/user.service';
import ConfirmModal from '@/shared/components/ConfirmModal';

interface UpdateUserFeatureProps {
  userId: string;
  currentRole?: 'ADMIN' | 'CONTENT_MANAGER' | 'OPERATION_MANAGER';
}

export default function UpdateUserFeature({ userId, currentRole = 'ADMIN' }: UpdateUserFeatureProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const [formData, setFormData] = useState<UpdateUserRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: '' as any,
    dateOfBirth: '',
    status: 'ACTIVE'
  });

  const backUrl = currentRole === 'ADMIN' ? `/admin/users/${userId}` : `/users/${userId}`;
  //const listUrl = currentRole === 'ADMIN' ? `/admin/users` : `/users`;

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

  const statusOptions = [
    { label: 'Hoạt động (Active)', value: 'ACTIVE' },
    { label: 'Không hoạt động (Inactive)', value: 'INACTIVE' },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await userService.getUserById(userId);
        
        let fName = '';
        let lName = '';
        const rawUser = user as any;

        if (rawUser.firstName || rawUser.lastName) {
             fName = rawUser.firstName || '';
             lName = rawUser.lastName || '';
        } else if (user.name) {
             const parts = user.name.trim().split(' ');
             if (parts.length > 0) {
                 lName = parts[0];
                 fName = parts.slice(1).join(' ');
             }
        }

        setFormData({
            firstName: fName, 
            lastName: lName,
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            role: user.role,
            dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
            status: user.status || 'ACTIVE'
        });
      } catch (err: any) {
        setGeneralError(err.message || 'Không thể tải thông tin người dùng');
      } finally {
        setIsFetching(false);
      }
    };
    if (userId) fetchUser();
  }, [userId]);


  const handleChange = (field: keyof UpdateUserRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!formData.lastName?.trim()) { 
        newErrors.lastName = 'Vui lòng nhập họ'; isValid = false; 
    } else if (formData.lastName.length > 100) { 
        newErrors.lastName = 'Họ quá 100 ký tự'; isValid = false; 
    }

    if (!formData.firstName?.trim()) { 
        newErrors.firstName = 'Vui lòng nhập tên'; isValid = false; 
    } else if (formData.firstName.length > 100) { 
        newErrors.firstName = 'Tên quá 100 ký tự'; isValid = false; 
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email?.trim()) { 
        newErrors.email = 'Vui lòng nhập email'; isValid = false; 
    } else if (!emailRegex.test(formData.email)) { 
        newErrors.email = 'Email sai định dạng'; isValid = false; 
    } else if (formData.email.length > 255) { 
        newErrors.email = 'Email quá 255 ký tự'; isValid = false; 
    }

    const phoneRegex = /^[+]?[0-9]{10,15}$/;
    if (formData.phoneNumber && formData.phoneNumber.trim() !== '') {
        if (!phoneRegex.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'SĐT không hợp lệ (10-15 số)'; isValid = false;
        }
    }

    if (!formData.role) { 
        newErrors.role = 'Vui lòng chọn vai trò'; isValid = false; 
    }

    if (formData.dateOfBirth) {
        const dob = new Date(formData.dateOfBirth);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dob > today) { 
            newErrors.dateOfBirth = 'Ngày sinh không được ở tương lai'; isValid = false; 
        }
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
            firstName: formData.firstName?.trim(),
            lastName: formData.lastName?.trim(),
            email: formData.email?.trim(),
            phoneNumber: formData.phoneNumber?.trim() || undefined,
            dateOfBirth: formData.dateOfBirth || undefined
        };

        await userService.updateUser(userId, payload);

        setToast({ message: 'Cập nhật thành công! Đang chuyển hướng...', type: 'success', isVisible: true });
        setTimeout(() => router.push(backUrl), 1500);

    } catch (error: any) {
        if (error.validationErrors) {
            setErrors(error.validationErrors);
             if (error.validationErrors.email) document.getElementById('email-input')?.focus();
             setToast({ message: 'Vui lòng kiểm tra lại thông tin', type: 'error', isVisible: true });
        } else {
            setGeneralError(error.message || 'Lỗi khi cập nhật');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleDelete = async () => {
      

      setIsDeleting(true);
      try {
          await userService.deleteUser(userId); 

          setShowConfirmDelete(false);
          
          setToast({ 
              message: 'Xóa người dùng thành công',
              type: 'success', 
              isVisible: true 
          });
          

          setTimeout(() => {
              router.push(currentRole === 'ADMIN' ? '/admin/users' : '/users/list');
          }, 1500); 

      } catch (error: any) {
          setToast({ message: error.message || 'Lỗi khi xóa người dùng', type: 'error', isVisible: true });
      } finally {
          setIsDeleting(false);
      }
  };

  if (isFetching) {
      return (
        <div className="p-8 flex items-center justify-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#253A8C]"></div>
        </div>
      );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">

      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />

      <ConfirmModal 
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Xóa người dùng?"
        message="Hành động này sẽ xóa người dùng khỏi hệ thống. Bạn có chắc chắn muốn tiếp tục?"
        confirmText="Vẫn xóa"
        cancelText="Hủy bỏ"
        variant="danger"
        isLoading={isDeleting}
      />
      
      <PageHeader 
        breadcrumb={
          <>
             Quản lí người dùng <span className="mx-1">{'>'}</span> 
             <span className="text-gray-500">Thông tin người dùng</span> <span className="mx-1">{'>'}</span> 
             <span className="text-gray-900 font-medium">Cập nhật thông tin</span>
          </>
        }
        backUrl={backUrl}
        title="Cập nhật thông tin người dùng"
        description="Chỉnh sửa thông tin cơ bản, vai trò và trạng thái."
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
        <form onSubmit={handleSubmit} className="space-y-8">
            
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6">Thông tin chi tiết</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                     <FormInput 
                        label="Họ" 
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        required
                        error={errors.lastName}
                      />
                      <FormInput 
                        label="Tên" 
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        required
                        error={errors.firstName}
                      />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <FormInput 
                        id="email-input"
                        label="Email" 
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                        error={errors.email}
                    />
                     <FormInput 
                        label="Số điện thoại" 
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => handleChange('phoneNumber', e.target.value)}
                        error={errors.phoneNumber}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormDate 
                        label="Ngày sinh" 
                        value={formData.dateOfBirth}
                        onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                        error={errors.dateOfBirth}
                    />
                </div>
            </div>

            <hr className="border-gray-100" />

            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6">Vai trò và Trạng thái</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormSelect 
                        label="Vai trò" 
                        options={roleOptions} 
                        value={formData.role}
                        onChange={(e) => handleChange('role', e.target.value)}
                        required
                        error={errors.role}
                    />
                    
                    <FormSelect 
                        label="Trạng thái tài khoản" 
                        options={statusOptions} 
                        value={formData.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                    />
                </div>
            </div>

            {/* BUTTONS */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-8">
                
                <button 
                    type="button" 
                    onClick={() => setShowConfirmDelete(true)}
                    disabled={isDeleting || isLoading}
                    className="px-4 py-2.5 rounded-lg border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors bg-white flex items-center gap-2 disabled:opacity-50"
                >
                    {isDeleting && <span className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>}
                    Xóa người dùng
                </button>

                <div className="flex gap-4">
                    <Link href={backUrl}>
                        <button type="button" className="px-6 py-2.5 rounded-lg text-gray-500 font-medium hover:text-gray-700 transition-colors">
                            Hủy
                        </button>
                    </Link>
                    <button 
                        type="submit" 
                        disabled={isLoading || isDeleting}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#253A8C] text-white font-medium hover:bg-[#1e2e70] transition-colors shadow-sm disabled:opacity-70"
                    >
                         {isLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                        <span>Lưu thay đổi</span>
                    </button>
                </div>
            </div>

        </form>
      </div>
      
      <div className="max-w-4xl mx-auto bg-red-50 rounded-xl p-6 border border-red-100">
        <h3 className="text-red-700 font-bold text-sm mb-1">Lưu ý</h3>
        <p className="text-red-600 text-sm">
            Khi đã xóa người dùng, bạn sẽ không thể khôi phục lại dữ liệu này.
        </p>
      </div>

    </div>
  );
}