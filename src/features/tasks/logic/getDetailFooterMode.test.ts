import { describe, it, expect } from 'vitest';
import { getDetailFooterMode } from './getDetailFooterMode';

describe('getDetailFooterMode', () => {
  it('sin pasos → none', () => {
    expect(getDetailFooterMode([])).toBe('none');
  });

  it('todos pendientes → active', () => {
    expect(getDetailFooterMode([{ id: 1, status: 'pending' }])).toBe('active');
    expect(
      getDetailFooterMode([
        { id: 1, status: 'pending' },
        { id: 2, status: 'pending' },
      ]),
    ).toBe('active');
  });

  it('mezcla de pendientes y completados → active', () => {
    expect(
      getDetailFooterMode([
        { id: 1, status: 'completed' },
        { id: 2, status: 'pending' },
      ]),
    ).toBe('active');
  });

  it('todos completados → completed', () => {
    expect(
      getDetailFooterMode([
        { id: 1, status: 'completed' },
        { id: 2, status: 'completed' },
      ]),
    ).toBe('completed');
  });

  it('un solo paso pendiente → active', () => {
    expect(getDetailFooterMode([{ id: 9, status: 'pending' }])).toBe('active');
  });

  it('un solo paso completado → completed', () => {
    expect(getDetailFooterMode([{ id: 9, status: 'completed' }])).toBe(
      'completed',
    );
  });
});
