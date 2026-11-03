export interface DraftStep {
  key: string;
  id: number | null;
  name: string;
  duration_min: number | null;
  status: 'pending' | 'completed';
}
