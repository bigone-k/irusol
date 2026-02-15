"use client";

interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "number";
  autoFocus?: boolean;
}

export default function FormInput({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  autoFocus = false,
}: FormInputProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-text mb-2">
        {label} {required && "*"}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text"
        required={required}
        autoFocus={autoFocus}
      />
    </div>
  );
}
