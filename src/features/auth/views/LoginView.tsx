import React from 'react';
import {
  View,
  Text as RNText,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  type TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
} from '../../../theme/serene';
import AuthTextField from '../../../components/ui/AuthTextField';
import AuthButton from '../../../components/ui/AuthButton';
import AuthOfflineBanner from '../../../components/ui/AuthOfflineBanner';
import AuthTextLink from '../../../components/ui/AuthTextLink';

export interface LoginViewProps {
  copy: typeof import('../logic/authCopy').loginCopy;
  email: string;
  onEmailChange: (text: string) => void;
  password: string;
  onPasswordChange: (text: string) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  loading: boolean;
  error: string | null;
  offline: boolean;
  offlineTitle: string;
  offlineBody: string;
  onSubmit: () => void;
  onGuest: () => void;
  onRegister: () => void;
}

export default function LoginView({
  copy,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  showPassword,
  onTogglePassword,
  loading,
  error,
  offline,
  offlineTitle,
  offlineBody,
  onSubmit,
  onGuest,
  onRegister,
}: LoginViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: sereneColors.surface }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + sereneSpacing['space-lg'],
          paddingHorizontal: sereneSpacing.margin,
          paddingBottom: sereneSpacing['space-lg'],
          gap: sereneSpacing['space-md'],
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <RNText style={[sereneTypography['headline-md'] as TextStyle, { color: sereneColors['on-surface'] }]}>
          {copy.headerTitle}
        </RNText>
        <RNText style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'] }]}>
          {copy.title}
        </RNText>
        <RNText style={[sereneTypography['body-md'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}>
          {copy.subtitle}
        </RNText>

        {offline ? <AuthOfflineBanner title={offlineTitle} body={offlineBody} /> : null}

        {error ? (
          <RNText
            accessibilityLiveRegion="polite"
            style={[sereneTypography['body-md'] as TextStyle, { color: sereneColors.error }]}
          >
            {error}
          </RNText>
        ) : null}

        <AuthTextField
          label={copy.fields.email.label}
          value={email}
          onChangeText={onEmailChange}
          symbol="mail"
          placeholder={copy.fields.email.placeholder}
          disabled={loading}
          inputProps={{ autoCapitalize: 'none', keyboardType: 'email-address', textContentType: 'emailAddress' }}
        />
        <AuthTextField
          label={copy.fields.password.label}
          value={password}
          onChangeText={onPasswordChange}
          symbol="lock"
          placeholder={copy.fields.password.placeholder}
          disabled={loading}
          passwordToggle={{
            visible: showPassword,
            onToggle: onTogglePassword,
            showLabel: copy.a11y.showPassword,
            hideLabel: copy.a11y.hidePassword,
          }}
          inputProps={{ secureTextEntry: !showPassword, textContentType: 'password' }}
        />

        <AuthButton
          label={loading ? copy.loading : copy.primary}
          onPress={onSubmit}
          disabled={loading}
          loading={loading}
        />
        {loading ? (
          <RNText style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface-variant'], textAlign: 'center' }]}>
            {copy.loadingCaption}
          </RNText>
        ) : null}

        <AuthButton label={copy.secondary} variant="outline" onPress={onGuest} disabled={loading} />
        <RNText style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface-variant'], textAlign: 'center' }]}>
          {copy.secondaryCaption}
        </RNText>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sereneSpacing['space-xs'] }}>
          <RNText style={[sereneTypography['body-md'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}>
            {copy.footerQuestion}
          </RNText>
          <AuthTextLink label={copy.footerLink} onPress={onRegister} disabled={loading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
