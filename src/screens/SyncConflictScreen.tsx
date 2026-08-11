import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, borderRadius, shadows, useResponsive } from '../theme';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import { SyncService } from '../services/SyncService';
import type { SyncConflict } from '../database/sync';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

function formatModifiedAt(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (date.toDateString() === now.toDateString()) return `Hoy, ${time}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return `Ayer, ${time}`;
  return `${date.toLocaleDateString([], { day: '2-digit', month: '2-digit' })}, ${time}`;
}

function statusLabel(status: string): string {
  switch (status) {
    case 'completed':
      return 'Completada';
    case 'active':
      return 'Activa';
    case 'pending':
      return 'Pendiente';
    default:
      return status;
  }
}

function VersionCard({
  title,
  icon,
  badge,
  badgeBg,
  badgeTextColor,
  accent,
  activeText,
  version,
  conflict,
  selected,
  onSelect,
  onChoose,
}: {
  title: string;
  icon: string;
  badge: string;
  badgeBg: string;
  badgeTextColor: string;
  accent: string;
  activeText: string;
  version: 'local' | 'server';
  conflict: SyncConflict;
  selected: boolean;
  onSelect: () => void;
  onChoose: () => void;
}) {
  const { scale: s } = useResponsive();
  const snapshot = version === 'local' ? conflict.local : conflict.server;
  const modifiedAt = formatModifiedAt(snapshot.updatedAt);

  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.85}
      style={{
        flex: 1,
        backgroundColor: colors['surface-container-low'],
        borderRadius: borderRadius.xl,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? accent : colors['outline-variant'],
        padding: spacing['stack-gap'],
        gap: spacing['stack-gap'],
        ...(selected ? shadows.card : {}),
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: s(40),
            height: s(40),
            borderRadius: s(20),
            backgroundColor: colors['surface-container-high'],
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: s(18) }}>{icon}</Text>
        </View>
        <Text style={[typography['headline-md'] as any, { color: colors['on-surface'] }]}>
          {title}
        </Text>
      </View>

      <View
        style={{
          alignSelf: 'flex-start',
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: borderRadius.full,
          backgroundColor: badgeBg,
        }}
      >
        <Text style={[typography['label-sm'] as any, { color: badgeTextColor }]}>{badge}</Text>
      </View>

      <View style={{ gap: spacing.unit }}>
        <Text style={[typography['label-sm'] as any, { color: colors['on-surface-variant'] }]}>
          Última modificación: {modifiedAt}
        </Text>
        <Text style={[typography['body-md'] as any, { color: colors['on-surface'] }]}>
          {snapshot.name}
        </Text>
        <Text style={[typography['label-md'] as any, { color: colors.secondary }]}>
          {statusLabel(snapshot.status)}
        </Text>
      </View>

      <Button
        title="Elegir esta versión"
        onPress={onChoose}
        variant="secondary"
        style={{
          backgroundColor: selected ? accent : colors['surface-container-high'],
          borderWidth: 0,
        }}
        textStyle={{ color: selected ? activeText : colors['on-surface'] }}
      />
    </TouchableOpacity>
  );
}

export default function SyncConflictScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { scale: s, isTablet } = useResponsive();
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [selected, setSelected] = useState<Record<number, 'local' | 'server'>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setConflicts(await SyncService.getConflicts());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const resolve = useCallback(
    (conflict: SyncConflict, version: 'local' | 'server') => {
      const label = version === 'local' ? 'la versión local' : 'la del servidor';
      Alert.alert(
        'Confirmar elección',
        `¿Conservar ${label} de "${conflict.local.name}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar',
            onPress: async () => {
              if (version === 'local') {
                await SyncService.resolveConflictKeepLocal(conflict.id);
              } else {
                await SyncService.resolveConflictKeepServer(conflict.id);
              }
              setSelected({});
              void load();
            },
          },
        ],
      );
    },
    [load],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: insets.top + spacing['container-padding'],
          paddingHorizontal: spacing['container-padding'],
          paddingBottom: spacing['stack-gap'],
          gap: 12,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.6}>
          <Text style={{ fontSize: 24, color: colors['on-surface'] }}>‹</Text>
        </TouchableOpacity>
        <Text style={[typography['headline-md'] as any, { color: colors['on-surface'] }]}>
          Conflicto de Sincronización
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing['container-padding'],
          paddingBottom: insets.bottom + spacing['container-padding'],
          gap: spacing['section-gap'],
        }}
      >
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : conflicts.length === 0 ? (
          <EmptyState
            headline="Sin conflictos"
            subtext="Tus datos están sincronizados. Acá aparecerán cambios editados casi al mismo tiempo en este dispositivo y en la nube."
          />
        ) : (
          <>
            <View style={{ alignItems: 'center', gap: spacing['stack-gap'] }}>
              <View
                style={{
                  width: s(88),
                  height: s(88),
                  borderRadius: s(44),
                  backgroundColor: colors['surface-container-high'],
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: s(40) }}>⚠️</Text>
              </View>
              <Text
                style={[
                  typography['body-md'] as any,
                  { color: colors['on-surface-variant'], textAlign: 'center' },
                ]}
              >
                Se editaron datos en este dispositivo y en la nube casi al mismo tiempo. Elegí qué
                versión querés conservar.
              </Text>
            </View>

            {conflicts.map((conflict) => (
              <View key={conflict.id} style={{ gap: spacing['stack-gap'] }}>
                <Text style={[typography['label-md'] as any, { color: colors['on-surface-variant'] }]}>
                  {conflict.tableName === 'tasks' ? 'Tarea' : 'Paso'} modificada en ambos lugares
                </Text>
                <View
                  style={{
                    flexDirection: isTablet ? 'row' : 'column',
                    gap: spacing['stack-gap'],
                  }}
                >
                  <VersionCard
                    title="Versión Local"
                    icon="📱"
                    badge="En este dispositivo"
                    badgeBg={colors['primary-fixed-dim']}
                    badgeTextColor={colors['on-primary-fixed-variant']}
                    accent={colors.primary}
                    activeText={colors['on-primary']}
                    version="local"
                    conflict={conflict}
                    selected={selected[conflict.id] === 'local'}
                    onSelect={() =>
                      setSelected((prev) => ({ ...prev, [conflict.id]: 'local' }))
                    }
                    onChoose={() => resolve(conflict, 'local')}
                  />
                  <VersionCard
                    title="Versión del Servidor"
                    icon="☁️"
                    badge="Guardada en la nube"
                    badgeBg={colors['secondary-fixed-dim']}
                    badgeTextColor={colors['on-secondary-fixed-variant']}
                    accent={colors.secondary}
                    activeText={colors['on-secondary-container']}
                    version="server"
                    conflict={conflict}
                    selected={selected[conflict.id] === 'server'}
                    onSelect={() =>
                      setSelected((prev) => ({ ...prev, [conflict.id]: 'server' }))
                    }
                    onChoose={() => resolve(conflict, 'server')}
                  />
                </View>
              </View>
            ))}

            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  'Ayuda',
                  'Compará la fecha de última modificación y el estado de cada versión. Elegí la que refleje mejor tu progreso actual; el cambio quedará guardado tanto en este dispositivo como en la nube.',
                )
              }
              activeOpacity={0.6}
              style={{ alignItems: 'center', paddingVertical: spacing.unit * 2 }}
            >
              <Text
                style={[
                  typography['label-md'] as any,
                  { color: colors.primary, textDecorationLine: 'underline' },
                ]}
              >
                ¿Necesitas ayuda para decidir?
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}
