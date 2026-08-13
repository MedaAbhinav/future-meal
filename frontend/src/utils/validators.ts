export const validators = {
  email: (value: string): string | undefined => {
    if (!value) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Enter a valid email address';
    return undefined;
  },

  password: (value: string): string | undefined => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
    if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
    return undefined;
  },

  phone: (value: string): string | undefined => {
    if (!value) return 'Phone number is required';
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      return 'Enter a valid 10-digit Indian mobile number';
    }
    return undefined;
  },

  name: (value: string): string | undefined => {
    if (!value) return 'Name is required';
    if (value.trim().length < 2) return 'Name must be at least 2 characters';
    if (value.trim().length > 100) return 'Name must be less than 100 characters';
    return undefined;
  },

  pincode: (value: string): string | undefined => {
    if (!value) return 'Pincode is required';
    if (!/^\d{6}$/.test(value)) return 'Enter a valid 6-digit pincode';
    return undefined;
  },

  required: (value: string, fieldName = 'This field'): string | undefined => {
    if (!value || !value.trim()) return `${fieldName} is required`;
    return undefined;
  },

  minLength: (value: string, min: number, fieldName = 'This field'): string | undefined => {
    if (value && value.length < min) return `${fieldName} must be at least ${min} characters`;
    return undefined;
  },

  maxLength: (value: string, max: number, fieldName = 'This field'): string | undefined => {
    if (value && value.length > max) return `${fieldName} must be less than ${max} characters`;
    return undefined;
  },

  positiveNumber: (value: number, fieldName = 'Value'): string | undefined => {
    if (!value && value !== 0) return `${fieldName} is required`;
    if (value < 0) return `${fieldName} must be positive`;
    return undefined;
  },
};
