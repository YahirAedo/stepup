/**
 * Función pura: resuelve el id de cada paso a partir del orden final del borrador.
 *
 * Las claves originales mapean a su id. Las claves nuevas (las que no están en
 * originalSteps) se asignan, en el orden en que aparecen en finalOrder, a los
 * ids de newStepIds en orden. Si hay más claves nuevas que ids, las que sobran
 * no se incluyen en el mapa. No muta la entrada.
 */
export function resolveStepIds(
  originalSteps: ReadonlyArray<{ key: string; id: number }>,
  finalOrder: ReadonlyArray<string>,
  newStepIds: ReadonlyArray<number>,
): Map<string, number> {
  const result = new Map<string, number>();

  const originalMap = new Map<string, number>();
  for (const step of originalSteps) {
    originalMap.set(step.key, step.id);
  }

  let newIndex = 0;
  for (const key of finalOrder) {
    if (originalMap.has(key)) {
      result.set(key, originalMap.get(key)!);
    } else if (newIndex < newStepIds.length) {
      result.set(key, newStepIds[newIndex]);
      newIndex += 1;
    }
  }

  return result;
}
