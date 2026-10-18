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
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const { scale: s } = useResponsive();

  const confirmBackground = destructive ? sereneColors.error : sereneColors['primary-container'];
  const confirmText = destructive ? sereneColors['on-error'] : sereneColors['on-primary-container'];

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

        <Pressable
          onPress={onConfirm}
          accessibilityRole="button"
          accessibilityLabel={confirmLabel}
          style={({ pressed }) => ({
            minHeight: s(48),
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: confirmBackground,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: confirmText }]}>
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
      </View>
    </BottomSheet>
  );
}
