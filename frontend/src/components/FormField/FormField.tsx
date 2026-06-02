import React from 'react';
import './FormField.css';

export interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  children,
  className = '',
}) => {
  return (
    <div className={`ds-form-field ${error ? 'ds-form-field--error' : ''} ${className}`}>
      <label className="ds-form-field__label">
        {label} {required && <span className="ds-form-field__required">*</span>}
      </label>
      <div className="ds-form-field__control">
        {children}
      </div>
      {error && <span className="ds-form-field__error-msg">{error}</span>}
    </div>
  );
};

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', hasError, disabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`ds-input ${hasError ? 'ds-input--error' : ''} ${className}`}
        disabled={disabled}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', hasError, disabled, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`ds-input ds-textarea ${hasError ? 'ds-input--error' : ''} ${className}`}
        disabled={disabled}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
  options: { label: string; value: string | number }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', hasError, disabled, options, ...props }, ref) => {
    return (
      <div className="ds-select-wrapper">
        <select
          ref={ref}
          className={`ds-input ds-select ${hasError ? 'ds-input--error' : ''} ${className}`}
          disabled={disabled}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="ds-select-icon">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    );
  }
);
Select.displayName = 'Select';
