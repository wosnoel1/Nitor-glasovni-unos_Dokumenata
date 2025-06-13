import type { ValidationRule } from '@/types/form';
import { validateDateFormat } from '@/utils/dateParser';

export const nameValidation: ValidationRule = (value: string) => {
  if (!value) {
    return { isValid: false, message: 'Ime je obavezno' };
  }
  
  const trimmed = value.trim();
  if (trimmed.length < 2) {
    return { isValid: false, message: 'Ime mora imati najmanje 2 znaka' };
  }
  if (!/^[a-zA-ZšđčćžŠĐČĆŽ\s]+$/.test(trimmed)) {
    return { isValid: false, message: 'Ime može sadržavati samo slova' };
  }
  return { isValid: true };
};

export const oibValidation: ValidationRule = (value: string) => {
  if (!value) {
    return { isValid: false, message: 'OIB je obavezan' };
  }

  // Simple validation: only numbers, exactly 11 digits
  const isValidOIB = /^\d{11}$/.test(value);
  
  if (!isValidOIB) {
    return { isValid: false, message: 'OIB mora imati točno 11 brojeva' };
  }
  
  return { isValid: true };
};

export const emailValidation: ValidationRule = (value: string) => {
  if (!value) {
    return { isValid: false, message: 'Email je obavezan' };
  }
  
  const trimmed = value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, message: 'Neispravna email adresa' };
  }
  
  return { isValid: true };
};

export const phoneValidation: ValidationRule = (value: string) => {
  if (!value) {
    return { isValid: false, message: 'Broj mobitela je obavezan' };
  }
  
  const trimmed = value.trim();
  // Croatian mobile number format: +385 or 0 followed by 9 digits
  const phoneRegex = /^(\+385|0)[0-9]{8,9}$/;
  
  if (!phoneRegex.test(trimmed.replace(/\s/g, ''))) {
    return { isValid: false, message: 'Neispravni format broja mobitela (npr. +385912345678 ili 0912345678)' };
  }
  
  return { isValid: true };
};

export const workExperienceValidation: ValidationRule = (value: string) => {
  if (!value) {
    return { isValid: false, message: 'Radni staž je obavezan' };
  }
  
  const trimmed = value.trim();
  const years = parseFloat(trimmed);
  
  if (isNaN(years) || years < 0 || years > 50) {
    return { isValid: false, message: 'Radni staž mora biti broj između 0 i 50 godina' };
  }
  
  return { isValid: true };
};

export const numberValidation: ValidationRule = (value: string) => {
  if (!value) {
    return { isValid: false, message: 'Ovo polje je obavezno' };
  }
  
  const trimmed = value.trim();
  const number = parseInt(trimmed);
  
  if (isNaN(number) || number < 0) {
    return { isValid: false, message: 'Mora biti pozitivni broj' };
  }
  
  return { isValid: true };
};

export const basicTextValidation: ValidationRule = (value: string) => {
  if (!value) {
    return { isValid: false, message: 'Ovo polje je obavezno' };
  }
  
  const trimmed = value.trim();
  if (trimmed.length < 1) {
    return { isValid: false, message: 'Ovo polje je obavezno' };
  }
  return { isValid: true };
};

export const optionalTextValidation: ValidationRule = (value: string) => {
  // Optional field - always valid
  return { isValid: true };
};

export const dropdownValidation: ValidationRule = (value: string) => {
  if (!value || value === '' || value === 'default-placeholder') {
    return { isValid: false, message: 'Molimo odaberite opciju' };
  }
  
  return { isValid: true };
};

// Enhanced date validation using the new date parser
export const dateValidation: ValidationRule = (value: string) => {
  return validateDateFormat(value);
};