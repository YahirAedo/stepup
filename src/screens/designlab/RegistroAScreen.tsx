// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React from 'react';
import { View, ScrollView, Text as RNText, type TextStyle } from 'react-native';
import { useBottomLayout } from '../../theme/layout';
import AuthStateDemoControl from '../../components/designlab/auth/AuthStateDemoControl';
import AuthTextField from '../../components/designlab/auth/AuthTextField';
import AuthButton from '../../components/designlab/auth/AuthButton';
import AuthTextLink from '../../components/designlab/auth/AuthTextLink';
import AuthOfflineBanner from '../../components/designlab/auth/AuthOfflineBanner';
import { useRegistroPreview } from './useAuthPreview';
import { registroAFixtures } from './authAFixtures';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  useResponsive,
} from '../../theme/serene';

const f = registroAFixtures;

/**
 * Registro A — 4 estados del Design Lab (selector solo Lab):
 * normal | error | cargando | sinConexion
 *
 * Encabezado: solo "StepUp" a la izquierda, sin flecha.
 * Estado error (contraseña corta): la ayuda pasa a error con mensaje.
 * Cargando: spinner nativo en botón + "Creando cuenta…"; campos atenuados.
 * Sin conexión: banner con wifi-off, "Crear cuenta" deshabilitado.
 */
export default function RegistroAScreen() {
  const { contentPaddingBottom } = useBottomLayout();
  const { scale: s } = useResponsive();
  const {
    state,
    setState,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isLoading,
    isOffline,
    hasError,
    onSubmit,
  } = useRegistroPreview();

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
          flow="registro"
          state={state}
          onChange={setState}
          onIndex={() => console.log('[DesignLab] Registro — volver al índice')}
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

        {/* Campo Nombre */}
        <AuthTextField
          label={f.fields.name.label}
          value={name}
          onChangeText={setName}
          symbol="person"
          placeholder={f.fields.name.placeholder}
          disabled={isLoading}
          inputProps={{
            autoCapitalize: 'words',
            autoComplete: 'name',
            textContentType: 'name',
            returnKeyType: 'next',
          }}
        />

        {/* Campo Email */}
        <AuthTextField
          label={f.fields.email.label}
          value={email}
          onChangeText={setEmail}
          symbol="mail"
          placeholder={f.fields.email.placeholder}
          disabled={isLoading}
          inputProps={{
            keyboardType: 'email-address',
            autoCapitalize: 'none',
            autoComplete: 'email',
            textContentType: 'emailAddress',
            returnKeyType: 'next',
          }}
        />

        {/* Campo Contraseña con ayuda / error */}
        <AuthTextField
          label={f.fields.password.label}
          value={password}
          onChangeText={setPassword}
          symbol="lock"
          placeholder={f.fields.password.placeholder}
          disabled={isLoading}
          helper={hasError ? f.errorMessage : f.fields.password.helper}
          helperError={hasError}
          passwordToggle={{
            visible: showPassword,
            onToggle: () => setShowPassword((v) => !v),
            showLabel: f.a11y.showPassword,
            hideLabel: f.a11y.hidePassword,
          }}
          inputProps={{
            secureTextEntry: !showPassword,
            autoComplete: 'new-password',
            textContentType: 'newPassword',
            returnKeyType: 'go',
          }}
        />

        {/* Botón principal */}
        <AuthButton
          label={isLoading ? f.loading : f.primary}
          onPress={onSubmit}
          disabled={isLoading || isOffline}
          loading={isLoading}
        />

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
            onPress={() => console.log('[DesignLab] Registro — navegar a Login')}
            disabled={isLoading}
          />
        </View>
      </ScrollView>
    </View>
  );
}