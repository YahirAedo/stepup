import { describe, it, expect } from 'vitest';
import { mergeUnlocked } from './mergeUnlocked';

describe('mergeUnlocked', () => {
  it('une sin repetidos y conserva el orden del catálogo', () => {
    expect(mergeUnlocked(['diez-pasos'], ['primer-paso', 'diez-pasos'])).toEqual(['primer-paso', 'diez-pasos']);
  });

  it('ignora ids que no están en el catálogo', () => {
    expect(mergeUnlocked(['no-existe', 'primer-paso'], ['tampoco'])).toEqual(['primer-paso']);
  });

  it('devuelve vacío si no hay ids válidos', () => {
    expect(mergeUnlocked([], [])).toEqual([]);
  });
});
