import React from 'react';
import { Pressable, Text as RNText, View, type TextStyle } from 'react-native';
import FilterPills, { type FilterPillOption } from '../FilterPills';
import { sereneColors, sereneTypography, sereneSpacing, sereneBorderRadius, useResponsive } from '../../../theme/serene';
import { loginAFixtures, registroAFixtures } from '../../../screens/designlab/authAFixtures';

export type AuthFlow = 'login' | 'registro';

export interface AuthStateDemoControlProps<S extends string> {
  flow: AuthFlow;
  state: S;
  onChange: (state: S) => void;
  onIndex: () => void;
}

/**
 * Selector de estado SOLO para el Design Lab (Login/Registro).
 *
 * Reusa `FilterPills` y añade un botón "Índice" de 48 px mínimo para volver
 * al índice del Lab. No forma parte de ninguna pantalla de producción.
 */
export default function AuthStateDemoControl<S extends string>({
  flow,
  state,
  onChange,
  onIndex,
}: AuthStateDemoControlProps<S>) {
  const { scale: s } = useResponsive();

  const copy = flow === 'login' ? loginAFixtures : registroAFixtures;
  const options = copy.demo.options as FilterPillOption<S>[];

  return (
    <View style={{ gap: sereneSpacing['space-xs'] }}>
      <RNText
        style={[
          sereneTypography['label-sm'] as TextStyle,
          { color: sereneColors['on-surface-variant'], textTransform: 'uppercase', letterSpacing: 0.6 },
        ]}
      >
        {copy.demo.label}
      </RNText>

      <FilterPills<S> options={options} activeKey={state} onChange={onChange} />

      <Pressable
        onPress={onIndex}
        accessibilityRole="button"
        accessibilityLabel={copy.demo.indexCta}
        style={({ pressed }) => ({
          minHeight: s(48),
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: sereneSpacing['space-md'],
          paddingVertical: sereneSpacing['space-sm'],
          borderRadius: sereneBorderRadius.full,
          backgroundColor: sereneColors['surface-container-high'],
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <RNText
          style={[
            sereneTypography['label-md'] as TextStyle,
            { color: sereneColors['on-surface-variant'] },
          ]}
        >
          {copy.demo.indexCta}
        </RNText>
      </Pressable>
    </View>
  );
}