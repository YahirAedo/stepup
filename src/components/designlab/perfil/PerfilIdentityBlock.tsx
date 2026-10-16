import React from 'react';
import { Text as RNText, View, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  useResponsive,
} from '../../../theme/serene';
import PerfilPrimaryButton from './PerfilPrimaryButton';
import type { PerfilCopy } from '../../../screens/designlab/perfilFixtures';

export interface PerfilIdentityBlockProps {
  isGuest: boolean;
  copy: PerfilCopy['identity'];
  onGuestCta: () => void;
}

/**
 * Bloque de identidad de Perfil: con cuenta muestra nombre + email + caption;
 * sin cuenta (invitado) muestra el aviso de datos locales y el CTA principal
 * "Crear cuenta" (unico boton primario de la pantalla en ese estado).
 */
export default function PerfilIdentityBlock({ isGuest, copy, onGuestCta }: PerfilIdentityBlockProps) {
  const { scale: s } = useResponsive();
  const avatarSize = s(56);
  const initial = copy.sessionName.trim().charAt(0).toUpperCase() || '—';

  return (
    <View style={{ gap: sereneSpacing['space-md'] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: sereneSpacing['space-md'] }}>
        <View
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: sereneBorderRadius.full,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isGuest
              ? sereneColors['surface-container-high']
              : sereneColors['primary-container'],
          }}
        >
          {isGuest ? (
            <MaterialCommunityIcons
              name="account-outline"
              size={s(26)}
              color={sereneColors['on-surface-variant']}
            />
          ) : (
            <RNText
              style={[
                sereneTypography['headline-sm'] as TextStyle,
                { color: sereneColors['on-primary-container'] },
              ]}
            >
              {initial}
            </RNText>
          )}
        </View>

        <View style={{ flex: 1, gap: s(2) }}>
          <RNText style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'] }]}>
            {isGuest ? copy.guestTitle : copy.sessionName}
          </RNText>
          <RNText
            style={[
              sereneTypography['body-sm'] as TextStyle,
              { color: sereneColors['on-surface-variant'] },
            ]}
          >
            {isGuest ? copy.guestBody : copy.sessionEmail}
          </RNText>
          {!isGuest ? (
            <RNText
              style={[
                sereneTypography['label-sm'] as TextStyle,
                { color: sereneColors['on-surface-variant'] },
              ]}
            >
              {copy.sessionCaption}
            </RNText>
          ) : null}
        </View>
      </View>

      {isGuest ? (
        <PerfilPrimaryButton label={copy.guestCta} icon="account-plus-outline" onPress={onGuestCta} />
      ) : null}
    </View>
  );
}
