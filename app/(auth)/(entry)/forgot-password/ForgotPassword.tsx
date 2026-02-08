'use client';

import React, { useState } from 'react';
import RequestEmailForm from './components/RequestEmailForm';
import VerifyOtpForm from './components/VerifyOtpForm';
import NewPasswordForm from './components/NewPasswordForm';

enum ForgotPasswordStep {
    EMAIL_INPUT = 1,
    OTP_VERIFICATION = 2,
    NEW_PASSWORD = 3
}

export default function ForgotPasswordFlow() {
    const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>(ForgotPasswordStep.EMAIL_INPUT);
    
    const [sharedData, setSharedData] = useState({ email: '', token: '' });

    const handleNextStep = (data: any) => {
        setSharedData(prev => ({ ...prev, ...data }));
        setCurrentStep(prev => prev + 1);
    };

    return (
        <div className="w-full">
            {currentStep === ForgotPasswordStep.EMAIL_INPUT && (
                <RequestEmailForm 
                    onSuccess={(email) => handleNextStep({ email })} 
                />
            )}

            {currentStep === ForgotPasswordStep.OTP_VERIFICATION && (
                <VerifyOtpForm 
                    email={sharedData.email} // Truyền email đã nhập ở B1 xuống để hiển thị/gửi lại mã
                    onVerified={(token) => handleNextStep({ token })} // Nhận token xác thực, chuyển sang B3
                    onBack={() => setCurrentStep(ForgotPasswordStep.EMAIL_INPUT)} // Quay lại B1 nếu muốn sửa email
                />
            )}

            {currentStep === ForgotPasswordStep.NEW_PASSWORD && (
                <NewPasswordForm 
                    token={sharedData.token} // Truyền token xuống để gọi API reset
                />
            )}

        
        </div>
    );
}