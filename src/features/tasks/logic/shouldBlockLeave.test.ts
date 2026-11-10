import { describe, it, expect } from 'vitest';
import { shouldBlockLeave } from './shouldBlockLeave';

describe('shouldBlockLeave', () => {
  it('bloquea con hasUnsaved true y el resto en false', () => {
    expect(shouldBlockLeave({ hasUnsaved: true, skipGuard: false, isSaving: false, isDeleting: false })).toBe(true);
  });

  it('no bloquea con skipGuard true', () => {
    expect(shouldBlockLeave({ hasUnsaved: true, skipGuard: true, isSaving: false, isDeleting: false })).toBe(false);
  });

  it('no bloquea con isSaving true', () => {
    expect(shouldBlockLeave({ hasUnsaved: true, skipGuard: false, isSaving: true, isDeleting: false })).toBe(false);
  });

  it('no bloquea con isDeleting true', () => {
    expect(shouldBlockLeave({ hasUnsaved: true, skipGuard: false, isSaving: false, isDeleting: true })).toBe(false);
  });

  it('no bloquea sin cambios', () => {
    expect(shouldBlockLeave({ hasUnsaved: false, skipGuard: false, isSaving: false, isDeleting: false })).toBe(false);
  });
});
