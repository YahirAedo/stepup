// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React, { useState } from 'react';
import { View, ScrollView, Text as RNText, Pressable, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBottomLayout } from '../../theme/layout';
import DesignLabHeader from '../../components/designlab/DesignLabHeader';
import ConfirmDialog from '../../components/designlab/ConfirmDialog';
import TareaAForm from '../../components/designlab/tareas/TareaAForm';
import { mci } from '../../components/designlab/mciIconMap';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  withAlpha,
  useResponsive,
} from '../../theme/serene';
import type { ProfileStackParamList } from '../../types/navigation';
import { flujoAEditarFixtures, flujoADetalleFixtures } from './tareasFlujoAFixtures';

/**
 * Variante A "Enfoque" — Tareas / Editar.
 *
 * Reusa `TareaAForm` en modo `edit` (precargado con la tarea del fixture).
 * Footer fijo: primario "Guardar" → Detalle; secundario "Borrar" → confirmación
 * y vuelta al Listado.
 */
export default function TareasAEditarScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList, 'TareasAEditar'>>();
  const { insets } = useBottomLayout();
  const { scale: s } = useResponsive();
  const f = flujoAEditarFixtures;
  const params = useRoute<RouteProp<ProfileStackParamList, 'TareasAEditar'>>().params;
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <DesignLabHeader title={f.headerTitle} showAvatar={false} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.margin,
          paddingTop: sereneSpacing['space-md'],
          paddingBottom: sereneSpacing['space-lg'],
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TareaAForm mode="edit" autoOpenOrdenar={params?.ordenarPasos === true} />
      </ScrollView>

      {/* Barra de acción fija (en flujo del layout, no absolute) */}
      <View
        style={{
          paddingHorizontal: sereneSpacing.margin,
          paddingTop: sereneSpacing['space-sm'],
          paddingBottom: insets.bottom + sereneSpacing['space-md'],
          gap: sereneSpacing['space-sm'],
          borderTopWidth: 1,
          borderTopColor: withAlpha(sereneColors.outline, 0.2),
          backgroundColor: sereneColors.surface,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={f.primary}
          onPress={() => navigation.navigate('TareasADetalle')}
          style={({ pressed }) => ({
            minHeight: s(48),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: sereneSpacing['space-sm'],
            paddingVertical: sereneSpacing['space-sm'],
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: sereneColors.primary,
            ...sereneShadows.card,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <MaterialCommunityIcons name={mci('check')} size={s(20)} color={sereneColors['on-primary']} />
          <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}>
            {f.primary}
          </RNText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={f.secondary}
          onPress={() => setDeleteOpen(true)}
          style={({ pressed }) => ({
            minHeight: s(44),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: sereneSpacing['space-sm'],
            paddingVertical: sereneSpacing['space-sm'],
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: sereneColors.error,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <MaterialCommunityIcons name={mci('delete')} size={s(18)} color={sereneColors['on-error']} />
          <RNText style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-error'] }]}>
            {f.secondary}
          </RNText>
        </Pressable>
      </View>

      <ConfirmDialog
        visible={deleteOpen}
        title={flujoADetalleFixtures.deleteDialog.title}
        body={flujoADetalleFixtures.deleteDialog.body}
        confirmLabel={flujoADetalleFixtures.deleteDialog.confirm}
        cancelLabel={flujoADetalleFixtures.deleteDialog.cancel}
        onConfirm={() => {
          setDeleteOpen(false);
          navigation.navigate('TareasAListado');
        }}
        onClose={() => setDeleteOpen(false)}
      />
    </View>
  );
}
