interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    tokenType?: string;
    expiresIn?: number;
    user: {
        id: string;
        email: string;
        fullName: string;
        role: string;
        avatarUrl?: string;
    };
}

export interface VerifyOtpResponse {
    resetToken: string;       
    expiresInSeconds: number;
    email: string;
}

export interface ResetPasswordRequest {
    resetToken: string; 
    newPassword: string;
    confirmPassword: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;   
    newPassword: string;     
    confirmPassword: string; 
    logoutOtherDevices?: boolean;
}

export const authService = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
        
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok || data.success === false) {
                throw new Error(data.message || 'Đăng nhập thất bại');
            }

            return data.data;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Lỗi kết nối Server');
        }
    },

    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('currentUser');
        }
    },

    forgotPassword: async (email: string): Promise<string> => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
        
        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }), 
            });

            const data = await res.json();
            
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Gửi yêu cầu thất bại');
            }
            
            return data.message; 

        } catch (error: any) {
            throw new Error(error.message || 'Lỗi kết nối Server');
        }
    },

    verifyOtp: async (email: string, otpCode: string) => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
        try {
            const res = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpCode }),
            });

            const data = await res.json();
            
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Mã OTP không chính xác.');
            }
            
            return data.data; 
        } catch (error: any) {
            throw new Error(error.message || 'Lỗi kết nối Server');
        }
    },

    resetPassword: async (payload: ResetPasswordRequest) => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
        try {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload), 
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Đặt lại mật khẩu thất bại.');
            }
            return data;
        } catch (error: any) {
            throw new Error(error.message || 'Lỗi kết nối Server');
        }
    },

    changePassword: async (payload: ChangePasswordRequest) => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
        
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

        try {
            const res = await fetch(`${API_URL}/auth/change-password`, { 
                method: 'POST', 
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload), 
            });

            const data = await res.json();
            
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Đổi mật khẩu thất bại.');
            }
            return data;
        } catch (error: any) {
            throw new Error(error.message || 'Lỗi kết nối Server');
        }
    },

    refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
        try {
            const res = await fetch(`${API_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refreshToken: refreshToken
                })
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Phiên đăng nhập hết hạn');
            }

            return data.data;
        } catch (error: any) {
            throw new Error(error.message || 'Lỗi kết nối Server');
        }
    }
};