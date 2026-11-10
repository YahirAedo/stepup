import React from 'react';
import { View, Text as RNText, Pressable, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mci } from '../designlab/mciIconMap';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  useResponsive,
} from '../../theme/serene';
import { getStepRowState } from './stepRowState';

export interface StepRowProps {
  name: string;
  durationMin: number | null;
  /** Paso completado: sin tacho, atenuado si no es interactivo. */
  completed: boolean;
  /** Paso marcado para borrado visual: atenuado, nombre tachado. */
  pendingDelete: boolean;
  /** Modo solo lectura: sin tacho, sin tap. */
  readOnly?: boolean;
  /** Fila seleccionada en modo ordenar: resaltada con color de acento. */
  selected?: boolean;
  /** Abre el sheet de edición del paso. Opcional: si no se pasa, tocar la fila no hace nada. */
  onPress?: () => void;
  /** Marca para borrado visual. Opcional: si no se pasa, no se muestra el tacho. */
  onDelete?: () => void;
  /** Restaura un paso marcado para borrado. Si no se pasa, el botón usa onDelete. */
  onUndoDelete?: () => void;
}

/**
 * Fila compartida de paso para Crear, Editar y Detalle.
 *
 * Detalle: solo nombre + duración (sin onPress → completado no interactivo).
 * Editar/Crear: suma el tacho/deshacer a la derecha (con onDelete).
 *
 * Paso completado: atenuado solo si no es interactivo (sin onPress); con onPress
 * (Editar) es tocable, fondo surface-container-low, texto atenuado, sin sombra.
 * Paso borrado: tachado, atenuado, no seleccionable.
 */
export default function StepRow({
  name,
  durationMin,
  completed,
  pendingDelete,
  readOnly,
  selected,
  onPress,
  onDelete,
  onUndoDelete,
}: StepRowProps) {
  const { scale: s } = useResponsive();
  const hasOnPress = typeof onPress === 'function';
  const state = getStepRowState({
    name,
    completed,
    pendingDelete,
    readOnly: !!readOnly,
    hasOnPress,
  });

  const struck = pendingDelete ? 'line-through' : 'none';
  const textColor = completed || state.disabled ? sereneColors['on-surface-variant'] : sereneColors['on-surface'];

  const interactiveCompleted = completed && hasOnPress && !state.disabled;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: sereneSpacing['space-sm'] }}>
      <Pressable
        onPress={state.disabled ? undefined : onPress}
        disabled={state.disabled}
        accessibilityRole="button"
        accessibilityLabel={state.a11yLabel}
        accessibilityState={{ disabled: state.disabled }}
        style={({ pressed }) => ({
          flex: 1,
          minHeight: s(48),
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: sereneSpacing['space-sm'],
          paddingHorizontal: sereneSpacing['space-sm'],
          paddingVertical: sereneSpacing['space-sm'],
          borderRadius: sereneBorderRadius.lg,
          backgroundColor: selected
            ? sereneColors['primary-container']
            : state.dimmed
              ? sereneColors['surface-container-low']
              : completed && hasOnPress
                ? sereneColors['surface-container-low']
                : sereneColors['surface-container-lowest'],
          opacity: state.dimmed ? 0.6 : pressed ? 0.92 : 1,
          ...(state.dimmed || interactiveCompleted ? {} : sereneShadows.card),
        })}
      >
        {state.showCheck && (
          <View importantForAccessibility="no-hide-descendants" accessible={false}>
            <MaterialCommunityIcons
              name={mci('check')}
              size={s(18)}
              color={sereneColors['on-surface-variant']}
            />
          </View>
        )}
        <View style={{ flex: 1, minWidth: 0 }}>
          <RNText
            numberOfLines={1}
            style={[
              sereneTypography['body-md'] as TextStyle,
              { color: textColor, textDecorationLine: struck, flexShrink: 1 },
            ]}
          >
            {name}
          </RNText>
        </View>
        <RNText
          style={[
            sereneTypography['label-sm'] as TextStyle,
            { color: sereneColors['on-surface-variant'] },
          ]}
        >
          {durationMin != null ? `~${durationMin} min` : '—'}
        </RNText>
      </Pressable>

      {onDelete && !completed && (
        <Pressable
          onPress={pendingDelete ? (onUndoDelete ?? onDelete) : onDelete}
          accessibilityRole="button"
          accessibilityLabel={pendingDelete ? 'Deshacer borrado' : 'Borrar paso'}
          hitSlop={s(8)}
          style={({ pressed }) => ({
            width: s(36),
            height: s(36),
            borderRadius: sereneBorderRadius.lg,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: sereneColors['surface-container-high'],
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <MaterialCommunityIcons
            name={mci(pendingDelete ? 'undo' : 'delete')}
            size={s(18)}
            color={sereneColors['on-surface-variant']}
          />
        </Pressable>
      )}
    </View>
  );
}
