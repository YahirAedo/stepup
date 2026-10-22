import React, { type ComponentProps } from 'react';
import { View, Pressable, Text as RNText, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { sereneColors, sereneTypography, withAlpha, useResponsive } from '../../theme/serene';

export interface DesignLabHeaderProps {
  title?: string;
  /** Muestra el avatar decorativo a la derecha. `false` en formularios y detalle. */
  showAvatar?: boolean;
  /**
   * Acción opcional a la derecha (ej. "+" para crear). Cuando se define,
   * reemplaza al avatar y se dibuja un botón táctil de 44x44.
   */
  rightAction?: {
    icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
    label: string;
    onPress: () => void;
  };
}

/**
 * Header custom para las pantallas del Design Lab (mockups).
 *
 * Sigue la referencia del HTML: back (44x44), titulo centrado "Focus Timer",
 * avatar (cuadrado con icono account) o una acción a la derecha. No usa el
 * header nativo porque los mockups dibujan el suyo. `navigation.goBack()` vuelve
 * a la pantalla anterior (DesignLab -> Perfil/indice).
 *
 * Superficie `surface` al ~92% (sin expo-blur). Decision documentada en #295.
 */
export default function DesignLabHeader({
  title = 'Cronómetro',
  showAvatar = true,
  rightAction,
}: DesignLabHeaderProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { scale: s } = useResponsive();
  const avatarSize = s(32);
  const backSize = s(44);

  return (
    <View
      style={{
        paddingTop: insets.top,
        height: insets.top + s(56),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: s(16),
        backgroundColor: withAlpha(sereneColors.surface, 0.92),
      }}
    >
      <Pressable
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel="Volver"
        style={({ pressed }) => ({
          width: backSize,
          height: backSize,
          borderRadius: backSize / 2,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <MaterialCommunityIcons name="arrow-left" size={s(20)} color={sereneColors['on-surface']} />
      </Pressable>

      <RNText
        style={[
          sereneTypography['title-md'] as TextStyle,
          { color: sereneColors['on-surface'], textAlign: 'center', flex: 1 },
        ]}
        numberOfLines={1}
      >
        {title}
      </RNText>

      {rightAction ? (
        <Pressable
          onPress={rightAction.onPress}
          accessibilityRole="button"
          accessibilityLabel={rightAction.label}
          style={({ pressed }) => ({
            width: backSize,
            height: backSize,
            borderRadius: backSize / 2,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <MaterialCommunityIcons name={rightAction.icon} size={s(24)} color={sereneColors['on-surface']} />
        </Pressable>
      ) : (
        <View
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: s(8),
            backgroundColor: showAvatar ? sereneColors.primary : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {showAvatar ? (
            <MaterialCommunityIcons name="account" size={s(20)} color={sereneColors['on-primary']} />
          ) : null}
        </View>
      )}
    </View>
  );
}
