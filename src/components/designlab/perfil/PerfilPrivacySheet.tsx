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

export interface PerfilPrivacySheetProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Sheet de Privacidad. El texto es VERDADERO (verificado en codigo): base local
 * SQLite sin cifrado, sync con cuenta y envio de la tarea al servicio de IA solo
 * al usar "Sugerir pasos".
 */
export default function PerfilPrivacySheet({ visible, onClose }: PerfilPrivacySheetProps) {
  const { scale: s } = useResponsive();
  const copy = perfilCopy.privacy;

  return (
    <BottomSheet visible={visible} onClose={onClose} closeLabel={copy.closeCta}>
      <View style={{ gap: sereneSpacing['space-md'] }}>
        <RNText
          style={[sereneTypography['headline-sm'] as TextStyle, { color: sereneColors['on-surface'] }]}
        >
          {copy.title}
        </RNText>

        <View style={{ gap: sereneSpacing['space-sm'] }}>
          {copy.paragraphs.map((paragraph, index) => (
            <RNText
              key={index}
              style={[
                sereneTypography['body-md'] as TextStyle,
                { color: sereneColors['on-surface-variant'] },
              ]}
            >
              {paragraph}
            </RNText>
          ))}
        </View>

        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={copy.closeCta}
          style={({ pressed }) => ({
            minHeight: s(48),
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: pressed
              ? sereneColors['surface-container-highest']
              : sereneColors['surface-container-high'],
          })}
        >
          <RNText
            style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-surface'] }]}
          >
            {copy.closeCta}
          </RNText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
