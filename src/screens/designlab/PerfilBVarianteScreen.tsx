// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React from 'react';
import { View, ScrollView, Text as RNText, type TextStyle } from 'react-native';
import { useBottomLayout } from '../../theme/layout';
import DesignLabHeader from '../../components/designlab/DesignLabHeader';
import PerfilStateDemoControl from '../../components/designlab/perfil/PerfilStateDemoControl';
import PerfilIdentityBlock from '../../components/designlab/perfil/PerfilIdentityBlock';
import PerfilSettingsRow from '../../components/designlab/perfil/PerfilSettingsRow';
import PerfilPrimaryButton from '../../components/designlab/perfil/PerfilPrimaryButton';
import PerfilPrivacySheet from '../../components/designlab/perfil/PerfilPrivacySheet';
import PerfilLogoutSheet from '../../components/designlab/perfil/PerfilLogoutSheet';
import { perfilCopy, type PerfilStatusTone } from './perfilFixtures';
import { usePerfilPreview } from './usePerfilPreview';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
} from '../../theme/serene';

function statusValueTone(tone: PerfilStatusTone): 'default' | 'positive' | 'error' {
  if (tone === 'error') return 'error';
  if (tone === 'positive') return 'positive';
  return 'default';
}

/**
 * Grupo de ajustes estilo nativo: etiqueta de seccion + contenedor redondeado
 * con filas separadas por divisores. Solo lo usa la Variante B.
 */
function PerfilGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: sereneSpacing['space-xs'] }}>
      <RNText
        style={[
          sereneTypography['label-sm'] as TextStyle,
          {
            color: sereneColors['on-surface-variant'],
            textTransform: 'uppercase',
            letterSpacing: 0.6,
            marginLeft: sereneSpacing['space-sm'],
          },
        ]}
      >
        {label}
      </RNText>
      <View
        style={{
          borderRadius: sereneBorderRadius.xl,
          backgroundColor: sereneColors['surface-container-lowest'],
          overflow: 'hidden',
          ...sereneShadows.card,
        }}
      >
        {children}
      </View>
    </View>
  );
}

/**
 * Variante B — "Ajustes estilo nativo".
 *
 * Lista agrupada de filas (icono + titulo + valor + accesorio), al estilo de los
 * ajustes del sistema: cada seccion con su etiqueta y cada fila con su accion.
 * La unica accion primaria es "Sincronizar ahora", dibujada como fila rellena.
 */
export default function PerfilBVarianteScreen() {
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
          gap: sereneSpacing['space-lg'],
        }}
        showsVerticalScrollIndicator={false}
      >
        <PerfilStateDemoControl state={p.state} onChange={p.setState} />

        <PerfilGroup label={identity.accountSectionTitle}>
          <View style={{ padding: sereneSpacing['space-md'] }}>
            <PerfilIdentityBlock
              isGuest={p.view.isGuest}
              copy={identity}
              onGuestCta={p.onGuestCta}
            />
          </View>
          <PerfilSettingsRow
            title={metrics.activeDaysTitle}
            subtitle={`${metrics.activeDaysMonthCaption}: ${p.activeDaysMonth}`}
            value={`${p.activeDaysWeek} de 7`}
          />
          <PerfilSettingsRow
            title={metrics.stepsTitle}
            subtitle={metrics.stepsCaption}
            value={String(p.stepsTotal)}
          />
          <PerfilSettingsRow
            icon="trophy-outline"
            title={achievements.title}
            value={achievements.value}
            accessory="chevron"
            showDivider={false}
            onPress={() => console.log('[DesignLab] Perfil — logros')}
          />
        </PerfilGroup>

        <PerfilGroup label={reminder.sectionTitle}>
          <PerfilSettingsRow
            icon="bell-outline"
            title={reminder.title}
            subtitle={reminder.caption}
            value={reminder.hour}
            accessory="switch"
            switchValue={p.reminderEnabled}
            onToggleSwitch={p.setReminderEnabled}
            showDivider={false}
          />
        </PerfilGroup>

        <PerfilGroup label={sync.sectionTitle}>
          <PerfilSettingsRow
            title={sync.statusRowLabel}
            value={p.view.statusLabel}
            valueTone={statusValueTone(p.view.statusTone)}
            showDivider={!p.view.isGuest}
          />
          {p.view.isGuest ? (
            <View style={{ padding: sereneSpacing['space-md'] }}>
              <RNText
                style={[
                  sereneTypography['body-md'] as TextStyle,
                  { color: sereneColors['on-surface-variant'] },
                ]}
              >
                {sync.guestBody}
              </RNText>
            </View>
          ) : (
            <>
              <PerfilSettingsRow
                title={sync.lastSyncRowLabel}
                value={p.view.lastSyncLabel}
                showDivider={p.view.conflictsCount > 0}
              />
              {p.view.conflictsCount > 0 ? (
                <PerfilSettingsRow
                  icon="alert-circle-outline"
                  title={sync.conflictsRowLabel}
                  value={String(p.view.conflictsCount)}
                  valueTone="error"
                  accessory="chevron"
                  showDivider={false}
                  onPress={p.onPressConflicts}
                />
              ) : null}
              <View style={{ padding: sereneSpacing['space-md'] }}>
                <PerfilPrimaryButton
                  label={p.view.syncStatus === 'error' ? sync.retryCta : sync.syncCta}
                  icon={p.view.syncStatus === 'error' ? 'refresh' : 'sync'}
                  loading={p.view.syncStatus === 'syncing'}
                  disabled={p.view.syncStatus === 'syncing'}
                  onPress={p.onSync}
                />
              </View>
            </>
          )}
        </PerfilGroup>

        <PerfilGroup label={account.sectionTitle}>
          <PerfilSettingsRow
            icon="help-circle-outline"
            title={account.support}
            accessory="chevron"
            onPress={p.onSupport}
          />
          <PerfilSettingsRow
            icon="shield-lock-outline"
            title={account.privacy}
            accessory="chevron"
            onPress={() => p.setPrivacyVisible(true)}
          />
          <PerfilSettingsRow
            icon="information-outline"
            title={account.versionRowLabel}
            value={p.appVersion}
            showDivider={!p.view.isGuest}
          />
          {!p.view.isGuest ? (
            <PerfilSettingsRow
              icon="logout"
              title={account.logout}
              destructive
              showDivider={false}
              onPress={() => p.setLogoutVisible(true)}
            />
          ) : null}
        </PerfilGroup>
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
