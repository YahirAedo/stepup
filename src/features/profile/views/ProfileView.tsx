import React from 'react';
import { View, ScrollView, Text as RNText, ActivityIndicator, Pressable, type TextStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
} from '../../../theme/serene';
import PerfilCard from '../../../components/ui/PerfilCard';
import PerfilIdentityBlock from '../../../components/ui/PerfilIdentityBlock';
import PerfilMetricsGrid from '../../../components/ui/PerfilMetricsGrid';
import PerfilSettingsRow from '../../../components/ui/PerfilSettingsRow';
import PerfilDataSyncBlock from '../../../components/ui/PerfilDataSyncBlock';
import PerfilPrivacySheet from '../../../components/ui/PerfilPrivacySheet';
import PerfilLogoutSheet from '../../../components/ui/PerfilLogoutSheet';
import { perfilCopy } from '../logic/perfilCopy';
import type { PerfilView } from '../logic/perfilCopy';

export interface ProfileMetricsView {
  activeDaysWeek: number;
  activeDaysMonth: number;
  stepsTotal: number;
}

export interface ProfileViewProps {
  view: PerfilView;
  metrics: ProfileMetricsView;
  user: { name: string | null; email: string | null } | null;
  loading: boolean;
  error: boolean;
  syncing: boolean;
  onSync: () => void;
  onRetry: () => void;
  onGuestCta: () => void;
  onPressConflicts: () => void;
  onPressBadges: () => void;
  onPressPrivacy: () => void;
  onPressLogout: () => void;
  appVersion: string;
  privacyVisible: boolean;
  logoutVisible: boolean;
  onClosePrivacy: () => void;
  onCloseLogout: () => void;
  onConfirmLogout: () => void;
}

export default function ProfileView({
  view,
  metrics,
  user,
  loading,
  error,
  onSync,
  onRetry,
  onGuestCta,
  onPressConflicts,
  onPressBadges,
  onPressPrivacy,
  onPressLogout,
  appVersion,
  privacyVisible,
  logoutVisible,
  onClosePrivacy,
  onCloseLogout,
  onConfirmLogout,
}: ProfileViewProps) {
  const insets = useSafeAreaInsets();

  if (loading) {
    return (
      <View
        accessible
        accessibilityLabel="Cargando tu perfil…"
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: sereneColors.surface }}
      >
        <ActivityIndicator color={sereneColors.primary} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden />
        <RNText style={[sereneTypography['body-md'] as TextStyle, { color: sereneColors['on-surface-variant'], marginTop: sereneSpacing['space-sm'] }]}>
          Cargando tu perfil…
        </RNText>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: sereneSpacing.margin,
          paddingBottom: sereneSpacing['space-lg'],
          backgroundColor: sereneColors.surface,
          gap: sereneSpacing['space-md'],
        }}
      >
        <RNText style={[sereneTypography['body-md'] as TextStyle, { color: sereneColors['on-surface-variant'], textAlign: 'center' }]}>
          No se pudo cargar tu perfil.
        </RNText>
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Reintentar"
          style={({ pressed }) => ({
            minHeight: 48,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: sereneSpacing['space-sm'],
            paddingVertical: sereneSpacing['space-sm'],
            paddingHorizontal: sereneSpacing['space-md'],
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: sereneColors.primary,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}>
            Reintentar
          </RNText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <View style={{ paddingTop: insets.top + sereneSpacing['space-md'], paddingHorizontal: sereneSpacing.margin, paddingBottom: sereneSpacing['space-sm'] }}>
        <RNText style={[sereneTypography['headline-md'] as TextStyle, { color: sereneColors['on-surface'] }]}>
          {perfilCopy.headerTitle}
        </RNText>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.margin,
          paddingBottom: sereneSpacing['space-lg'],
          gap: sereneSpacing['space-md'],
        }}
        showsVerticalScrollIndicator={false}
      >
        <PerfilCard>
          <View style={{ gap: sereneSpacing['space-lg'] }}>
            <PerfilIdentityBlock
              isGuest={view.isGuest}
              copy={perfilCopy.identity}
              name={user?.name ?? null}
              email={user?.email ?? null}
              onGuestCta={onGuestCta}
            />
            <PerfilMetricsGrid
              copy={perfilCopy.metrics}
              activeDaysWeek={metrics.activeDaysWeek}
              activeDaysMonth={metrics.activeDaysMonth}
              stepsTotal={metrics.stepsTotal}
            />
          </View>
        </PerfilCard>

        <PerfilCard>
          <PerfilSettingsRow
            icon="trophy-outline"
            title={perfilCopy.achievements.title}
            subtitle={perfilCopy.achievements.caption}
            accessory="chevron"
            showDivider={false}
            horizontalInset={false}
            onPress={onPressBadges}
          />
        </PerfilCard>

        <PerfilCard title={perfilCopy.sync.sectionTitle}>
          <PerfilDataSyncBlock
            view={view}
            copy={perfilCopy.sync}
            onSync={onSync}
            onPressConflicts={onPressConflicts}
          />
        </PerfilCard>

        <PerfilCard title={perfilCopy.identity.accountSectionTitle}>
          <PerfilSettingsRow
            icon="shield-lock-outline"
            title={perfilCopy.account.privacy}
            subtitle={perfilCopy.account.privacyCaption}
            accessory="chevron"
            horizontalInset={false}
            onPress={onPressPrivacy}
          />
          <PerfilSettingsRow
            icon="information-outline"
            title={perfilCopy.account.versionRowLabel}
            value={appVersion}
            accessory="none"
            horizontalInset={false}
            showDivider={!view.isGuest}
          />
          {!view.isGuest ? (
            <PerfilSettingsRow
              icon="logout"
              title={perfilCopy.account.logout}
              destructive
              accessory="none"
              horizontalInset={false}
              showDivider={false}
              onPress={onPressLogout}
            />
          ) : null}
        </PerfilCard>
      </ScrollView>

      <PerfilPrivacySheet visible={privacyVisible} onClose={onClosePrivacy} />
      <PerfilLogoutSheet visible={logoutVisible} onClose={onCloseLogout} onConfirm={onConfirmLogout} />
    </View>
  );
}
