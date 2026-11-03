import { describe, it, expect } from 'vitest';
import { getAiAvailability } from './getAiAvailability';

describe('getAiAvailability', () => {
  it('needs-title tiene prioridad', () => {
    expect(getAiAvailability({ isOnline: true, hasSession: true, title: '  ' })).toBe('needs-title');
    expect(getAiAvailability({ isOnline: false, hasSession: false, title: '' })).toBe('needs-title');
  });

  it('no-session cuando hay título y hay sesión', () => {
    expect(getAiAvailability({ isOnline: true, hasSession: false, title: 'Tarea' })).toBe('no-session');
  });

  it('offline cuando hay título, sesión y sin conexión', () => {
    expect(getAiAvailability({ isOnline: false, hasSession: true, title: 'Tarea' })).toBe('offline');
  });

  it('ok con todo en orden', () => {
    expect(getAiAvailability({ isOnline: true, hasSession: true, title: 'Tarea' })).toBe('ok');
  });
});
