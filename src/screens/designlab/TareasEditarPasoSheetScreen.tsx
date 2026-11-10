// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React, { useState } from 'react';
import { View, ScrollView, Text as RNText, Pressable, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBottomLayout } from '../../theme/layout';
import DesignLabHeader from '../../components/designlab/DesignLabHeader';
import EditarPasoSheet from '../../components/designlab/EditarPasoSheet';
import { mci } from '../../components/designlab/mciIconMap';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  useResponsive,
} from '../../theme/serene';
import { editarPasoSheetFixtures } from './tareasCompartidoFixtures';

/**
 * Preview host de la propuesta unica "Editar paso" (bottom sheet).
 * Muestra un fondo tipo detalle y el sheet abierto por defecto para que el
 * revisor compare. Es compartida por las 3 variantes del flujo Tareas.
 */
export default function TareasEditarPasoSheetScreen() {
  const { contentPaddingBottom } = useBottomLayout();
  const { scale: s } = useResponsive();
  const [visible, setVisible] = useState(true);
  const f = editarPasoSheetFixtures;

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <DesignLabHeader title="Editar paso (sheet)" showAvatar={false} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.margin,
          paddingTop: sereneSpacing['space-md'],
          paddingBottom: contentPaddingBottom,
          gap: sereneSpacing['space-md'],
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: sereneColors['surface-container-lowest'],
            borderRadius: sereneBorderRadius.xl,
            padding: sereneSpacing['space-md'],
            gap: sereneSpacing['space-sm'],
            ...sereneShadows.card,
          }}
        >
          <RNText
            style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
          >
            {`Tarea activa · ${f.taskTitle}`}
          </RNText>
          <RNText style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'] }]}>
            {f.stepTitle}
          </RNText>
          <RNText
            style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
          >
            {`Paso ${f.position} de ${f.total} · ~${f.durationMin} min`}
          </RNText>
        </View>

        <Pressable
          onPress={() => setVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Abrir editar paso"
          style={({ pressed }) => ({
            minHeight: s(48),
            borderRadius: sereneBorderRadius.lg,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: s(8),
            backgroundColor: sereneColors['surface-container-high'],
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <MaterialCommunityIcons name={mci('edit')} size={s(20)} color={sereneColors['on-surface']} />
          <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-surface'] }]}>
            Abrir "Editar paso"
          </RNText>
        </Pressable>
      </ScrollView>

      <EditarPasoSheet
        visible={visible}
        onClose={() => setVisible(false)}
        onSave={() => setVisible(false)}
        taskTitle={f.taskTitle}
        initialTitle={f.stepTitle}
        initialDuration={f.durationMin}
        position={f.position}
        total={f.total}
      />
    </View>
  );
}
