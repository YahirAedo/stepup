/**
 * Estado efímero de la sesión de foco, en memoria.
 *
 * No persiste: no usa AsyncStorage ni SQLite. Vive solo mientras la app está
 * abierta; al cerrarla se pierde. Los pospuestos y la tarea manual viven acá.
 */
import { postponeStep } from '../logic/postponeStep';

let manualTaskId: number | null = null;
let postponedIds: number[] = [];

export function getManualTaskId(): number | null {
  return manualTaskId;
}

export function setManualTaskId(id: number | null): void {
  manualTaskId = id;
}

export function getPostponedIds(): number[] {
  return [...postponedIds];
}

export function postponeInSession(stepId: number): void {
  postponedIds = postponeStep(postponedIds, stepId);
}

export function clearPostponed(): void {
  postponedIds = [];
}

export function resetFocusSession(): void {
  manualTaskId = null;
  postponedIds = [];
}
