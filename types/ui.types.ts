import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

/**==========================
 * Button Component Types
 ==========================*/
export type Variant = "primary" | "outline" | "ghost" | "danger";
export type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    fullWidth?: boolean;
    loading?: boolean;
}

/**========================
 * Input Component Types
 ========================*/
export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    leftIcon?: ReactNode;
    rightElement?: ReactNode;
    error?: string;
    inputSize?: InputSize;
}

/**===========================
 * Checkbox Component Types
 ===========================*/
export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
}