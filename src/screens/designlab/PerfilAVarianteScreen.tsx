// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React from 'react';
import { View, ScrollView } from 'react-native';
import { useBottomLayout } from '../../theme/layout';
import DesignLabHeader from '../../components/designlab/DesignLabHeader';
import PerfilStateDemoControl from '../../components/designlab/perfil/PerfilStateDemoControl';
import PerfilCard from '../../components/designlab/perfil/PerfilCard';
import PerfilIdentityBlock from '../../components/designlab/perfil/PerfilIdentityBlock';
import PerfilMetricsGrid from '../../components/designlab/perfil/PerfilMetricsGrid';
import PerfilSettingsRow from '../../components/designlab/perfil/PerfilSettingsRow';
import PerfilDataSyncBlock from '../../components/designlab/perfil/PerfilDataSyncBlock';
import PerfilPrivacySheet from '../../components/designlab/perfil/PerfilPrivacySheet';
import PerfilLogoutSheet from '../../components/designlab/perfil/PerfilLogoutSheet';
import { perfilCopy } from './perfilFixtures';
import { usePerfilPreview } from './usePerfilPreview';
import { sereneColors, sereneSpacing } from '../../theme/serene';

/**
 * Variante A — "Tarjetas por sección".
 *
 * Toma el mockup de Stitch y lo simplifica en tarjetas apiladas: identidad +
 * métricas, logros, datos y sincronización, recordatorios y cuenta. Un único
 * CTA primario ("Sincronizar ahora"; en invitado, "Crear cuenta").
 */
export default function PerfilAVarianteScreen() {
  const { insets } = useBottomLayout();
  const p = usePerfilPreview();
  const { identity, metrics, achievements, sync, reminder, account } = perfilCopy;

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <DesignLabHeader title={perfilCopy.headerTitle} showAvatar={false} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.margin,
          paddingTop: sereneSpacing['space-md'],
          paddingBottom: insets.bottom + sereneSpacing['space-lg'],
          gap: sereneSpacing['space-md'],
        }}
        showsVerticalScrollIndicator={false}
      >
        <PerfilStateDemoControl state={p.state} onChange={p.setState} />

        <PerfilCard>
          <View style={{ gap: sereneSpacing['space-lg'] }}>
            <PerfilIdentityBlock
              isGuest={p.view.isGuest}
              copy={identity}
              onGuestCta={p.onGuestCta}
            />
            <PerfilMetricsGrid
              copy={metrics}
              activeDaysWeek={p.activeDaysWeek}
              activeDaysMonth={p.activeDaysMonth}
              stepsTotal={p.stepsTotal}
            />
          </View>
        </PerfilCard>

        <PerfilCard>
          <PerfilSettingsRow
            icon="trophy-outline"
            title={achievements.title}
            subtitle={achievements.caption}
            value={achievements.value}
            accessory="chevron"
            showDivider={false}
            horizontalInset={false}
            onPress={() => console.log('[DesignLab] Perfil — logros')}
          />
        </PerfilCard>

        <PerfilCard title={sync.sectionTitle}>
          <PerfilDataSyncBlock
            view={p.view}
            copy={sync}
            onSync={p.onSync}
            onPressConflicts={p.onPressConflicts}
          />
        </PerfilCard>

        <PerfilCard title={reminder.sectionTitle}>
          <PerfilSettingsRow
            icon="bell-outline"
            title={reminder.title}
            subtitle={reminder.caption}
            value={reminder.hour}
            accessory="switch"
            switchValue={p.reminderEnabled}
            onToggleSwitch={p.setReminderEnabled}
            showDivider={false}
            horizontalInset={false}
          />
        </PerfilCard>

        <PerfilCard title={account.sectionTitle}>
          <PerfilSettingsRow
            icon="help-circle-outline"
            title={account.support}
            subtitle={account.supportCaption}
            accessory="chevron"
            horizontalInset={false}
            onPress={p.onSupport}
          />
          <PerfilSettingsRow
            icon="shield-lock-outline"
            title={account.privacy}
            subtitle={account.privacyCaption}
            accessory="chevron"
            horizontalInset={false}
            onPress={() => p.setPrivacyVisible(true)}
          />
          <PerfilSettingsRow
            icon="information-outline"
            title={account.versionRowLabel}
            value={p.appVersion}
            accessory="none"
            horizontalInset={false}
            showDivider={!p.view.isGuest}
          />
          {!p.view.isGuest ? (
            <PerfilSettingsRow
              icon="logout"
              title={account.logout}
              destructive
              accessory="none"
              horizontalInset={false}
              showDivider={false}
              onPress={() => p.setLogoutVisible(true)}
            />
          ) : null}
        </PerfilCard>
      </ScrollView>

      <PerfilPrivacySheet visible={p.privacyVisible} onClose={() => p.setPrivacyVisible(false)} />
      <PerfilLogoutSheet
        visible={p.logoutVisible}
        onClose={() => p.setLogoutVisible(false)}
        onConfirm={p.onConfirmLogout}
      />
    </View>
  );
}
