/**
 * Fixtures compartidos del flujo Tareas — Design Lab.
 *
 * Solo la propuesta unica de "Editar paso" (bottom sheet), que reusan las tres
 * variantes. Los fixtures de cada flujo viven en su propio archivo
 * (`tareasFlujoAFixtures.ts`, etc.) para no pisarse entre variantes.
 */

export interface EditarPasoSheetFixture {
  taskTitle: string;
  stepTitle: string;
  durationMin: number;
  position: number;
  total: number;
}

export const editarPasoSheetFixtures: EditarPasoSheetFixture = {
  taskTitle: 'Rediseño de propuesta comercial Q3',
  stepTitle: 'Escribir las 3 viñetas de solución técnica',
  durationMin: 4,
  position: 2,
  total: 4,
};
