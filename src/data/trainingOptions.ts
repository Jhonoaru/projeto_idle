import type { TrainingType } from "../shared/types";

export interface TrainingOption {
  id: string;
  type: TrainingType;
  durationMinutes: number;
  cost: number;
  label: string;
}

export const trainingOptions: TrainingOption[] = [
  { id: "offline-30", type: "offline", durationMinutes: 30, cost: 0, label: "Offline Training 30 min" },
  { id: "offline-60", type: "offline", durationMinutes: 60, cost: 0, label: "Offline Training 1h" },
  { id: "offline-240", type: "offline", durationMinutes: 240, cost: 0, label: "Offline Training 4h" },
  { id: "offline-480", type: "offline", durationMinutes: 480, cost: 0, label: "Offline Training 8h" },
  { id: "exercise-15", type: "exercise", durationMinutes: 15, cost: 2_000, label: "Exercise Training 15 min" },
  { id: "exercise-30", type: "exercise", durationMinutes: 30, cost: 4_000, label: "Exercise Training 30 min" },
  { id: "exercise-60", type: "exercise", durationMinutes: 60, cost: 8_000, label: "Exercise Training 1h" },
];
