export type LoginValidation = null | 'empty';

export function validateLogin(email: string, password: string): LoginValidation {
  if (email.trim() === '' || password === '') return 'empty';
  return null;
}
