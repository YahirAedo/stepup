// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React from 'react';
import { View, ScrollView, Text as RNText, type TextStyle } from 'react-native';
import { useBottomLayout } from '../../theme/layout';
import DesignLabHeader from '../../components/designlab/DesignLabHeader';
import PerfilStateDemoControl from '../../components/designlab/perfil/PerfilStateDemoControl';
import PerfilCard from '../../components/designlab/perfil/PerfilCard';
import PerfilIdentityBlock from '../../components/designlab/perfil/PerfilIdentityBlock';
import PerfilSettingsRow from '../../components/designlab/perfil/PerfilSettingsRow';
import PerfilDataSyncBlock from '../../components/designlab/perfil/PerfilDataSyncBlock';
import PerfilPrivacySheet from '../../components/designlab/perfil/PerfilPrivacySheet';
import PerfilLogoutSheet from '../../components/designlab/perfil/PerfilLogoutSheet';
import { activeDaysRatioLabel } from '../../utils/profileActivity';
import { perfilCopy } from './perfilFixtures';
import { usePerfilPreview } from './usePerfilPreview';
import { sereneColors, sereneTypography, sereneSpacing } from '../../theme/serene';

/**
 * Variante C — "Resumen + datos primero".
 *
 * Cabecera de resumen compacta (identidad + métricas en una línea) y, apenas
 * debajo, el estado de los datos (sincronización) como primer bloque, para que
 * el estado de la cuenta sea lo primero que se lee.
 */
export default function PerfilCVarianteScreen() {
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

        {/* Cabecera de resumen */}
        <PerfilCard>
          <View style={{ gap: sereneSpacing['space-lg'] }}>
            <PerfilIdentityBlock
              isGuest={p.view.isGuest}
              copy={identity}
              onGuestCta={p.onGuestCta}
            />

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: sereneSpacing['space-lg'] }}>
              <View style={{ gap: 2 }}>
                <RNText
                  style={[
                    sereneTypography['headline-sm'] as TextStyle,
                    { color: sereneColors['on-surface'] },
                  ]}
                >
                  {activeDaysRatioLabel(p.activeDaysWeek, 7)}
                </RNText>
                <RNText
                  style={[
                    sereneTypography['label-sm'] as TextStyle,
                    { color: sereneColors['on-surface-variant'] },
                  ]}
                >
                  {`${metrics.activeDaysTitle} · ${metrics.activeDaysWeekCaption}`}
                </RNText>
              </View>

              <View style={{ gap: 2 }}>
                <RNText
                  style={[
                    sereneTypography['headline-sm'] as TextStyle,
                    { color: sereneColors['on-surface'] },
                  ]}
                >
                  {String(p.stepsTotal)}
                </RNText>
                <RNText
                  style={[
                    sereneTypography['label-sm'] as TextStyle,
                    { color: sereneColors['on-surface-variant'] },
                  ]}
                >
                  {metrics.stepsTitle}
                </RNText>
              </View>
            </View>
          </View>
        </PerfilCard>

        {/* Primer bloque de contenido: datos y sincronización */}
        <PerfilCard title={sync.sectionTitle}>
          <PerfilDataSyncBlock
            view={p.view}
            copy={sync}
            onSync={p.onSync}
            onPressConflicts={p.onPressConflicts}
          />
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
