import { stepCountLabel } from '../../../utils/microplan';
import type { Task, Step } from '../../../types';

export interface CompletedSummary {
  taskName: string;
  stepsCompleted: number;
  totalMinutes: number;
  stepsLabel: string;
}

/**
 * Resumen para la pantalla "Tarea completada".
 *
 * Solo cuentan los pasos con status 'completed'. La duración null se
 * trata como 0. La etiqueta de pasos reutiliza `stepCountLabel` de
 * `src/utils/microplan`.
 */
export function buildCompletedSummary(
  task: Task,
  steps: ReadonlyArray<Step>,
): CompletedSummary {
  const completed = steps.filter((step) => step.status === 'completed');
  const stepsCompleted = completed.length;
  const totalMinutes = completed.reduce(
    (sum, step) => sum + (step.duration_min ?? 0),
    0,
  );
  return {
    taskName: task.name,
    stepsCompleted,
    totalMinutes,
    stepsLabel: stepCountLabel(stepsCompleted),
  };
}
