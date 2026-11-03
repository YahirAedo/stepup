import { describe, it, expect } from 'vitest';
import { buildAiDescription } from './buildAiDescription';

describe('buildAiDescription', () => {
  it('sin nada → undefined', () => {
    expect(buildAiDescription('', [])).toBeUndefined();
    expect(buildAiDescription('  ', [])).toBeUndefined();
  });

  it('solo notas', () => {
    expect(buildAiDescription('Nota', [])).toBe('Nota');
  });

  it('solo pasos existentes', () => {
    const desc = buildAiDescription('', ['Paso A', 'Paso B']);
    expect(desc).toContain('Paso A');
    expect(desc).toContain('Paso B');
    expect(desc).toContain('Pasos que la tarea ya tiene');
  });

  it('notas + pasos existentes', () => {
    const desc = buildAiDescription('Nota', ['Paso A']);
    expect(desc).toBe('Nota Pasos que la tarea ya tiene (no repetirlos): Paso A.');
  });

  it('propuestos sin duplicados en existentes', () => {
    const desc = buildAiDescription('', ['Paso A'], 900, ['Paso B', 'Paso C']);
    expect(desc).toContain('Paso B');
    expect(desc).toContain('Paso C');
    expect(desc).toContain('Pasos ya propuestos antes');
  });

  it('propuestos que ya están en existentes se filtran', () => {
    const desc = buildAiDescription('', ['Paso A'], 900, ['Paso A', 'Paso B']);
    expect(desc).toContain('Paso B');
    const matches = (desc || '').match(/Paso A/g);
    expect(matches?.length).toBe(1);
  });

  it('duplicados entre propuestos', () => {
    const desc = buildAiDescription('', [], 900, ['Paso A', 'paso a', 'Paso A']);
    expect(desc).toContain('Paso A');
    const matches = (desc || '').match(/Paso A/g);
    expect(matches?.length).toBe(1);
  });

  it('recorte de propuestos: saca los más viejos cuando no cabe', () => {
    const desc = buildAiDescription('', [], 30, ['P1', 'P2', 'P3', 'P4', 'P5']);
    expect(desc).toBeDefined();
    expect(desc!.length).toBeLessThanOrEqual(30);
    // P1 debe haberse recortado porque es el más viejo
    expect(desc).not.toContain('P1');
  });

  it('prioridad notas > existentes > propuestos', () => {
    const desc = buildAiDescription('Nota', ['E1', 'E2'], 40, ['P1', 'P2']);
    expect(desc!.length).toBeLessThanOrEqual(40);
    // Debe incluir notas y posiblemente existentes, no propuestos si no caben
  });

  it('tope exacto', () => {
    const desc = buildAiDescription('ABC', ['X'], 25);
    expect(desc!.length).toBeLessThanOrEqual(25);
  });

  it('nombres con espacios sobrantes (trim)', () => {
    const desc = buildAiDescription('', ['  Paso A  '], 900, ['  Paso B  ']);
    expect(desc).toContain('Paso A');
    expect(desc).toContain('Paso B');
  });

  it('default maxLength es 900', () => {
    const notes = 'Nota'.repeat(200); // ~800 chars
    const desc = buildAiDescription(notes, []);
    expect(desc!.length).toBeLessThanOrEqual(900);
  });

  it('nunca supera maxLength', () => {
    const desc = buildAiDescription('X'.repeat(500), ['Y'.repeat(500)], 900, ['Z'.repeat(500)]);
    expect(desc!.length).toBeLessThanOrEqual(900);
  });
});
