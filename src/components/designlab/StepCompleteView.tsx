import React from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Text as RNText,
  type TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DesignLabHeader from './DesignLabHeader';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  withAlpha,
  useResponsive,
} from '../../theme/serene';

export interface StepCompleteViewProps {
  /** Titulo de celebracion. */
  headline: string;
  /** Duracion completada, ej. "4 minutos". */
  durationLabel: string;
  /** Plantilla del subtitulo; contiene el placeholder {duration}. */
  subtitleTemplate: string;
  /** Etiqueta del resumen de logro, ej. "Logro registrado". */
  recapLabel: string;
  /** Titulo del paso que se acaba de completar. */
  completedStepName: string;
  /** Siguiente micro-paso sugerido. */
  nextStep: { label: string; name: string; description: string; minutes: number };
  /** CTA de descanso, ej. "Descansar 2 min". */
  breakCta: string;
  /** CTA principal, ej. "CONTINUAR CON EL SIGUIENTE PASO". */
  primaryCta: string;
  /** CTA secundario, ej. "Guardar progreso y descansar por hoy". */
  secondaryCta: string;
  /** Texto de cierre. */
  microCopy: string;
  /** Titulo del header. Default: "Sesión terminada". */
  headerTitle?: string;
  onContinue: () => void;
  onRest: () => void;
  onBreak: () => void;
}

const PLACEHOLDER = '{duration}';

/**
 * Vista completa del estado "Paso completado v2".
 *
 * Se muestra cuando el usuario termina su micro-paso de foco. Sigue el molde
 * de `FocusRunningView`: header propio + ScrollView con padding de gutter.
 */
export default function StepCompleteView({
  headline,
  durationLabel,
  subtitleTemplate,
  recapLabel,
  completedStepName,
  nextStep,
  breakCta,
  primaryCta,
  secondaryCta,
  microCopy,
  headerTitle,
  onContinue,
  onRest,
  onBreak,
}: StepCompleteViewProps) {
  const { scale: s } = useResponsive();

  const [subtitleBefore, subtitleAfter] = subtitleTemplate.split(PLACEHOLDER);
  const hasPlaceholder = subtitleAfter !== undefined;

  const heroSize = s(96);
  const auraSize = s(128);
  const badgeSize = s(28);

  const subtitleStyle = sereneTypography['body-lg'] as TextStyle;
  const subtitleColor = sereneColors['on-surface-variant'];
  const ctaLabelStyle = sereneTypography['label-lg'] as TextStyle;

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <DesignLabHeader title={headerTitle ?? 'Sesión terminada'} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.gutter,
          paddingBottom: sereneSpacing['space-xl'],
          alignItems: 'center',
          gap: sereneSpacing['space-lg'],
        }}
      >
        {/* Hero de celebracion */}
        <View
          style={{
            width: heroSize,
            height: heroSize,
            marginTop: sereneSpacing['space-lg'],
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
              backgroundColor: withAlpha(sereneColors['primary-fixed'], 0.3),
            }}
          />
          <View
            style={{
              width: heroSize,
              height: heroSize,
              borderRadius: heroSize / 2,
              backgroundColor: sereneColors['primary-container'],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons
              name="spa"
              size={s(44)}
              color={sereneColors['on-primary-container']}
            />
          </View>
          <View
            style={{
              position: 'absolute',
              right: -s(2),
              bottom: s(2),
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: sereneColors['secondary-container'],
              borderWidth: 2,
              borderColor: sereneColors.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons
              name="check"
              size={s(16)}
              color={sereneColors['on-secondary-container']}
            />
          </View>
        </View>

        {/* Headline */}
        <RNText
          style={[
            sereneTypography['headline-lg-mobile'] as TextStyle,
            { color: sereneColors.primary, textAlign: 'center', maxWidth: s(300) },
          ]}
        >
          {headline}
        </RNText>

        {/* Subtitulo con duracion destacada */}
        {hasPlaceholder ? (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <RNText style={[subtitleStyle, { color: subtitleColor }]}>{subtitleBefore}</RNText>
            <RNText style={[subtitleStyle, { color: sereneColors.primary, fontWeight: '600' }]}>
              {durationLabel}
            </RNText>
            <RNText style={[subtitleStyle, { color: subtitleColor }]}>{subtitleAfter}</RNText>
          </View>
        ) : (
          <RNText style={[subtitleStyle, { color: subtitleColor, textAlign: 'center' }]}>
            {subtitleTemplate}
          </RNText>
        )}

        {/* Recap del logro */}
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
            <MaterialCommunityIcons
              name="check"
              size={s(20)}
              color={sereneColors['on-secondary-fixed']}
            />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <RNText
              style={[
                sereneTypography['label-sm'] as TextStyle,
                {
                  color: sereneColors['on-surface-variant'],
                  textTransform: 'uppercase',
                },
              ]}
            >
              {recapLabel}
            </RNText>
            <RNText
              numberOfLines={2}
              style={[
                sereneTypography['body-sm'] as TextStyle,
                { color: sereneColors['on-surface'], fontWeight: '600', marginTop: s(2) },
              ]}
            >
              {completedStepName}
            </RNText>
          </View>
        </View>

        {/* Siguiente paso */}
        <View
          style={{
            width: '100%',
            backgroundColor: sereneColors['surface-container-low'],
            borderRadius: sereneBorderRadius.xl,
            padding: sereneSpacing['space-md'],
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: sereneSpacing['space-sm'],
            }}
          >
            <RNText
              style={[
                sereneTypography['label-sm'] as TextStyle,
                { color: sereneColors.primary, textTransform: 'uppercase', flexShrink: 1 },
              ]}
            >
              {nextStep.label}
            </RNText>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: s(4),
                paddingHorizontal: s(10),
                paddingVertical: s(4),
                borderRadius: sereneBorderRadius.full,
                backgroundColor: sereneColors['surface-container-high'],
              }}
            >
              <MaterialCommunityIcons
                name="timer-outline"
                size={s(13)}
                color={sereneColors['on-surface-variant']}
              />
              <RNText
                style={[
                  sereneTypography['label-md'] as TextStyle,
                  { color: sereneColors['on-surface'] },
                ]}
              >
                {`${nextStep.minutes} min`}
              </RNText>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: sereneSpacing['space-md'],
              marginTop: sereneSpacing['space-md'],
            }}
          >
            <View
              style={{
                width: s(36),
                height: s(36),
                borderRadius: s(18),
                backgroundColor: sereneColors['primary-container'],
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons
                name="arrow-right"
                size={s(18)}
                color={sereneColors['on-primary-container']}
              />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <RNText
                style={[
                  sereneTypography['body-md'] as TextStyle,
                  { color: sereneColors['on-surface'], fontWeight: '600' },
                ]}
              >
                {nextStep.name}
              </RNText>
              <RNText
                style={[
                  sereneTypography['body-sm'] as TextStyle,
                  { color: sereneColors['on-surface-variant'], marginTop: s(2) },
                ]}
              >
                {nextStep.description}
              </RNText>
            </View>
          </View>
        </View>

        {/* Descanso */}
        <Pressable
          onPress={onBreak}
          accessibilityRole="button"
          accessibilityLabel={breakCta}
          style={({ pressed }) => ({
            width: '100%',
            backgroundColor: sereneColors['surface-container-lowest'],
            borderRadius: sereneBorderRadius.xl,
            padding: sereneSpacing['space-md'],
            flexDirection: 'row',
            alignItems: 'center',
            gap: sereneSpacing['space-md'],
            opacity: pressed ? 0.85 : 1,
            ...sereneShadows.card,
          })}
        >
          <View
            style={{
              width: s(40),
              height: s(40),
              borderRadius: s(20),
              backgroundColor: sereneColors['secondary-container'],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons
              name="meditation"
              size={s(20)}
              color={sereneColors['on-secondary-container']}
            />
          </View>
          <RNText
            style={[
              sereneTypography['body-md'] as TextStyle,
              { color: sereneColors['on-surface'], flex: 1, fontWeight: '600' },
            ]}
          >
            {breakCta}
          </RNText>
          <MaterialCommunityIcons
            name="chevron-right"
            size={s(20)}
            color={sereneColors['on-surface-variant']}
          />
        </Pressable>

        {/* Acciones */}
        <View style={{ width: '100%', gap: sereneSpacing['space-sm'] }}>
          <Pressable
            onPress={onContinue}
            accessibilityRole="button"
            accessibilityLabel={primaryCta}
            style={({ pressed }) => ({
              width: '100%',
              height: s(52),
              borderRadius: sereneBorderRadius.full,
              backgroundColor: sereneColors['primary-container'],
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: s(8),
              opacity: pressed ? 0.9 : 1,
              ...sereneShadows.card,
            })}
          >
            <MaterialCommunityIcons
              name="arrow-right"
              size={s(20)}
              color={sereneColors['on-primary-container']}
            />
            <RNText
              style={[
                ctaLabelStyle,
                {
                  color: sereneColors['on-primary-container'],
                  textTransform: 'uppercase',
                  letterSpacing: 0.4,
                  fontWeight: '600',
                },
              ]}
            >
              {primaryCta}
            </RNText>
          </Pressable>

          <Pressable
            onPress={onRest}
            accessibilityRole="button"
            accessibilityLabel={secondaryCta}
            style={({ pressed }) => ({
              width: '100%',
              height: s(52),
              borderRadius: sereneBorderRadius.full,
              borderWidth: 1,
              borderColor: sereneColors['outline-variant'],
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: s(8),
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <MaterialCommunityIcons
              name="weather-night"
              size={s(18)}
              color={sereneColors.primary}
            />
            <RNText
              style={[
                ctaLabelStyle,
                {
                  color: sereneColors.primary,
                  textTransform: 'uppercase',
                  letterSpacing: 0.4,
                  fontWeight: '600',
                },
              ]}
            >
              {secondaryCta}
            </RNText>
          </Pressable>
        </View>

        {/* Microcopy */}
        <RNText
          style={[
            sereneTypography['label-sm'] as TextStyle,
            {
              color: sereneColors['outline'],
              textAlign: 'center',
              marginTop: sereneSpacing['space-xs'],
            },
          ]}
        >
          {microCopy}
        </RNText>
      </ScrollView>
    </View>
  );
}
