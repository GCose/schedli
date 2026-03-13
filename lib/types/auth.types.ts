export interface RegisterInput {
    fullName: string;
    email: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface ForgotPasswordInput {
    email: string;
}

export interface ResetPasswordInput {
    token: string;
    password: string;
}

export interface VerifyEmailInput {
    token: string;
}

export interface JWTPayload {
    userId: string;
    role: "personal" | "enterprise";
}

export interface LoginServiceResult {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        fullName: string;
        email: string;
        role: "personal" | "enterprise";
        isEmailVerified: boolean;
    };
}