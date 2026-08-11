import { apiFetch, ENDPOINTS } from './api';

type ApiProgress = {
  id: number;
  date: string;
  stepsCompleted: number;
};

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function getDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

export const ProgressService = {
  async increment(): Promise<void> {
    // El backend incrementa la métrica al completar un paso (PATCH /api/steps/:id/complete).
  },

  async getToday(): Promise<number> {
    const rows = await apiFetch<ApiProgress[]>(ENDPOINTS.progress.list);
    const row = rows.find((r) => r.date === today());
    return row?.stepsCompleted ?? 0;
  },

  async getWeek(): Promise<{ date: string; count: number }[]> {
    const rows = await apiFetch<ApiProgress[]>(ENDPOINTS.progress.list);
    const map = new Map(rows.map((r) => [r.date, r.stepsCompleted]));
    const days = Array.from({ length: 7 }, (_, i) => getDate(6 - i));
    return days.map((date) => ({ date, count: map.get(date) ?? 0 }));
  },
};
