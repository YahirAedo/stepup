import React from 'react';
import { Pressable, Text as RNText, View, type TextStyle } from 'react-native';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  useResponsive,
} from '../../../theme/serene';
import BottomSheet from '../BottomSheet';
import { perfilCopy } from '../../../screens/designlab/perfilFixtures';

export interface PerfilLogoutSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Confirmacion de "Cerrar sesion". Aclara que los datos locales quedan en el
 * telefono y que se puede volver a entrar.
 */
export default function PerfilLogoutSheet({ visible, onClose, onConfirm }: PerfilLogoutSheetProps) {
  const { scale: s } = useResponsive();
  const copy = perfilCopy.account;

  return (
    <BottomSheet visible={visible} onClose={onClose} closeLabel={copy.cancelCta}>
      <View style={{ gap: sereneSpacing['space-md'] }}>
        <RNText
          style={[sereneTypography['headline-sm'] as TextStyle, { color: sereneColors['on-surface'] }]}
        >
          {copy.logoutConfirmTitle}
        </RNText>

        <RNText
          style={[
            sereneTypography['body-md'] as TextStyle,
            { color: sereneColors['on-surface-variant'] },
          ]}
        >
          {copy.logoutConfirmBody}
        </RNText>

        <Pressable
          onPress={onConfirm}
          accessibilityRole="button"
          accessibilityLabel={copy.logoutConfirmCta}
          style={({ pressed }) => ({
            minHeight: s(48),
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: pressed ? sereneColors['on-error'] : sereneColors.error,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <RNText
            style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-error'] }]}
          >
            {copy.logoutConfirmCta}
          </RNText>
        </Pressable>

        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={copy.cancelCta}
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
            {copy.cancelCta}
          </RNText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
