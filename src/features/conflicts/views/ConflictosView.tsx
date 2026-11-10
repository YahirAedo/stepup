import React, { useState } from 'react';
import { View, ScrollView, Pressable, Text as RNText, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  useResponsive,
} from '../../../theme/serene';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import PerfilPrimaryButton from '../../../components/ui/PerfilPrimaryButton';
import { conflictosCopy, conflictosRemainingLabel } from '../logic/conflictosCopy';
import type { ConflictItemView } from '../logic/buildConflictItems';

export interface ConflictosViewProps {
  items: ConflictItemView[];
  loading: boolean;
  error: boolean;
  busyIds: Set<number>;
  onResolve: (id: number, side: 'local' | 'server') => void;
  onBack: () => void;
  onReload: () => void;
}

export default function ConflictosView({ items, loading, error, busyIds, onResolve, onBack, onReload }: ConflictosViewProps) {
  const { scale: s, isTablet } = useResponsive();
  const [confirm, setConfirm] = useState<{ id: number; side: 'local' | 'server'; name: string } | null>(null);

  const pending = items;

  const handleChoose = (id: number, side: 'local' | 'server', name: string) => {
    setConfirm({ id, side, name });
  };

  const handleConfirm = () => {
    if (!confirm) return;
    const { id, side } = confirm;
    setConfirm(null);
    void onResolve(id, side);
  };

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <ScreenHeader variant="detail" title={conflictosCopy.headerTitle} onBack={onBack} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.margin,
          paddingBottom: sereneSpacing['space-lg'],
          gap: sereneSpacing['space-lg'],
        }}
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <View style={{ gap: sereneSpacing['space-sm'] }}>
            <RNText accessibilityLiveRegion="polite" style={[sereneTypography['body-md'] as TextStyle, { color: sereneColors.error }]}>
              No se pudieron cargar los conflictos.
            </RNText>
            <Pressable onPress={onReload} accessibilityRole="button" accessibilityLabel="Reintentar" style={({ pressed }) => ({ minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: sereneBorderRadius.lg, backgroundColor: sereneColors.primary, opacity: pressed ? 0.9 : 1 })}>
              <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}>Reintentar</RNText>
            </Pressable>
          </View>
        ) : null}

        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: sereneSpacing['space-xl'] }}>
            <RNText style={[sereneTypography['body-md'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}>Cargando…</RNText>
          </View>
        ) : pending.length === 0 ? (
          <View style={{ alignItems: 'center', gap: sereneSpacing['space-md'], paddingTop: sereneSpacing['space-xl'] }}>
            <View style={{ width: s(72), height: s(72), borderRadius: s(36), alignItems: 'center', justifyContent: 'center', backgroundColor: sereneColors['primary-fixed'] }}>
              <MaterialCommunityIcons name="check-circle-outline" size={s(36)} color={sereneColors.primary} importantForAccessibility="no" accessibilityElementsHidden />
            </View>
            <RNText style={[sereneTypography['headline-sm'] as TextStyle, { color: sereneColors.primary }]}>
              {conflictosCopy.emptyTitle}
            </RNText>
            <RNText style={[sereneTypography['body-md'] as TextStyle, { color: sereneColors['on-surface-variant'], textAlign: 'center' }]}>
              {conflictosCopy.emptyBody}
            </RNText>
            <View style={{ width: '100%', marginTop: sereneSpacing['space-sm'] }}>
              <PerfilPrimaryButton label={conflictosCopy.backCta} icon="arrow-left" onPress={onBack} />
            </View>
          </View>
        ) : (
          <>
            <View style={{ gap: sereneSpacing['space-xs'] }}>
              <RNText style={[sereneTypography['body-md'] as TextStyle, { color: sereneColors['on-surface'] }]}>
                {conflictosCopy.intro}
              </RNText>
              <RNText style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}>
                {conflictosRemainingLabel(pending.length)}
              </RNText>
            </View>

            {pending.map((item) => {
              const busy = busyIds.has(item.id);
              return (
                <View key={item.id} style={{ gap: sereneSpacing['space-sm'] }}>
                  <RNText style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'], textTransform: 'uppercase' }]}>
                    {`${item.kind} ${conflictosCopy.kindSuffix}`}
                  </RNText>
                  <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: sereneSpacing['space-md'], borderWidth: 1, borderColor: sereneColors['outline-variant'], borderRadius: sereneBorderRadius.xl, backgroundColor: sereneColors.surface, padding: sereneSpacing['space-xs'] }}>
                    <VersionCard
                      side="local"
                      label={conflictosCopy.localLabel}
                      icon="cellphone"
                      version={item.local}
                      actionLabel={conflictosCopy.localAction}
                      busy={busy}
                      onChoose={() => handleChoose(item.id, 'local', item.local.name)}
                    />
                    <VersionCard
                      side="server"
                      label={conflictosCopy.serverLabel}
                      icon="cloud-outline"
                      version={item.server}
                      actionLabel={conflictosCopy.serverAction}
                      busy={busy}
                      onChoose={() => handleChoose(item.id, 'server', item.server.name)}
                    />
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      <ConfirmDialog
        visible={confirm !== null}
        title={conflictosCopy.confirmTitle}
        body={confirm ? (confirm.side === 'local' ? conflictosCopy.confirmLocalMessage(confirm.name) : conflictosCopy.confirmServerMessage(confirm.name)) : ''}
        confirmLabel={conflictosCopy.confirmLabel}
        cancelLabel={conflictosCopy.cancelLabel}
        onConfirm={handleConfirm}
        onClose={() => setConfirm(null)}
      />
    </View>
  );
}

function VersionCard({
  side,
  label,
  icon,
  version,
  actionLabel,
  busy,
  onChoose,
}: {
  side: 'local' | 'server';
  label: string;
  icon: string;
  version: { name: string; statusLabel: string; modifiedLabel: string };
  actionLabel: string;
  busy: boolean;
  onChoose: () => void;
}) {
  const { scale: s } = useResponsive();
  const accentColor = side === 'local' ? sereneColors['surface-tint'] : sereneColors.secondary;

  return (
    <View style={{ flex: 1, gap: sereneSpacing['space-sm'], padding: sereneSpacing['space-md'], borderRadius: sereneBorderRadius.xl, borderLeftWidth: 4, borderLeftColor: accentColor, backgroundColor: sereneColors['surface-container-lowest'], ...sereneShadows.card }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: sereneSpacing['space-sm'] }}>
        <MaterialCommunityIcons name={icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']} size={s(18)} color={sereneColors['on-surface-variant']} importantForAccessibility="no" accessibilityElementsHidden />
        <RNText style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'], textTransform: 'uppercase' }]}>
          {label}
        </RNText>
      </View>

      <RNText numberOfLines={2} style={[sereneTypography['body-md'] as TextStyle, { color: sereneColors['on-surface'], fontWeight: '600' }]}>
        {version.name}
      </RNText>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: sereneSpacing['space-xs'] }}>
        <MaterialCommunityIcons name="clock-outline" size={s(14)} color={sereneColors['on-surface-variant']} importantForAccessibility="no" accessibilityElementsHidden />
        <RNText style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}>
          {version.modifiedLabel}
        </RNText>
      </View>

      <RNText style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors.secondary }]}>
        {version.statusLabel}
      </RNText>

      <Pressable
        onPress={onChoose}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel={`${side === 'local' ? 'Conservar esta versión de' : 'Conservar la versión de la nube de'} ${version.name}`}
        style={({ pressed }) => ({
          minHeight: s(48),
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: sereneSpacing['space-xs'],
          borderRadius: sereneBorderRadius.lg,
          backgroundColor: sereneColors['surface-container-high'],
          opacity: pressed || busy ? 0.85 : 1,
        })}
      >
        <RNText style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface'] }]}>
          {actionLabel}
        </RNText>
      </Pressable>
    </View>
  );
}
