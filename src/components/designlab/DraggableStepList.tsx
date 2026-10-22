// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React from 'react';
import DraggableFlatList, { type RenderItemParams } from 'react-native-draggable-flatlist';

export interface DraggableStepListProps<T> {
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: (params: RenderItemParams<T>) => React.ReactElement | null;
  /** Recibe la lista ya reordenada; el consumidor la persiste en su estado. */
  onReorder: (next: T[]) => void;
  /** Separación vertical entre filas. */
  gap?: number;
}

/**
 * Lista de pasos reordenable por arrastre. Envuelve `DraggableFlatList` para
 * concentrar la configuración (`scrollEnabled={false}` porque vive dentro del
 * `ScrollView` de cada pantalla, `activationDistance` para no robar el tap) y
 * para poder cambiar de librería de drag sin tocar las pantallas.
 */
export default function DraggableStepList<T>({
  data,
  keyExtractor,
  renderItem,
  onReorder,
  gap = 10,
}: DraggableStepListProps<T>) {
  return (
    <DraggableFlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      onDragEnd={({ data: next }) => onReorder(next)}
      scrollEnabled={false}
      activationDistance={12}
      containerStyle={{ flexGrow: 0 }}
      contentContainerStyle={{ gap }}
      accessibilityLabel="Pasos reordenables"
    />
  );
}
