import { CheckboxProps } from "@/types";

export function Checkbox({
  label,
  id,
  className = "",
  ...props
}: CheckboxProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        id={id}
        className={`w-4 h-4 rounded accent-primary cursor-pointer ${className}`}
        {...props}
      />
      <label htmlFor={id} className="text-small text-text cursor-pointer">
        {label}
      </label>
    </div>
  );
}
