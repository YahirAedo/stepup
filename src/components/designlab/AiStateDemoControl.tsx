import React from 'react';
import { View, Text as RNText, type TextStyle } from 'react-native';
import FilterPills, { type FilterPillOption } from './FilterPills';
import type { AiStatus } from './AiStepsPanel';
import { sereneColors, sereneTypography, sereneSpacing } from '../../theme/serene';

export interface AiStateDemoControlProps {
  status: AiStatus;
  onChange: (status: AiStatus) => void;
}

const OPTIONS: FilterPillOption<AiStatus>[] = [
  { key: 'idle', label: 'Sin usar' },
  { key: 'loading', label: 'Cargando' },
  { key: 'ready', label: 'Listo' },
  { key: 'error', label: 'Error' },
  { key: 'offline', label: 'Sin conexión' },
];

/**
 * SOLO DESIGN LAB: conmutador para inspeccionar los estados de la IA sin red
 * real. No forma parte de ninguna pantalla de produccion.
 */
export default function AiStateDemoControl({ status, onChange }: AiStateDemoControlProps) {
  return (
    <View style={{ gap: sereneSpacing['space-xs'] }}>
      <RNText
        style={[
          sereneTypography['label-sm'] as TextStyle,
          { color: sereneColors['on-surface-variant'], textTransform: 'uppercase', letterSpacing: 0.6 },
        ]}
      >
        Estado IA (solo Design Lab)
      </RNText>
      <FilterPills options={OPTIONS} activeKey={status} onChange={onChange} />
    </View>
  );
}
