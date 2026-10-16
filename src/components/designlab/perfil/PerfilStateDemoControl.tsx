import React from 'react';
import { View, Text as RNText, type TextStyle } from 'react-native';
import FilterPills, { type FilterPillOption } from '../FilterPills';
import { sereneColors, sereneTypography, sereneSpacing } from '../../../theme/serene';
import { perfilCopy, type PerfilDemoState } from '../../../screens/designlab/perfilFixtures';

export interface PerfilStateDemoControlProps {
  state: PerfilDemoState;
  onChange: (state: PerfilDemoState) => void;
}

const OPTIONS: FilterPillOption<PerfilDemoState>[] = perfilCopy.demo.options.map((option) => ({
  key: option.key,
  label: option.label,
}));

/**
 * SOLO DESIGN LAB: conmutador para inspeccionar los 6 estados de Perfil sin
 * backend real. No forma parte de ninguna pantalla de produccion.
 */
export default function PerfilStateDemoControl({ state, onChange }: PerfilStateDemoControlProps) {
  return (
    <View style={{ gap: sereneSpacing['space-xs'] }}>
      <RNText
        style={[
          sereneTypography['label-sm'] as TextStyle,
          { color: sereneColors['on-surface-variant'], textTransform: 'uppercase', letterSpacing: 0.6 },
        ]}
      >
        {perfilCopy.demo.label}
      </RNText>
      <FilterPills options={OPTIONS} activeKey={state} onChange={onChange} />
    </View>
  );
}
