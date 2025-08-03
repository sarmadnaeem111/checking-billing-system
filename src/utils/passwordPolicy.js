/**
 * Password policy utility for enforcing strong passwords
 */

// Password requirements
const MIN_LENGTH = 8;
const REQUIRES_UPPERCASE = true;
const REQUIRES_LOWERCASE = true;
const REQUIRES_NUMBER = true;
const REQUIRES_SPECIAL = true;
const SPECIAL_CHARS = '!@#$%^&*()_+={}[]|:;<>,.?/~`-';

/**
 * Validates a password against the defined password policy
 * @param {string} password - The password to validate
 * @returns {Object} - Object containing validation result and error message
 */
export const validatePassword = (password) => {
  // Check if password exists
  if (!password) {
    return {
      isValid: false,
      message: 'Password is required'
    };
  }

  // Check minimum length
  if (password.length < MIN_LENGTH) {
    return {
      isValid: false,
      message: `Password must be at least ${MIN_LENGTH} characters long`
    };
  }

  // Check for uppercase letters
  if (REQUIRES_UPPERCASE && !/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }

  // Check for lowercase letters
  if (REQUIRES_LOWERCASE && !/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }

  // Check for numbers
  if (REQUIRES_NUMBER && !/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number'
    };
  }

  // Check for special characters
  // eslint-disable-next-line no-useless-escape
  if (REQUIRES_SPECIAL && !new RegExp(`[${SPECIAL_CHARS.replace(/[\[\]\-]/g, '$&')}]`).test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character'
    };
  }

  // Password meets all requirements
  return {
    isValid: true,
    message: 'Password meets all requirements'
  };
};

/**
 * Calculates password strength score (0-100)
 * @param {string} password - The password to evaluate
 * @returns {number} - Strength score from 0 (weakest) to 100 (strongest)
 */
export const calculatePasswordStrength = (password) => {
  if (!password) return 0;
  
  let score = 0;
  
  // Length contribution (up to 40 points)
  score += Math.min(40, password.length * 4);
  
  // Character variety contribution
  if (/[A-Z]/.test(password)) score += 10; // Uppercase
  if (/[a-z]/.test(password)) score += 10; // Lowercase
  if (/[0-9]/.test(password)) score += 10; // Numbers
  // eslint-disable-next-line no-useless-escape
  if (new RegExp(`[${SPECIAL_CHARS.replace(/[\[\]\-]/g, '$&')}]`).test(password)) score += 15; // Special chars
  
  // Variety of character types
  const charTypes = [
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    // eslint-disable-next-line no-useless-escape
    new RegExp(`[${SPECIAL_CHARS.replace(/[\[\]\-]/g, '$&')}]`).test(password)
  ].filter(Boolean).length;
  
  score += charTypes * 5;
  
  // Cap at 100
  return Math.min(100, score);
};

/**
 * Gets a descriptive label for password strength
 * @param {number} score - Password strength score (0-100)
 * @returns {Object} - Object containing label and color for UI display
 */
export const getPasswordStrengthLabel = (score) => {
  if (score < 30) {
    return { label: 'Very Weak', color: '#ff4d4d' };
  } else if (score < 50) {
    return { label: 'Weak', color: '#ffa64d' };
  } else if (score < 70) {
    return { label: 'Moderate', color: '#ffff4d' };
  } else if (score < 90) {
    return { label: 'Strong', color: '#4dff4d' };
  } else {
    return { label: 'Very Strong', color: '#4d4dff' };
  }
};