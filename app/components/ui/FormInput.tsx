import React from 'react';

interface FormInputProps {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'textarea';
  className?: string;
  error?: string;
  disabled?: boolean;
  rows?: number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function FormInput({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = 'text',
  className = '',
  error,
  disabled = false,
  rows = 3,
  onKeyDown,
}: FormInputProps) {
  const baseInputClasses =
    'w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed';

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={baseInputClasses}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={baseInputClasses}
        />
      )}

      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
