export interface Task {
  id: number;
  name: string;
  description: string | null;
  due_date: string | null;
  status: 'active' | 'completed';
  created_at: string;
  completed_at: string | null;
  server_id: string | null;
  dirty: number;
  updated_at: string;
}

export interface Step {
  id: number;
  task_id: number;
  name: string;
  duration_min: number | null;
  order_index: number;
  status: 'pending' | 'completed';
  completed_at: string | null;
  completed_date: string | null;
  server_id: string | null;
  dirty: number;
  updated_at: string;
}

export interface DailyProgress {
  id: number;
  date: string;
  steps_completed: number;
}

export interface SyncMeta {
  id: number;
  last_sync_at: string | null;
}

export interface CreateTaskInput {
  name: string;
  description?: string | null;
  due_date?: string | null;
}

export interface UpdateTaskInput {
  name?: string;
  description?: string | null;
  due_date?: string | null;
}

export interface CreateStepInput {
  task_id: number;
  name: string;
  duration_min?: number | null;
}

export interface UpdateStepInput {
  name?: string;
  duration_min?: number | null;
}

// IA — sugerencia de pasos (issue #154/#155). Contrato del endpoint
// POST /api/ai/suggest-steps. La duración siempre llega entre 5 y 25 min (Pomodoro).
export interface SuggestedStep {
  name: string;
  duration_min: number;
}

// IA — asistente de descripción (issue #154/#155). Contrato de POST /api/ai/describe-help.
export interface DescriptionSection {
  title: string;
  guiding_question: string;
}
