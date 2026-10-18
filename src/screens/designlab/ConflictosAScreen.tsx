// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React, { useState, type ComponentProps } from 'react';
import { View, ScrollView, Pressable, Text as RNText, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBottomLayout } from '../../theme/layout';
import DesignLabHeader from '../../components/designlab/DesignLabHeader';
import PerfilPrimaryButton from '../../components/designlab/perfil/PerfilPrimaryButton';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  useResponsive,
} from '../../theme/serene';
import type { ProfileStackParamList } from '../../types/navigation';
import {
  conflictosCopy,
  conflictosFixtures,
  conflictosRemainingLabel,
  type ConflictoVersion,
} from './conflictosAFixtures';

type MciName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/**
 * Flujo Perfil Variante A — Conflictos de sincronización.
 *
 * Un bloque por item en conflicto (nombre, estado y fecha de cada lado) con una
 * acción por versión. Conservar una versión resuelve el item (demo en memoria).
 * Cuando no queda ninguno, muestra un cierre tranquilo. Datos de demo (fixtures).
 */
function VersionCard({
  label,
  icon,
  version,
  actionLabel,
  onChoose,
}: {
  label: string;
  icon: MciName;
  version: ConflictoVersion;
  actionLabel: string;
  onChoose: () => void;
}) {
  const { scale: s } = useResponsive();

  return (
    <View
      style={{
        flex: 1,
        gap: sereneSpacing['space-sm'],
        padding: sereneSpacing['space-md'],
        borderRadius: sereneBorderRadius.xl,
        backgroundColor: sereneColors['surface-container-lowest'],
        ...sereneShadows.card,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: sereneSpacing['space-sm'],
        }}
      >
        <MaterialCommunityIcons name={icon} size={s(18)} color={sereneColors['on-surface-variant']} />
        <RNText
          style={[
            sereneTypography['label-sm'] as TextStyle,
            { color: sereneColors['on-surface-variant'], textTransform: 'uppercase' },
          ]}
        >
          {label}
        </RNText>
      </View>

      <RNText
        numberOfLines={2}
        style={[
          sereneTypography['body-md'] as TextStyle,
          { color: sereneColors['on-surface'], fontWeight: '600' },
        ]}
      >
        {version.name}
      </RNText>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: sereneSpacing['space-xs'] }}>
        <MaterialCommunityIcons
          name="clock-outline"
          size={s(14)}
          color={sereneColors['on-surface-variant']}
        />
        <RNText
          style={[
            sereneTypography['label-md'] as TextStyle,
            { color: sereneColors['on-surface-variant'] },
          ]}
        >
          {version.modifiedLabel}
        </RNText>
      </View>

      <RNText
        style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors.secondary }]}
      >
        {version.statusLabel}
      </RNText>

      <Pressable
        onPress={onChoose}
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        style={({ pressed }) => ({
          minHeight: s(40),
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: sereneSpacing['space-xs'],
          borderRadius: sereneBorderRadius.lg,
          backgroundColor: sereneColors['surface-container-high'],
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <RNText
          style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface'] }]}
        >
          {actionLabel}
        </RNText>
      </Pressable>
    </View>
  );
}

export default function ConflictosAScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList, 'ConflictosA'>>();
  const { insets } = useBottomLayout();
  const { scale: s, isTablet } = useResponsive();
  const [resueltos, setResueltos] = useState<Record<number, true>>({});

  const pendientes = conflictosFixtures.filter((conflicto) => !resueltos[conflicto.id]);

  const resolver = (id: number) => setResueltos((prev) => ({ ...prev, [id]: true }));

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <DesignLabHeader title={conflictosCopy.headerTitle} showAvatar={false} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.margin,
          paddingTop: sereneSpacing['space-md'],
          paddingBottom: insets.bottom + sereneSpacing['space-lg'],
          gap: sereneSpacing['space-lg'],
        }}
        showsVerticalScrollIndicator={false}
      >
        {pendientes.length === 0 ? (
          <View
            style={{
              alignItems: 'center',
              gap: sereneSpacing['space-md'],
              paddingTop: sereneSpacing['space-xl'],
            }}
          >
            <View
              style={{
                width: s(72),
                height: s(72),
                borderRadius: s(36),
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: sereneColors['primary-fixed'],
              }}
            >
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={s(36)}
                color={sereneColors.primary}
              />
            </View>
            <RNText
              style={[sereneTypography['headline-sm'] as TextStyle, { color: sereneColors.primary }]}
            >
              {conflictosCopy.emptyTitle}
            </RNText>
            <RNText
              style={[
                sereneTypography['body-md'] as TextStyle,
                { color: sereneColors['on-surface-variant'], textAlign: 'center' },
              ]}
            >
              {conflictosCopy.emptyBody}
            </RNText>
            <View style={{ width: '100%', marginTop: sereneSpacing['space-sm'] }}>
              <PerfilPrimaryButton
                label={conflictosCopy.backCta}
                icon="arrow-left"
                onPress={() => navigation.goBack()}
              />
            </View>
          </View>
        ) : (
          <>
            <View style={{ gap: sereneSpacing['space-xs'] }}>
              <RNText
                style={[
                  sereneTypography['body-md'] as TextStyle,
                  { color: sereneColors['on-surface'] },
                ]}
              >
                {conflictosCopy.intro}
              </RNText>
              <RNText
                style={[
                  sereneTypography['label-md'] as TextStyle,
                  { color: sereneColors['on-surface-variant'] },
                ]}
              >
                {conflictosRemainingLabel(pendientes.length)}
              </RNText>
            </View>

            {pendientes.map((conflicto) => (
              <View key={conflicto.id} style={{ gap: sereneSpacing['space-sm'] }}>
                <RNText
                  style={[
                    sereneTypography['label-sm'] as TextStyle,
                    { color: sereneColors['on-surface-variant'], textTransform: 'uppercase' },
                  ]}
                >
                  {`${conflicto.kind} ${conflictosCopy.kindSuffix}`}
                </RNText>
                <View
                  style={{
                    flexDirection: isTablet ? 'row' : 'column',
                    gap: sereneSpacing['space-md'],
                  }}
                >
                  <VersionCard
                    label={conflictosCopy.localLabel}
                    icon="cellphone"
                    version={conflicto.local}
                    actionLabel={conflictosCopy.localAction}
                    onChoose={() => resolver(conflicto.id)}
                  />
                  <VersionCard
                    label={conflictosCopy.serverLabel}
                    icon="cloud-outline"
                    version={conflicto.server}
                    actionLabel={conflictosCopy.serverAction}
                    onChoose={() => resolver(conflicto.id)}
                  />
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
