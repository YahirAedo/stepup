// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React from 'react';
import { View, ScrollView, Text as RNText, type TextStyle } from 'react-native';
import { useBottomLayout } from '../../theme/layout';
import AuthStateDemoControl from '../../components/designlab/auth/AuthStateDemoControl';
import AuthTextField from '../../components/designlab/auth/AuthTextField';
import AuthButton from '../../components/designlab/auth/AuthButton';
import AuthTextLink from '../../components/designlab/auth/AuthTextLink';
import AuthOfflineBanner from '../../components/designlab/auth/AuthOfflineBanner';
import ConfirmDialog from '../../components/designlab/ConfirmDialog';
import { useLoginPreview } from './useAuthPreview';
import { loginAFixtures } from './authAFixtures';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  withAlpha,
  useResponsive,
} from '../../theme/serene';

const f = loginAFixtures;

/**
 * Login A — 6 estados del Design Lab (selector solo Lab):
 * normal | error | cargando | sinConexion | cambioCuentaConCambios | cambioCuentaSinCambios
 *
 * Encabezado: solo "StepUp" a la izquierda, sin flecha.
 * Estado error: mensaje debajo de los campos (antes del botón principal),
 * con ícono de error, AMBOS campos marcados error, accessibilityRole="alert".
 * Cargando: spinner nativo en botón + "Iniciando sesión…"; campos atenuados;
 * "Seguir sin cuenta" ACTIVO; "Crear cuenta" atenuado.
 * Sin conexión: banner con wifi-off, "Iniciar sesión" deshabilitado,
 * "Crear cuenta" deshabilitado, "Seguir sin cuenta" como principal.
 * Diálogo cambio de cuenta: ConfirmDialog con emphasis="cancel".
 */
export default function LoginAScreen() {
  const { contentPaddingBottom } = useBottomLayout();
  const { scale: s } = useResponsive();
  const {
    state,
    setState,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    dialogVisible,
    dialogHasPending,
    isLoading,
    isOffline,
    hasError,
    onSubmit,
    onGuest,
    onCloseDialog,
    onConfirmDelete,
  } = useLoginPreview();

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      {/* Header solo "StepUp", sin back ni avatar */}
      <View
        style={{
          paddingTop: 0,
          height: s(56),
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingHorizontal: sereneSpacing.margin,
          backgroundColor: sereneColors.surface,
        }}
      >
        <RNText
          style={[
            sereneTypography['title-md'] as TextStyle,
            { color: sereneColors['on-surface'] },
          ]}
        >
          {f.headerTitle}
        </RNText>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.margin,
          paddingTop: sereneSpacing['space-md'],
          paddingBottom: contentPaddingBottom + sereneSpacing['space-lg'],
          gap: sereneSpacing['space-md'],
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Selector de estado (solo Lab) */}
        <AuthStateDemoControl
          flow="login"
          state={state}
          onChange={setState}
          onIndex={() => console.log('[DesignLab] Login — volver al índice')}
        />

        {/* Banner offline */}
        {isOffline && (
          <AuthOfflineBanner title={f.offline.title} body={f.offline.body} />
        )}

        {/* Título y subtítulo */}
        <RNText style={[sereneTypography['headline-lg'] as TextStyle, { color: sereneColors['on-surface'] }]}>
          {f.title}
        </RNText>
        <RNText style={[sereneTypography['body-md'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}>
          {f.subtitle}
        </RNText>

        {/* Campos */}
        <AuthTextField
          label={f.fields.email.label}
          value={email}
          onChangeText={setEmail}
          symbol="mail"
          placeholder={f.fields.email.placeholder}
          error={hasError}
          disabled={isLoading}
          inputProps={{
            keyboardType: 'email-address',
            autoCapitalize: 'none',
            autoComplete: 'email',
            textContentType: 'emailAddress',
            returnKeyType: 'next',
          }}
        />

        <AuthTextField
          label={f.fields.password.label}
          value={password}
          onChangeText={setPassword}
          symbol="lock"
          placeholder={f.fields.password.placeholder}
          error={hasError}
          disabled={isLoading}
          passwordToggle={{
            visible: showPassword,
            onToggle: () => setShowPassword((v) => !v),
            showLabel: f.a11y.showPassword,
            hideLabel: f.a11y.hidePassword,
          }}
          inputProps={{
            secureTextEntry: !showPassword,
            autoComplete: 'current-password',
            textContentType: 'password',
            returnKeyType: 'go',
          }}
        />

        {/* Mensaje de error (debajo de campos, antes del botón principal) */}
        {hasError && (
          <View
            accessibilityRole="alert"
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: sereneSpacing['space-sm'],
              padding: sereneSpacing['space-sm'],
              borderRadius: sereneBorderRadius.lg,
              backgroundColor: withAlpha(sereneColors['error-container'], 0.4),
            }}
          >
            <RNText
              style={[
                sereneTypography['body-md'] as TextStyle,
                { color: sereneColors.error, marginTop: s(1) },
              ]}
            >
              {f.errorMessage}
            </RNText>
          </View>
        )}

        {/* Caption de cargando */}
        {isLoading && (
          <RNText
            style={[
              sereneTypography['body-sm'] as TextStyle,
              { color: sereneColors['on-surface-variant'], textAlign: 'center' },
            ]}
          >
            {f.loadingCaption}
          </RNText>
        )}

        {/* Botón principal */}
        <AuthButton
          label={isLoading ? f.loading : f.primary}
          onPress={onSubmit}
          disabled={isLoading || isOffline}
          loading={isLoading}
        />

        {/* Botón secundario "Seguir sin cuenta" — ACTIVO en cargando */}
        <AuthButton
          label={f.secondary}
          onPress={onGuest}
          variant="outline"
          disabled={isOffline}
        />
        <RNText
          style={[
            sereneTypography['body-sm'] as TextStyle,
            { color: sereneColors['on-surface-variant'], textAlign: 'center' },
          ]}
        >
          {f.secondaryCaption}
        </RNText>

        {/* Footer link */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: sereneSpacing['space-xs'] }}>
          <RNText
            style={[
              sereneTypography['body-md'] as TextStyle,
              { color: sereneColors['on-surface-variant'] },
            ]}
          >
            {f.footerQuestion}
          </RNText>
          <AuthTextLink
            label={f.footerLink}
            onPress={() => console.log('[DesignLab] Login — navegar a Registro')}
            disabled={isLoading}
          />
        </View>
      </ScrollView>

      {/* Diálogo de cambio de cuenta (ConfirmDialog con emphasis="cancel") */}
      <ConfirmDialog
        visible={dialogVisible}
        title={f.dialog.title}
        body={dialogHasPending ? f.dialog.bodyWithPending : f.dialog.bodyClean}
        confirmLabel={f.dialog.confirmLabel}
        cancelLabel={f.dialog.cancelLabel}
        destructive={true}
        emphasis="cancel"
        onConfirm={onConfirmDelete}
        onClose={onCloseDialog}
      />
    </View>
  );
}