"use client";

interface FormTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}

export default function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  required = false,
}: FormTextareaProps) {
  return (
    <div>
      <label className="block text-sm font-bold text-text mb-2">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 border-2 border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none text-text font-medium bg-background-surface"
        required={required}
      />
    </div>
  );
}
