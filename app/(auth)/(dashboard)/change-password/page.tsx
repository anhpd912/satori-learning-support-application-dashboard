import React from 'react';
import { Metadata } from 'next';
import ChangePasswordForm from './components/ChangePasswordForm';

export const metadata: Metadata = {
    title: 'Đổi mật khẩu | JLSA Portal',
    description: 'Cập nhật mật khẩu bảo vệ tài khoản',
};

export default function ChangePasswordPage() {
    return (
        <ChangePasswordForm />
    );
}