import React from 'react';
import { Metadata } from 'next';
import ForgotPasswordFlow from './ForgotPassword';

export const metadata: Metadata = {
    title: 'Quên mật khẩu | Satori Management',
    description: 'Khôi phục mật khẩu tài khoản',
};

export default function ForgotPasswordPage() {
    return (
        <ForgotPasswordFlow />
    );
}