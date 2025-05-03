/**
 * Validation utility functions for forms
 */

/**
 * Validates a password
 * @param {string} password - The password to validate
 * @returns {Object} - Object with isValid boolean and error message if invalid
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters long" };
  }
  
  // Optional: Add more complex validation rules here
  // For example, check for uppercase, lowercase, numbers, special characters
  
  return { isValid: true, error: null };
};

/**
 * Validates password confirmation matches password
 * @param {string} password - The password
 * @param {string} confirmPassword - The confirmation password
 * @returns {Object} - Object with isValid boolean and error message if invalid
 */
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, error: "Please confirm your password" };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match" };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validates an email address
 * @param {string} email - The email to validate
 * @returns {Object} - Object with isValid boolean and error message if invalid 
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, error: "Email is required" };
  }
  
  // Simple regex for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  
  return { isValid: true, error: null };
}; 