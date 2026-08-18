import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../types/navigation';
import { colors, typography, spacing, borderRadius, useResponsive, useBottomLayout } from '../theme';
import ProgressRing from '../components/ProgressRing';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Badges'>;

const unlockedBadges = [
  { icon: '🔥', label: 'Guerrero del Flow', bg: colors['secondary-fixed-dim'] },
  { icon: '☀️', label: 'Madrugador', bg: colors['tertiary-fixed-dim'] },
  { icon: '🚶', label: 'Primer Paso', bg: colors['primary-fixed-dim'] },
];

const lockedBadges = [
  { icon: '📅', label: 'Semana Perfecta' },
  { icon: '🧠', label: 'Mente Clara' },
  { icon: '📈', label: 'Racha Ascendente' },
];

function BadgeCard({
  icon,
  label,
  bg,
  unlocked,
}: {
  icon: string;
  label: string;
  bg?: string;
  unlocked: boolean;
}) {
  const { scale: s } = useResponsive();
  const cardSize = s(140);

  return (
    <View
      style={{
        width: cardSize,
        height: cardSize,
        backgroundColor: unlocked
          ? (bg ?? colors['surface-container'])
          : colors['surface-container'],
        borderRadius: borderRadius.xl,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        opacity: unlocked ? 1 : 0.5,
      }}
    >
      {unlocked && (
        <View
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: s(20),
            height: s(20),
            borderRadius: s(10),
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: s(11), color: colors['on-primary'] }}>✓</Text>
        </View>
      )}
      <Text style={{ fontSize: s(32) }}>{icon}</Text>
      <Text
        style={[
          typography['label-sm'] as any,
          {
            color: unlocked ? colors['on-surface'] : colors['on-surface-variant'],
            textAlign: 'center',
            paddingHorizontal: 8,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export default function BadgesScreen({ navigation }: Props) {
  const { insets, contentPaddingBottom } = useBottomLayout();

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
          Tus Logros
        </Text>
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
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing['stack-gap'],
            backgroundColor: colors['surface-container-low'],
            borderRadius: borderRadius.xl,
            padding: spacing['stack-gap'],
          }}
        >
          <ProgressRing progress={3 / 12} size={100} icon="🏅" />
          <View style={{ flex: 1 }}>
            <Text
              style={[
                typography['body-lg'] as any,
                { color: colors['on-surface'], marginBottom: 4 },
              ]}
            >
              Insignias Desbloqueadas
            </Text>
            <Text style={[typography['headline-md'] as any, { color: colors.primary }]}>3/12</Text>
          </View>
        </View>

        <View style={{ gap: spacing['stack-gap'] }}>
          <Text style={[typography['label-md'] as any, { color: colors['on-surface-variant'] }]}>
            Desbloqueadas
          </Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: spacing['stack-gap'],
              justifyContent: 'center',
            }}
          >
            {unlockedBadges.map((b) => (
              <BadgeCard key={b.label} {...b} unlocked />
            ))}
          </View>
        </View>

        <View style={{ gap: spacing['stack-gap'] }}>
          <Text style={[typography['label-md'] as any, { color: colors['outline'] }]}>
            Bloqueadas
          </Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: spacing['stack-gap'],
              justifyContent: 'center',
            }}
          >
            {lockedBadges.map((b) => (
              <BadgeCard key={b.label} {...b} unlocked={false} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
