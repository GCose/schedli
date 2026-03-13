import { ButtonProps, Size, Variant } from "@/types";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:opacity-90",
  outline: "border border-primary text-primary hover:opacity-80",
  ghost: "text-text hover:bg-background-soft",
  danger: "bg-red-500 text-white hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-small",
  md: "px-5 py-3 text-body",
  lg: "px-6 py-3.5 text-body",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        cursor-pointer inline-flex items-center justify-center font-semibold rounded-xl
        transition-opacity disabled:opacity-60 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
