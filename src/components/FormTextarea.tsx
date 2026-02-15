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
      <label className="block text-sm font-semibold text-text mb-2">
        {label} {required && "*"}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 border border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-text"
        required={required}
      />
    </div>
  );
}
