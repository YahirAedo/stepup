import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import type { TextStyle } from 'react-native';
import { colors, typography, spacing, borderRadius, useResponsive } from '../theme';
import TextField from '../components/TextField';
import { AuthService } from '../services/AuthService';
import { ApiError } from '../services/api';
import type { RootStackParamList } from '../types/navigation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { scale: s } = useResponsive();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Completá tu correo y contraseña');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await AuthService.login(email.trim(), password);
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 401) {
          setError('Correo o contraseña incorrectos');
        } else if (e.status === 0) {
          setError('No se pudo conectar con el servidor');
        } else {
          setError(e.message);
        }
      } else {
        setError('Ocurrió un error inesperado');
      }
    } finally {
      setLoading(false);
    }
  };

  const goOffline = () => {
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.surface }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={{
          position: 'absolute',
          top: -s(80),
          right: -s(80),
          width: s(240),
          height: s(240),
          borderRadius: s(120),
          backgroundColor: colors['primary-fixed-dim'],
          opacity: 0.12,
        }}
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: spacing['container-padding'],
            paddingTop: insets.top + spacing['container-padding'],
          }}
        >
          <View style={{ alignItems: 'center', marginBottom: spacing['section-gap'] }}>
            <View
              style={{
                width: s(96),
                height: s(96),
                borderRadius: s(48),
                backgroundColor: colors['primary-fixed-dim'],
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: spacing['stack-gap'],
              }}
            >
              <MaterialIcons name="home" size={s(44)} color={colors['on-primary-fixed-variant']} />
            </View>

            <Text
              style={[
                typography['headline-lg-mobile'] as TextStyle,
                { color: colors['on-surface'], textAlign: 'center' },
              ]}
            >
              Bienvenido de vuelta
            </Text>

            <Text
              style={[
                typography['body-md'] as TextStyle,
                { color: colors['on-surface-variant'], textAlign: 'center', marginTop: 4 },
              ]}
            >
              Ingresa tus datos para continuar
            </Text>
          </View>

          <View style={{ gap: spacing['stack-gap'] }}>
            <TextField
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="tu@email.com"
              leftIcon={
                <MaterialIcons name="mail-outline" size={24} color={colors['on-surface-variant']} />
              }
            />

            <TextField
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="********"
              leftIcon={
                <MaterialIcons name="lock-outline" size={24} color={colors['on-surface-variant']} />
              }
              rightElement={
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialIcons
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={24}
                    color={colors['on-surface-variant']}
                  />
                </TouchableOpacity>
              }
            />

            <TouchableOpacity
              onPress={() => {}}
              activeOpacity={0.7}
              style={{ alignSelf: 'flex-end', paddingVertical: 4 }}
            >
              <Text style={[typography['label-sm'] as TextStyle, { color: colors.primary }]}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>
          </View>

          {error && (
            <View
              style={{
                marginTop: spacing['stack-gap'],
                padding: 12,
                borderRadius: borderRadius.md,
                backgroundColor: colors['error-container'],
              }}
            >
              <Text style={[typography['body-md'] as TextStyle, { color: colors['on-error-container'] }]}>
                {error}
              </Text>
            </View>
          )}
        </View>

        <View
          style={{
            paddingHorizontal: spacing['container-padding'],
            paddingBottom: insets.bottom + spacing['container-padding'],
            gap: spacing['stack-gap'],
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
            style={{
              width: '100%',
              height: 56,
              borderRadius: borderRadius.full,
              backgroundColor: colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              gap: 8,
              opacity: loading ? 0.5 : 1,
            }}
          >
            <Text style={[typography['label-md'] as TextStyle, { color: colors['on-primary'] }]}>
              {loading ? 'Ingresando…' : 'Iniciar Sesión'}
            </Text>
            {loading && <MaterialIcons name="hourglass-empty" size={20} color={colors['on-primary']} />}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goOffline}
            activeOpacity={0.7}
            style={{ height: 44, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={[typography['body-md'] as TextStyle, { color: colors['on-surface-variant'] }]}>
              Saltar y usar offline
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.7}
            style={{ height: 44, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={[typography['body-md'] as TextStyle, { color: colors['on-surface-variant'] }]}>
              ¿No tienes una cuenta?{' '}
              <Text style={[typography['label-md'] as TextStyle, { color: colors.primary }]}>
                Crear una cuenta
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
