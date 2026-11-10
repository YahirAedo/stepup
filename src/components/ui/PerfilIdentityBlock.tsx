import React from 'react';
import { Text as RNText, View, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  useResponsive,
} from '../../theme/serene';
import PerfilPrimaryButton from './PerfilPrimaryButton';
import type { PerfilCopy } from '../../features/profile/logic/perfilCopy';

export interface PerfilIdentityBlockProps {
  isGuest: boolean;
  copy: PerfilCopy['identity'];
  name: string | null;
  email: string | null;
  onGuestCta: () => void;
}

/**
 * Bloque de identidad de Perfil: con cuenta muestra nombre + email; sin cuenta
 * (invitado) muestra el aviso de datos locales y el CTA principal "Crear cuenta".
 */
export default function PerfilIdentityBlock({
  isGuest,
  copy,
  name,
  email,
  onGuestCta,
}: PerfilIdentityBlockProps) {
  const { scale: s } = useResponsive();
  const avatarSize = s(56);
  const displayName = name && name.trim() !== '' ? name : email ?? '';
  const initial = displayName.trim().charAt(0).toUpperCase() || '—';

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
            {isGuest ? copy.guestTitle : displayName}
          </RNText>
          <RNText
            style={[
              sereneTypography['body-sm'] as TextStyle,
              { color: sereneColors['on-surface-variant'] },
            ]}
          >
            {isGuest ? copy.guestBody : (email ?? '')}
          </RNText>
        </View>
      </View>

      {isGuest ? (
        <PerfilPrimaryButton label={copy.guestCta} icon="account-plus-outline" onPress={onGuestCta} />
      ) : null}
    </View>
  );
}
