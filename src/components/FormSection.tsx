import React, { useRef } from 'react';
import { VoiceInput } from './VoiceInput';
import { VoiceDropdown } from './VoiceDropdown';
import type { ValidationRule } from '@/types/form';

interface DropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface FormField {
  key: string;
  label: string;
  placeholder: string;
  validation?: ValidationRule;
  fieldType?: 'text' | 'oib' | 'number' | 'email' | 'dropdown' | 'date' | 'phone';
  options?: DropdownOption[];
}

interface FormSectionProps {
  title?: string;
  fields: FormField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  disabled?: boolean;
}

export function FormSection({ title, fields, values, onChange, disabled = false }: FormSectionProps) {
  const fieldRefs = useRef<Record<string, React.RefObject<HTMLInputElement>>>({});
  
  // Initialize refs for all fields
  fields.forEach(field => {
    if (!fieldRefs.current[field.key]) {
      fieldRefs.current[field.key] = React.createRef<HTMLInputElement>();
    }
  });

  const handleValidationComplete = (currentFieldKey: string) => {
    if (disabled) return;
    
    // Find the index of the current field
    const currentIndex = fields.findIndex(field => field.key === currentFieldKey);
    
    // Move to the next field if it exists
    if (currentIndex !== -1 && currentIndex < fields.length - 1) {
      const nextField = fields[currentIndex + 1];
      
      // Focus the next field after a short delay
      setTimeout(() => {
        const nextFieldElement = document.querySelector(`input[data-field-key="${nextField.key}"], button[data-field-key="${nextField.key}"]`) as HTMLInputElement | HTMLButtonElement;
        if (nextFieldElement) {
          nextFieldElement.focus();
        }
      }, 100);
    }
  };

  return (
    <div className="space-y-4">
      {title && (
        <h2 className="text-lg font-semibold text-gray-800 mb-6">{title}</h2>
      )}
      
      {fields.map((field, index) => (
        <div key={field.key} className="relative">
          {field.fieldType === 'dropdown' ? (
            <VoiceDropdown
              label={field.label}
              placeholder={field.placeholder}
              value={values[field.key] || ''}
              onChange={(value) => !disabled && onChange(field.key, value)}
              options={field.options || []}
              validate={field.validation}
              onValidationComplete={() => handleValidationComplete(field.key)}
              autoFocus={index === 0 && !disabled}
              disabled={disabled}
            />
          ) : (
            <VoiceInput
              label={field.label}
              placeholder={field.placeholder}
              value={values[field.key] || ''}
              onChange={(value) => !disabled && onChange(field.key, value)}
              validate={field.validation}
              fieldType={field.fieldType}
              onValidationComplete={() => handleValidationComplete(field.key)}
              autoFocus={index === 0 && !disabled}
              disabled={disabled}
            />
          )}
          {/* Hidden data attribute for field identification */}
          <input
            type="hidden"
            data-field-key={field.key}
            ref={fieldRefs.current[field.key]}
          />
        </div>
      ))}
    </div>
  );
}