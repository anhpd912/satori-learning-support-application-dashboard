interface LoginResponse {
    accessToken: string;
    user: {
        id: string;
        email: string;
        fullName: string;
        role: string;
        avatarUrl?: string;
    };
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
            localStorage.removeItem('currentUser');
        }
    }
};