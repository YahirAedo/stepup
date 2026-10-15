import React from 'react';
import { View, Text as RNText, Pressable, ActivityIndicator, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  withAlpha,
  useResponsive,
} from '../../theme/serene';

/** Estados del flujo de sugerencia con IA (offline-first: nunca se dispara sola). */
export type AiStatus = 'idle' | 'loading' | 'ready' | 'error' | 'offline';

export interface AiStepsPanelProps {
  status: AiStatus;
  /** Dispara la sugerencia (solo desde el boton). */
  onSuggest: () => void;
  /** Reintenta tras error / sin conexion. */
  onRetry?: () => void;
  title?: string;
  cta?: string;
  hint?: string;
  loadingMessage?: string;
  readyMessage?: string;
  errorMessage?: string;
  offlineMessage?: string;
}

/**
 * Panel "Sugerir pasos con IA". La IA NUNCA se dispara sola: siempre requiere
 * tocar el boton. Muestra los 4 estados pedidos (idle / loading / error /
 * offline) y una confirmacion en `ready`. Los pasos resultantes los renderiza
 * el consumidor debajo (cada variante tiene su propio layout de lista).
 */
export default function AiStepsPanel({
  status,
  onSuggest,
  onRetry,
  title = 'Pasos con IA',
  cta = 'Sugerir pasos',
  hint = 'La IA propone bloques cortos. Vos decidís editarlos o quitarlos.',
  loadingMessage = 'Pensando pasos cortos…',
  readyMessage = 'Listo. Revisá y ajustá los pasos propuestos.',
  errorMessage = 'No pudimos sugerir los pasos. Probá de nuevo.',
  offlineMessage = 'Estás sin conexión. Podés cargar los pasos a mano.',
}: AiStepsPanelProps) {
  const { scale: s } = useResponsive();

  const showSuggestButton = status === 'idle' || status === 'ready';

  return (
    <View
      style={{
        backgroundColor: sereneColors['surface-container-low'],
        borderRadius: sereneBorderRadius.xl,
        padding: sereneSpacing['space-md'],
        gap: sereneSpacing['space-sm'],
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(8), flexWrap: 'wrap' }}>
        <MaterialCommunityIcons name="auto-fix" size={s(20)} color={sereneColors.primary} />
        <RNText
          style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'], flexShrink: 1 }]}
        >
          {title}
        </RNText>
      </View>

      {status === 'idle' && (
        <RNText
          style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
        >
          {hint}
        </RNText>
      )}

      {status === 'loading' && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(8) }}>
          <ActivityIndicator color={sereneColors.primary} />
          <RNText
            style={[
              sereneTypography['body-sm'] as TextStyle,
              { color: sereneColors['on-surface-variant'], flexShrink: 1 },
            ]}
          >
            {loadingMessage}
          </RNText>
        </View>
      )}

      {status === 'ready' && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(8) }}>
          <MaterialCommunityIcons name="check-circle-outline" size={s(18)} color={sereneColors.primary} />
          <RNText
            style={[
              sereneTypography['body-sm'] as TextStyle,
              { color: sereneColors['on-surface-variant'], flexShrink: 1 },
            ]}
          >
            {readyMessage}
          </RNText>
        </View>
      )}

      {status === 'error' && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: s(8),
            padding: s(10),
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: withAlpha(sereneColors['error-container'], 0.6),
          }}
        >
          <MaterialCommunityIcons name="alert-circle-outline" size={s(18)} color={sereneColors.error} />
          <RNText
            style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-error-container'], flexShrink: 1 }]}
          >
            {errorMessage}
          </RNText>
        </View>
      )}

      {status === 'offline' && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: s(8),
            padding: s(10),
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: sereneColors['surface-container-high'],
          }}
        >
          <MaterialCommunityIcons name="cloud-off-outline" size={s(18)} color={sereneColors['on-surface-variant']} />
          <RNText
            style={[
              sereneTypography['body-sm'] as TextStyle,
              { color: sereneColors['on-surface-variant'], flexShrink: 1 },
            ]}
          >
            {offlineMessage}
          </RNText>
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: sereneSpacing['space-sm'], flexWrap: 'wrap' }}>
        {showSuggestButton && (
          <Pressable
            onPress={onSuggest}
            accessibilityRole="button"
            accessibilityLabel={cta}
            style={({ pressed }) => ({
              minHeight: s(44),
              paddingHorizontal: sereneSpacing['space-md'],
              paddingVertical: s(10),
              borderRadius: sereneBorderRadius.full,
              backgroundColor: sereneColors['primary-container'],
              flexDirection: 'row',
              alignItems: 'center',
              gap: s(6),
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <MaterialCommunityIcons name="auto-fix" size={s(18)} color={sereneColors['on-primary']} />
            <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}>
              {status === 'ready' ? 'Sugerir de nuevo' : cta}
            </RNText>
          </Pressable>
        )}

        {(status === 'error' || status === 'offline') && onRetry && (
          <Pressable
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel="Reintentar"
            style={({ pressed }) => ({
              minHeight: s(44),
              paddingHorizontal: sereneSpacing['space-md'],
              paddingVertical: s(10),
              borderRadius: sereneBorderRadius.full,
              backgroundColor: sereneColors['surface-container-high'],
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-surface'] }]}>
              Reintentar
            </RNText>
          </Pressable>
        )}
      </View>
    </View>
  );
}
