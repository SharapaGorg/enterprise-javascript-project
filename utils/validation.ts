import { VALIDATION, ERROR_MESSAGES } from '~/constants';

/**
 * Валидация email адреса
 */
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email) {
    return { valid: false, error: 'Email обязателен' };
  }

  if (!VALIDATION.EMAIL_REGEX.test(email)) {
    return { valid: false, error: 'Неверный формат email' };
  }

  return { valid: true };
};

/**
 * Валидация пароля
 */
export const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (!password) {
    return { valid: false, error: 'Пароль обязателен' };
  }

  if (password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
    return { valid: false, error: ERROR_MESSAGES.AUTH.PASSWORD_TOO_SHORT };
  }

  return { valid: true };
};

/**
 * Проверка совпадения паролей
 */
export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): { valid: boolean; error?: string } => {
  if (password !== confirmPassword) {
    return { valid: false, error: ERROR_MESSAGES.AUTH.PASSWORDS_DONT_MATCH };
  }

  return { valid: true };
};

/**
 * Валидация учетных данных для входа
 */
export const validateLoginCredentials = (
  email: string,
  password: string
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid && emailValidation.error) {
    errors.push(emailValidation.error);
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid && passwordValidation.error) {
    errors.push(passwordValidation.error);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Валидация учетных данных для регистрации
 */
export const validateRegisterCredentials = (
  email: string,
  password: string,
  confirmPassword: string
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid && emailValidation.error) {
    errors.push(emailValidation.error);
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid && passwordValidation.error) {
    errors.push(passwordValidation.error);
  }

  const matchValidation = validatePasswordMatch(password, confirmPassword);
  if (!matchValidation.valid && matchValidation.error) {
    errors.push(matchValidation.error);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

