import { InputSize, InputProps } from "@/types";

const sizes: Record<InputSize, string> = {
  sm: "px-3 py-2 text-small",
  md: "px-4 py-3 text-body",
  lg: "px-4 py-4 text-body",
};

export function Input({
  label,
  leftIcon,
  rightElement,
  error,
  inputSize = "md",
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {/*==================== Label ====================*/}
      {label && (
        <label className="text-small font-medium text-heading">{label}</label>
      )}
      {/*==================== End of Label ====================*/}

      {/*==================== Input Wrapper ====================*/}
      <div
        className={`
          flex items-center gap-3 rounded-lg bg-input transition-colors
          ${error ? "border-red-500" : "border-transparent focus-within:bg-primary/10 dark:focus-within:bg-primary/50"}
          ${sizes[inputSize]}
        `}
      >
        {/*==================== Left Icon ====================*/}
        {leftIcon && <span className="text-icon shrink-0">{leftIcon}</span>}
        {/*==================== End of Left Icon ====================*/}

        <input
          className={`
            flex-1 bg-transparent text-heading placeholder:text-placeholder outline-none
            ${className}
          `.trim()}
          {...props}
        />

        {/*==================== Right Element ====================*/}
        {rightElement && (
          <span className="text-icon shrink-0">{rightElement}</span>
        )}
        {/*==================== End of Right Element ====================*/}
      </div>
      {/*==================== End of Input Wrapper ====================*/}

      {/*==================== Error Message ====================*/}
      {error && <p className="text-small text-red-500">{error}</p>}
      {/*==================== End of Error Message ====================*/}
    </div>
  );
}
