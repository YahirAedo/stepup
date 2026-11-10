import { describe, expect, it } from 'vitest';
import { buildFocusQueue } from './buildFocusQueue';

type Step = { id: number; status: 'pending' | 'completed'; order_index: number };

const step = (id: number, status: 'pending' | 'completed', order_index: number): Step => ({
  id,
  status,
  order_index,
});

describe('buildFocusQueue', () => {
  it('ordena por order_index aunque la entrada venga desordenada', () => {
    const steps = [step(3, 'pending', 2), step(1, 'pending', 0), step(2, 'pending', 1)];
    const result = buildFocusQueue(steps, []);
    expect(result.current?.id).toBe(1);
    expect(result.upcoming.map((s) => s.id)).toEqual([2, 3]);
  });

  it('ignora completados', () => {
    const steps = [step(1, 'completed', 0), step(2, 'pending', 1)];
    const result = buildFocusQueue(steps, []);
    expect(result.current?.id).toBe(2);
    expect(result.upcoming).toEqual([]);
  });

  it('sin pospuestos', () => {
    const steps = [step(1, 'pending', 0), step(2, 'pending', 1), step(3, 'pending', 2)];
    const result = buildFocusQueue(steps, []);
    expect(result.current?.id).toBe(1);
    expect(result.upcoming.map((s) => s.id)).toEqual([2, 3]);
  });

  it('uno pospuesto ([A,B,C] posponiendo A => [B,C,A])', () => {
    const steps = [step(1, 'pending', 0), step(2, 'pending', 1), step(3, 'pending', 2)];
    const result = buildFocusQueue(steps, [1]);
    expect(result.current?.id).toBe(2);
    expect(result.upcoming.map((s) => s.id)).toEqual([3, 1]);
  });

  it('dos pospuestos respetan el orden de posposición ([A,B,C] con [A,B] => [C,A,B])', () => {
    const steps = [step(1, 'pending', 0), step(2, 'pending', 1), step(3, 'pending', 2)];
    const result = buildFocusQueue(steps, [1, 2]);
    expect(result.current?.id).toBe(3);
    expect(result.upcoming.map((s) => s.id)).toEqual([1, 2]);
  });

  it('ids obsoletos ignorados', () => {
    const steps = [step(1, 'pending', 0), step(2, 'pending', 1)];
    const result = buildFocusQueue(steps, [999, 1, 888]);
    expect(result.current?.id).toBe(2);
    expect(result.upcoming.map((s) => s.id)).toEqual([1]);
  });

  it('un solo pendiente => upcoming vacío', () => {
    const steps = [step(1, 'pending', 0), step(2, 'completed', 1)];
    const result = buildFocusQueue(steps, []);
    expect(result.current?.id).toBe(1);
    expect(result.upcoming).toEqual([]);
  });

  it('sin pendientes => current null y upcoming vacío', () => {
    const steps = [step(1, 'completed', 0), step(2, 'completed', 1)];
    const result = buildFocusQueue(steps, []);
    expect(result.current).toBeNull();
    expect(result.upcoming).toEqual([]);
  });

  it('no muta la entrada', () => {
    const steps = [step(3, 'pending', 2), step(1, 'pending', 0), step(2, 'pending', 1)];
    const snapshot = steps.map((s) => ({ ...s }));
    buildFocusQueue(steps, [1]);
    expect(steps).toEqual(snapshot);
  });
});
