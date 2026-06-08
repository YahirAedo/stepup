export interface Task {
  id: number;
  name: string;
  due_date: string | null;
  status: 'active' | 'completed';
  created_at: string;
  completed_at: string | null;
}

export interface Step {
  id: number;
  task_id: number;
  name: string;
  duration_min: number | null;
  order_index: number;
  status: 'pending' | 'completed';
  completed_at: string | null;
}

export interface DailyProgress {
  id: number;
  date: string;
  steps_completed: number;
}

export interface CreateTaskInput {
  name: string;
  due_date?: string | null;
}

export interface UpdateTaskInput {
  name?: string;
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