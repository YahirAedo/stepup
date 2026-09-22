import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, type TextStyle } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../types/navigation';
import { colors, typography, spacing, borderRadius, useResponsive, useBottomLayout } from '../theme';
import { AuthService } from '../services/AuthService';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileMain'>;

const durations = [
  { label: '5m', value: 5 },
  { label: '10m', value: 10 },
  { label: '15m', value: 15 },
];

const settingsRows = [
  { icon: '🎨', label: 'Tema' },
  { icon: '💬', label: 'Soporte' },
  { icon: '🚪', label: 'Cerrar sesión' },
];

export default function ProfileScreen({ navigation }: Props) {
  const { insets, contentPaddingBottom } = useBottomLayout();
  const { scale: s } = useResponsive();
  const [defaultDuration, setDefaultDuration] = useState(10);
  const [notifications, setNotifications] = useState(true);

  const handleLogout = async () => {
    await AuthService.logout();
    navigation.getParent()?.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View
        style={{
          paddingTop: insets.top + spacing['container-padding'],
          paddingHorizontal: spacing['container-padding'],
          paddingBottom: spacing['stack-gap'],
          alignItems: 'center',
        }}
      >
        <View style={{ position: 'relative', marginBottom: spacing['stack-gap'] }}>
          <View
            style={{
              width: s(96),
              height: s(96),
              borderRadius: s(48),
              backgroundColor: colors['surface-container-highest'],
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: s(36) }}>👤</Text>
          </View>
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: s(28),
              height: s(28),
              borderRadius: s(14),
              backgroundColor: colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: colors.surface,
            }}
          >
            <Text style={{ fontSize: s(14), color: colors['on-primary'] }}>✎</Text>
          </View>
        </View>

        <Text
          style={[
            typography['headline-md'] as TextStyle,
            { color: colors['on-surface'], marginBottom: 4 },
          ]}
        >
          Zenith User
        </Text>

        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: borderRadius.full,
            backgroundColor: colors['primary-fixed-dim'],
          }}
        >
          <Text style={[typography['label-sm'] as TextStyle, { color: colors['on-primary-fixed'] }]}>
            🌟 Miembro Pro
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing['container-padding'],
          paddingBottom: contentPaddingBottom,
          gap: spacing['section-gap'],
        }}
      >
        <View
          style={{
            backgroundColor: colors['surface-container-low'],
            borderRadius: borderRadius.xl,
            padding: spacing['stack-gap'],
            gap: spacing['stack-gap'],
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={[typography['body-md'] as TextStyle, { color: colors['on-surface-variant'] }]}>
              ⏱ Duración default
            </Text>
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: colors['surface-container'],
                borderRadius: borderRadius.full,
                padding: 3,
              }}
            >
              {durations.map((d) => (
                <Pressable
                  key={d.value}
                  onPress={() => setDefaultDuration(d.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: defaultDuration === d.value }}
                  accessibilityLabel={`Duración default: ${d.label}${defaultDuration === d.value ? ', seleccionado' : ''}`}
                  style={({ pressed }) => ({
                    paddingHorizontal: 16,
                    paddingVertical: 6,
                    borderRadius: borderRadius.full,
                    backgroundColor: defaultDuration === d.value ? colors.primary : 'transparent',
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text
                    style={[
                      typography['label-sm'] as TextStyle,
                      {
                        color:
                          defaultDuration === d.value
                            ? colors['on-primary']
                            : colors['on-surface-variant'],
                      },
                    ]}
                  >
                    {d.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={[typography['body-md'] as TextStyle, { color: colors['on-surface-variant'] }]}>
              🔔 Notificaciones
            </Text>
            <Pressable
              onPress={() => setNotifications(!notifications)}
              accessibilityRole="switch"
              accessibilityState={{ checked: notifications }}
              accessibilityLabel="Notificaciones"
              style={({ pressed }) => ({
                width: 48,
                height: 28,
                borderRadius: 14,
                backgroundColor: notifications ? colors.primary : colors['outline-variant'],
                justifyContent: 'center',
                paddingHorizontal: 3,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: colors.surface,
                  alignSelf: notifications ? 'flex-end' : 'flex-start',
                }}
              />
            </Pressable>
          </View>
        </View>

        <View style={{ gap: spacing['stack-gap'] }}>
          <Text style={[typography['label-md'] as TextStyle, { color: colors['on-surface-variant'] }]}>
            Ajustes
          </Text>

          <View
            style={{
              backgroundColor: colors['surface-container-low'],
              borderRadius: borderRadius.xl,
            }}
          >
            {settingsRows.map((row, i) => (
              <Pressable
                key={row.label}
                onPress={() => {
                  if (row.label === 'Cerrar sesión') {
                    void handleLogout();
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel={row.label}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingHorizontal: spacing['stack-gap'],
                  paddingVertical: 14,
                  borderBottomWidth: i < settingsRows.length - 1 ? 1 : 0,
                  borderBottomColor: colors['outline-variant'],
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Text style={{ fontSize: 20 }}>{row.icon}</Text>
                <Text
                  style={[typography['body-md'] as TextStyle, { color: colors['on-surface'], flex: 1 }]}
                >
                  {row.label}
                </Text>
                <Text style={{ fontSize: 16, color: colors['outline'] }}>›</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          onPress={() => navigation.navigate('SyncConflict')}
          accessibilityRole="button"
          accessibilityLabel="Ir a sincronización"
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: spacing['stack-gap'],
            backgroundColor: colors['surface-container-low'],
            borderRadius: borderRadius.xl,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 24 }}>🔄</Text>
          <View style={{ flex: 1 }}>
            <Text style={[typography['body-md'] as any, { color: colors['on-surface'] }]}>
              Sincronización
            </Text>
            <Text style={[typography['label-sm'] as any, { color: colors['on-surface-variant'] }]}>
              Resolver conflictos de datos
            </Text>
          </View>
          <Text style={{ fontSize: 20, color: colors['outline'] }}>›</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('Badges')}
          accessibilityRole="button"
          accessibilityLabel="Ir a tus logros"
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: spacing['stack-gap'],
            backgroundColor: colors['surface-container-low'],
            borderRadius: borderRadius.xl,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 24 }}>🏅</Text>
          <View style={{ flex: 1 }}>
            <Text style={[typography['body-md'] as TextStyle, { color: colors['on-surface'] }]}>
              Tus Logros
            </Text>
            <Text style={[typography['label-sm'] as TextStyle, { color: colors['on-surface-variant'] }]}>
              3 insignias desbloqueadas
            </Text>
          </View>
          <Text style={{ fontSize: 20, color: colors['outline'] }}>›</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
