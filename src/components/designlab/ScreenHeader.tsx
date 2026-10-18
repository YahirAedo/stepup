import React from 'react';
import { Pressable, Text as RNText, View, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  withAlpha,
  useResponsive,
} from '../../theme/serene';

type MciName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export type ScreenHeaderVariant = 'tab' | 'detail' | 'form';

export interface ScreenHeaderAction {
  icon: MciName;
  label: string;
  onPress: () => void;
}

export interface ScreenHeaderProps {
  title: string;
  /**
   * - `tab`: titulo grande a la izquierda + subtitulo opcional + accion derecha.
   * - `detail`: flecha volver + titulo + accion derecha (menu ···).
   * - `form`: "Cancelar" a la izquierda + titulo (sin X ni avatar).
   */
  variant?: ScreenHeaderVariant;
  subtitle?: string;
  /** Default: `navigation.goBack()`. */
  onBack?: () => void;
  /** Solo variante `form`: etiqueta del boton izquierdo. */
  cancelLabel?: string;
}

const BACK_SIZE = 44;

/**
 * Header unico del Design Lab. Reemplaza `DesignLabHeader`: nunca muestra avatar
 * y cubre los tres patrones del rediseno. El safe area se compone con insets +
 * token (GUIA-DISENO-MOVIL §5.1), sin `paddingTop` fijo.
 */
export default function ScreenHeader({
  title,
  variant = 'tab',
  subtitle,
  onBack,
  cancelLabel = 'Cancelar',
}: ScreenHeaderProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { scale: s } = useResponsive();

  const handleBack = onBack ?? (() => navigation.goBack());

  if (variant === 'tab') {
    return (
      <View
        style={{
          paddingTop: insets.top + sereneSpacing['space-md'],
          paddingHorizontal: sereneSpacing.gutter,
          paddingBottom: sereneSpacing['space-md'],
        }}
      >
        <RNText
          numberOfLines={2}
          style={[
            sereneTypography['headline-lg-mobile'] as TextStyle,
            { color: sereneColors['on-surface'] },
          ]}
        >
          {title}
        </RNText>
        {subtitle ? (
          <RNText
            numberOfLines={2}
            style={[
              sereneTypography['body-md'] as TextStyle,
              { color: sereneColors['on-surface-variant'], marginTop: sereneSpacing['space-xs'] },
            ]}
          >
            {subtitle}
          </RNText>
        ) : null}
      </View>
    );
  }

  if (variant === 'detail') {
    return (
      <View
        style={{
          paddingTop: insets.top,
          minHeight: insets.top + BACK_SIZE + sereneSpacing['space-sm'],
          flexDirection: 'row',
          alignItems: 'center',
          gap: sereneSpacing['space-sm'],
          paddingHorizontal: sereneSpacing.gutter,
          paddingBottom: sereneSpacing['space-sm'],
        }}
      >
        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Atras"
          style={({ pressed }) => ({
            width: BACK_SIZE,
            height: BACK_SIZE,
            borderRadius: sereneBorderRadius.full,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <MaterialCommunityIcons name="arrow-left" size={s(22)} color={sereneColors['on-surface']} />
        </Pressable>
        <RNText
          numberOfLines={2}
          style={[
            sereneTypography['title-md'] as TextStyle,
            { flex: 1, color: sereneColors['on-surface'] },
          ]}
        >
          {title}
        </RNText>
      </View>
    );
  }

  return (
    <View
      style={{
        paddingTop: insets.top,
        minHeight: insets.top + BACK_SIZE + sereneSpacing['space-sm'],
        flexDirection: 'row',
        alignItems: 'center',
        gap: sereneSpacing['space-sm'],
        paddingHorizontal: sereneSpacing.gutter,
        paddingBottom: sereneSpacing['space-sm'],
      }}
    >
      <Pressable
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel={cancelLabel}
        style={({ pressed }) => ({
          minHeight: BACK_SIZE,
          paddingHorizontal: sereneSpacing['space-sm'],
          justifyContent: 'center',
          borderRadius: sereneBorderRadius.lg,
          backgroundColor: pressed ? withAlpha(sereneColors['inverse-surface'], 0.08) : 'transparent',
        })}
      >
        <RNText
          style={[
            sereneTypography['label-lg'] as TextStyle,
            { color: sereneColors['on-surface-variant'] },
          ]}
        >
          {cancelLabel}
        </RNText>
      </Pressable>
      <RNText
        numberOfLines={2}
        style={[
          sereneTypography['title-md'] as TextStyle,
          { flex: 1, color: sereneColors['on-surface'] },
        ]}
      >
        {title}
      </RNText>
    </View>
  );
}
