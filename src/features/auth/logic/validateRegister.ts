export type RegisterValidation = null | 'empty' | 'short' | 'long';

export function validateRegister(name: string, email: string, password: string): RegisterValidation {
  if (name.trim() === '' || email.trim() === '' || password === '') return 'empty';
  if (password.length < 8) return 'short';
  if (new TextEncoder().encode(password).length > 72) return 'long';
  return null;
}
