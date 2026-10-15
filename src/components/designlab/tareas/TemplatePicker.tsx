// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React from 'react';
import { View, Text as RNText, Pressable, ScrollView, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mci } from '../mciIconMap';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  withAlpha,
  useResponsive,
} from '../../../theme/serene';
import { stepCountLabel } from '../../../utils/microplan';
import type { FlujoCTemplate } from '../../../screens/designlab/tareasFlujoCFixtures';

export interface TemplatePickerProps {
  title: string;
  templates: FlujoCTemplate[];
  /** Plantilla marcada como elegida (`null` = ninguna). */
  selectedId: string | null;
  onSelect: (templateId: string) => void;
}

/**
 * Selector de plantillas reutilizables (identidad de la Variante C "Sendero").
 * Chips/cards horizontales: icono, nombre, cantidad de pasos (`stepCountLabel`)
 * y minutos totales. Al elegir una, la pantalla host llena la lista de pasos.
 *
 * // REQUIERE MIGRACIÓN: no existe entidad "plantilla" en el modelo real
 * (`Task` / `Step`); el picker es solo una preview sobre fixtures.
 */
export default function TemplatePicker({ title, templates, selectedId, onSelect }: TemplatePickerProps) {
  const { scale: s } = useResponsive();

  return (
    <View style={{ gap: sereneSpacing['space-sm'] }}>
      <RNText style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'] }]}>
        {title}
      </RNText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: sereneSpacing['space-sm'], paddingVertical: s(2) }}
      >
        {templates.map((template) => {
          const selected = template.id === selectedId;
          const meta = `${stepCountLabel(template.stepCount)} · ~${template.totalMinutes} min`;

          return (
            <Pressable
              key={template.id}
              onPress={() => onSelect(template.id)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`Plantilla ${template.name}, ${meta}`}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: sereneSpacing['space-sm'],
                minHeight: s(48),
                paddingHorizontal: sereneSpacing['space-md'],
                paddingVertical: sereneSpacing['space-sm'],
                borderRadius: sereneBorderRadius.xl,
                backgroundColor: selected
                  ? sereneColors['primary-container']
                  : sereneColors['surface-container-lowest'],
                borderWidth: selected ? 1 : 0,
                borderColor: sereneColors.primary,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <View
                style={{
                  width: s(32),
                  height: s(32),
                  borderRadius: sereneBorderRadius.lg,
                  backgroundColor: selected
                    ? withAlpha(sereneColors['on-primary'], 0.16)
                    : sereneColors['surface-container-high'],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialCommunityIcons
                  name={mci(template.iconKey)}
                  size={s(18)}
                  color={selected ? sereneColors['on-primary'] : sereneColors.primary}
                />
              </View>

              <View style={{ minWidth: 0 }}>
                <RNText
                  numberOfLines={1}
                  style={[
                    sereneTypography['label-lg'] as TextStyle,
                    { color: selected ? sereneColors['on-primary'] : sereneColors['on-surface'] },
                  ]}
                >
                  {template.name}
                </RNText>
                <RNText
                  style={[
                    sereneTypography['label-sm'] as TextStyle,
                    { color: selected ? sereneColors['on-primary'] : sereneColors['on-surface-variant'] },
                  ]}
                >
                  {meta}
                </RNText>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
