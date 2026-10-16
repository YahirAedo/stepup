import React from 'react';
import { Pressable, Text as RNText, View, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  useResponsive,
} from '../../../theme/serene';
import PerfilPrimaryButton from './PerfilPrimaryButton';
import type {
  PerfilCopy,
  PerfilStatusTone,
  PerfilView,
} from '../../../screens/designlab/perfilFixtures';

export interface PerfilDataSyncBlockProps {
  view: PerfilView;
  copy: PerfilCopy['sync'];
  onSync: () => void;
  onPressConflicts: () => void;
}

function toneColor(tone: PerfilStatusTone): string {
  switch (tone) {
    case 'positive':
      return sereneColors.primary;
    case 'error':
      return sereneColors.error;
    case 'neutral':
    default:
      return sereneColors.outline;
  }
}

/**
 * Bloque "Datos y sincronizacion": estado, ultima sincronizacion, la fila de
 * conflictos (solo si hay) y el CTA de sincronizar. En estado invitado muestra
 * el aviso y deja el boton principal a la identidad ("Crear cuenta").
 *
 * No trae fondo propio: se monta dentro de la card (A), la fila nativa (B) o el
 * bloque de cabecera (C).
 */
export default function PerfilDataSyncBlock({
  view,
  copy,
  onSync,
  onPressConflicts,
}: PerfilDataSyncBlockProps) {
  const { scale: s } = useResponsive();
  const hasConflicts = view.conflictsCount > 0;

  return (
    <View style={{ gap: sereneSpacing['space-md'] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: sereneSpacing['space-sm'] }}>
        <View
          style={{
            width: s(10),
            height: s(10),
            borderRadius: sereneBorderRadius.full,
            backgroundColor: toneColor(view.statusTone),
          }}
        />
        <RNText
          style={[
            sereneTypography['label-lg'] as TextStyle,
            { color: sereneColors['on-surface'], flex: 1 },
          ]}
        >
          {view.statusLabel}
        </RNText>
      </View>

      {view.isGuest ? (
        <RNText
          style={[
            sereneTypography['body-md'] as TextStyle,
            { color: sereneColors['on-surface-variant'] },
          ]}
        >
          {copy.guestBody}
        </RNText>
      ) : (
        <>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: s(8) }}
          >
            <RNText
              style={[
                sereneTypography['body-md'] as TextStyle,
                { color: sereneColors['on-surface-variant'] },
              ]}
            >
              {copy.lastSyncRowLabel}
            </RNText>
            <RNText
              style={[sereneTypography['body-md'] as TextStyle, { color: sereneColors['on-surface'] }]}
            >
              {view.lastSyncLabel}
            </RNText>
          </View>

          {hasConflicts ? (
            <Pressable
              onPress={onPressConflicts}
              accessibilityRole="button"
              accessibilityLabel={`${copy.conflictsRowLabel} (${view.conflictsCount})`}
              style={({ pressed }) => ({
                minHeight: s(44),
                flexDirection: 'row',
                alignItems: 'center',
                gap: sereneSpacing['space-sm'],
                padding: sereneSpacing['space-sm'],
                borderRadius: sereneBorderRadius.lg,
                backgroundColor: sereneColors['error-container'],
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={s(22)}
                color={sereneColors['on-error-container']}
              />
              <View style={{ flex: 1 }}>
                <RNText
                  style={[
                    sereneTypography['label-lg'] as TextStyle,
                    { color: sereneColors['on-error-container'] },
                  ]}
                >
                  {`${copy.conflictsRowLabel} (${view.conflictsCount})`}
                </RNText>
                <RNText
                  style={[
                    sereneTypography['body-sm'] as TextStyle,
                    { color: sereneColors['on-error-container'] },
                  ]}
                >
                  {copy.conflictsHint}
                </RNText>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={s(22)}
                color={sereneColors['on-error-container']}
              />
            </Pressable>
          ) : null}

          <PerfilPrimaryButton
            label={view.syncStatus === 'error' ? copy.retryCta : copy.syncCta}
            icon={view.syncStatus === 'error' ? 'refresh' : 'sync'}
            loading={view.syncStatus === 'syncing'}
            disabled={view.syncStatus === 'syncing'}
            onPress={onSync}
          />
        </>
      )}
    </View>
  );
}
