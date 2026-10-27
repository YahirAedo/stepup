import React from 'react';
import { Pressable, Text as RNText, View, type TextStyle } from 'react-native';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  useResponsive,
} from '../../theme/serene';
import BottomSheet from './BottomSheet';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  /** Si `true`, el boton de confirmar usa el color de error. Default `true`. */
  destructive?: boolean;
  /** Qué botón lleva el peso visual: 'confirm' (default) o 'cancel'.
   *  Con 'cancel', "Cancelar" es el botón relleno primary y el confirmatorio
   *  se vuelve secundario destructivo (borde error + texto error). */
  emphasis?: 'confirm' | 'cancel';
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Dialogo de confirmacion con dos acciones, sobre `BottomSheet`. Reusa el
 * patron del modal de "Cerrar sesion" de Perfil A.
 */
export default function ConfirmDialog({
  visible,
  title,
  body,
  confirmLabel,
  cancelLabel,
  destructive = true,
  emphasis = 'confirm',
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const { scale: s } = useResponsive();

  const isCancelEmphasis = emphasis === 'cancel';

  // Colores cuando el énfasis está en "confirm" (comportamiento original)
  const confirmBackgroundDefault = destructive ? sereneColors.error : sereneColors['primary-container'];
  const confirmTextDefault = destructive ? sereneColors['on-error'] : sereneColors['on-primary-container'];

  // Colores cuando el énfasis está en "cancel"
  const confirmBackgroundCancel = isCancelEmphasis
    ? sereneColors['surface-container-high']
    : confirmBackgroundDefault;
  const confirmTextCancel = isCancelEmphasis
    ? sereneColors['on-surface-variant']
    : confirmTextDefault;
  const confirmBorderCancel = isCancelEmphasis
    ? sereneColors.error
    : 'transparent';

  const cancelBackgroundCancel = isCancelEmphasis
    ? sereneColors.primary
    : 'transparent';
  const cancelTextCancel = isCancelEmphasis
    ? sereneColors['on-primary']
    : sereneColors['on-surface-variant'];
  const cancelHeight = isCancelEmphasis ? s(48) : s(44);

  return (
    <BottomSheet visible={visible} onClose={onClose} closeLabel={cancelLabel}>
      <View style={{ gap: sereneSpacing['space-md'] }}>
        <RNText
          style={[sereneTypography['headline-sm'] as TextStyle, { color: sereneColors['on-surface'] }]}
        >
          {title}
        </RNText>

        <RNText
          style={[
            sereneTypography['body-md'] as TextStyle,
            { color: sereneColors['on-surface-variant'] },
          ]}
        >
          {body}
        </RNText>

        {isCancelEmphasis ? (
          // Orden invertido: Cancelar arriba (relleno primary), Confirmar abajo (destructivo secundario)
          <>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
              style={({ pressed }) => ({
                minHeight: cancelHeight,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: sereneBorderRadius.lg,
                backgroundColor: cancelBackgroundCancel,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: cancelTextCancel }]}>
                {cancelLabel}
              </RNText>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              style={({ pressed }) => ({
                minHeight: s(44),
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: sereneBorderRadius.lg,
                borderWidth: 1.5,
                borderColor: confirmBorderCancel,
                backgroundColor: confirmBackgroundCancel,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <RNText style={[sereneTypography['label-md'] as TextStyle, { color: confirmTextCancel }]}>
                {confirmLabel}
              </RNText>
            </Pressable>
          </>
        ) : (
          // Orden original: Confirmar arriba (relleno), Cancelar abajo (fantasma)
          <>
            <Pressable
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              style={({ pressed }) => ({
                minHeight: s(48),
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: sereneBorderRadius.lg,
                backgroundColor: confirmBackgroundDefault,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: confirmTextDefault }]}>
                {confirmLabel}
              </RNText>
            </Pressable>

            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
              style={({ pressed }) => ({
                minHeight: s(44),
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: sereneBorderRadius.lg,
                backgroundColor: pressed ? sereneColors['surface-container-high'] : 'transparent',
              })}
            >
              <RNText
                style={[
                  sereneTypography['label-md'] as TextStyle,
                  { color: sereneColors['on-surface-variant'] },
                ]}
              >
                {cancelLabel}
              </RNText>
            </Pressable>
          </>
        )}
      </View>
    </BottomSheet>
  );
}
