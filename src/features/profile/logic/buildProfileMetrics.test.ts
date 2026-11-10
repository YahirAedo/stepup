import { describe, it, expect } from 'vitest';
import { buildProfileMetrics } from './buildProfileMetrics';

describe('buildProfileMetrics', () => {
  const now = new Date(2026, 9, 15); // 2026-10-15

  it('cuenta dias activos en 7 y 30 y conserva stepsTotal', () => {
    const completedDates = ['2026-10-15', '2026-10-14', '2026-10-09', '2026-09-20'];
    const result = buildProfileMetrics({ completedDates, stepsTotal: 186 }, now);
    expect(result.activeDaysWeek).toBe(3);
    expect(result.activeDaysMonth).toBe(4);
    expect(result.stepsTotal).toBe(186);
  });
});
