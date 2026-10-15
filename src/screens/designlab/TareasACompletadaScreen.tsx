// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React from 'react';
import { View, ScrollView, Text as RNText, Pressable, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBottomLayout } from '../../theme/layout';
import DesignLabHeader from '../../components/designlab/DesignLabHeader';
import { mci } from '../../components/designlab/mciIconMap';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  withAlpha,
  useResponsive,
} from '../../theme/serene';
import { stepCountLabel } from '../../utils/microplan';
import type { ProfileStackParamList } from '../../types/navigation';
import { flujoACompletadaFixtures } from './tareasFlujoAFixtures';

/**
 * Variante A "Enfoque" — Tareas / Tarea completada.
 *
 * Aviso calmo de cierre: hero botanico en paleta salvia (sin confeti ni
 * celebracion ruidosa), un resumen sereno del logro y un unico CTA para volver
 * al listado. `Task.status = 'completed'` es un estado real del modelo.
 */
export default function TareasACompletadaScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList, 'TareasACompletada'>>();
  const { insets } = useBottomLayout();
  const { scale: s } = useResponsive();
  const f = flujoACompletadaFixtures;

  const heroSize = s(84);
  const auraSize = s(120);
  const badgeSize = s(28);

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <DesignLabHeader title={f.headerTitle} showAvatar={false} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.gutter,
          paddingTop: sereneSpacing['space-lg'],
          paddingBottom: sereneSpacing['space-xl'],
          alignItems: 'center',
          gap: sereneSpacing['space-lg'],
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero botanico sereno */}
        <View
          style={{
            width: heroSize,
            height: heroSize,
            marginTop: sereneSpacing['space-md'],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              position: 'absolute',
              width: auraSize,
              height: auraSize,
              borderRadius: auraSize / 2,
              backgroundColor: withAlpha(sereneColors['secondary-fixed'], 0.5),
            }}
          />
          <View
            style={{
              width: heroSize,
              height: heroSize,
              borderRadius: heroSize / 2,
              backgroundColor: sereneColors['secondary-container'],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name={mci('spa')} size={s(38)} color={sereneColors['on-secondary-container']} />
          </View>
          <View
            style={{
              position: 'absolute',
              right: -s(2),
              bottom: s(2),
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: sereneColors['primary-container'],
              borderWidth: 2,
              borderColor: sereneColors.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name={mci('check')} size={s(16)} color={sereneColors['on-primary']} />
          </View>
        </View>

        {/* Headline + subtitulo */}
        <View style={{ gap: sereneSpacing['space-sm'], alignItems: 'center' }}>
          <RNText
            style={[
              sereneTypography['headline-lg-mobile'] as TextStyle,
              { color: sereneColors.primary, textAlign: 'center', maxWidth: s(300) },
            ]}
          >
            {f.headline}
          </RNText>
          <RNText
            style={[
              sereneTypography['body-md'] as TextStyle,
              { color: sereneColors['on-surface-variant'], textAlign: 'center', maxWidth: s(280) },
            ]}
          >
            {f.subtitle}
          </RNText>
        </View>

        {/* Resumen del logro */}
        <View
          style={{
            width: '100%',
            backgroundColor: sereneColors['surface-container-lowest'],
            borderRadius: sereneBorderRadius.xl,
            padding: sereneSpacing['space-md'],
            flexDirection: 'row',
            alignItems: 'center',
            gap: sereneSpacing['space-md'],
            ...sereneShadows.card,
          }}
        >
          <View
            style={{
              width: s(40),
              height: s(40),
              borderRadius: s(20),
              backgroundColor: sereneColors['secondary-fixed'],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name={mci('task_alt')} size={s(20)} color={sereneColors['on-secondary-fixed']} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <RNText
              style={[
                sereneTypography['label-sm'] as TextStyle,
                { color: sereneColors['on-surface-variant'], textTransform: 'uppercase' },
              ]}
            >
              {f.recapLabel}
            </RNText>
            <RNText
              numberOfLines={2}
              style={[
                sereneTypography['body-sm'] as TextStyle,
                { color: sereneColors['on-surface'], fontWeight: '600', marginTop: s(2) },
              ]}
            >
              {f.taskTitle}
            </RNText>
            <RNText
              style={[
                sereneTypography['label-md'] as TextStyle,
                { color: sereneColors['on-surface-variant'], marginTop: s(2) },
              ]}
            >
              {`${stepCountLabel(f.stepsCompleted)} · ~${f.totalMinutes} min`}
            </RNText>
          </View>
        </View>

        {/* Microcopy calmo */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: sereneSpacing['space-sm'],
            paddingHorizontal: sereneSpacing['space-md'],
          }}
        >
          <MaterialCommunityIcons name={mci('eco')} size={s(16)} color={sereneColors.primary} />
          <RNText
            style={[
              sereneTypography['body-sm'] as TextStyle,
              { color: sereneColors['on-surface-variant'], flexShrink: 1 },
            ]}
          >
            {f.microCopy}
          </RNText>
        </View>
      </ScrollView>

      {/* Barra de acción fija (en flujo del layout, no absolute). Único CTA. */}
      <View
        style={{
          paddingHorizontal: sereneSpacing.margin,
          paddingTop: sereneSpacing['space-sm'],
          paddingBottom: insets.bottom + sereneSpacing['space-md'],
          borderTopWidth: 1,
          borderTopColor: withAlpha(sereneColors.outline, 0.2),
          backgroundColor: sereneColors.surface,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={f.primary}
          onPress={() => navigation.navigate('TareasAListado')}
          style={({ pressed }) => ({
            minHeight: s(48),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: sereneSpacing['space-sm'],
            paddingVertical: sereneSpacing['space-sm'],
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: sereneColors.primary,
            ...sereneShadows.card,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <MaterialCommunityIcons name={mci('arrow_forward')} size={s(20)} color={sereneColors['on-primary']} />
          <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}>
            {f.primary}
          </RNText>
        </Pressable>
      </View>
    </View>
  );
}
