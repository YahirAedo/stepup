import React from 'react';
import { View, Text as RNText, type TextStyle } from 'react-native';
import FilterPills, { type FilterPillOption } from './FilterPills';
import { sereneColors, sereneTypography, sereneSpacing } from '../../theme/serene';
import { completadoDemo, type CompletadoScenario } from '../../screens/designlab/focusFixtures';

export interface FocusStateDemoControlProps {
  state: CompletadoScenario;
  onChange: (state: CompletadoScenario) => void;
}

const OPTIONS: FilterPillOption<CompletadoScenario>[] = completadoDemo.options.map((option) => ({
  key: option.key,
  label: option.label,
}));

/**
 * SOLO DESIGN LAB: conmutador para inspeccionar los 3 cierres de "paso completado"
 * (queda otro paso / último de la tarea / sin pendientes). No forma parte de
 * ninguna pantalla de produccion.
 */
export default function FocusStateDemoControl({ state, onChange }: FocusStateDemoControlProps) {
  return (
    <View style={{ gap: sereneSpacing['space-xs'] }}>
      <RNText
        style={[
          sereneTypography['label-sm'] as TextStyle,
          { color: sereneColors['on-surface-variant'], textTransform: 'uppercase', letterSpacing: 0.6 },
        ]}
      >
        {completadoDemo.label}
      </RNText>
      <FilterPills
        options={OPTIONS}
        activeKey={state}
        onChange={onChange}
        accessibilityLabel="Estados del cierre"
      />
    </View>
  );
}
