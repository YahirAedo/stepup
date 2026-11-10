import { countActiveDays } from '../../../utils/profileActivity';

export interface BuildProfileMetricsInput {
  completedDates: string[];
  stepsTotal: number;
}

export interface ProfileMetrics {
  activeDaysWeek: number;
  activeDaysMonth: number;
  stepsTotal: number;
}

export function buildProfileMetrics(
  input: BuildProfileMetricsInput,
  now: Date,
): ProfileMetrics {
  return {
    activeDaysWeek: countActiveDays(input.completedDates, 7, now),
    activeDaysMonth: countActiveDays(input.completedDates, 30, now),
    stepsTotal: input.stepsTotal,
  };
}
