import React, { useState } from 'react';
import { View, Text as RNText, Pressable, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  withAlpha,
  useResponsive,
} from '../../theme/serene';
import ProgressTrack from './ProgressTrack';
import { mci } from './mciIconMap';

export interface FeaturedStep {
  done: boolean;
  current: boolean;
  title: string;
}

export interface FeaturedTaskCardProps {
  badge: string;
  minutesLabel: string;
  title: string;
  stepLabel: string;
  stepTitle: string;
  sessionLabel: string;
  sessionPercent: number;
  primaryCta: string;
  toggleOpen: string;
  toggleClose: string;
  steps: FeaturedStep[];
  onResume?: () => void;
}

/**
 * Tarjeta destacada de la tarea "en foco" (bloque D del Listado).
 *
 * Barra de acento izquierda, pill "En foco principal" con punto pulsante,
 * paso actual (con `subdirectory_arrow_right`), avance de sesion (ProgressTrack
 * simple) y CTA "Reanudar Foco Inmediato". El desglose de pasos es un acordeon
 * que replica el toggle del JS del mockup (`toggle-steps-btn`): ver/ocultar.
 */
export default function FeaturedTaskCard({
  badge,
  minutesLabel,
  title,
  stepLabel,
  stepTitle,
  sessionLabel,
  sessionPercent,
  primaryCta,
  toggleOpen,
  toggleClose,
  steps,
  onResume,
}: FeaturedTaskCardProps) {
  const { scale: s } = useResponsive();
  const [stepsOpen, setStepsOpen] = useState(false);

  return (
    <View
      style={{
        borderRadius: sereneBorderRadius.xl,
        backgroundColor: sereneColors['surface-container-lowest'],
        ...sereneShadows.card,
        padding: sereneSpacing['space-md'],
        overflow: 'hidden',
      }}
    >
      {/* Indicador tactil izquierdo */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: s(6),
          backgroundColor: sereneColors['primary-container'],
          borderTopRightRadius: sereneBorderRadius.xl,
          borderBottomRightRadius: sereneBorderRadius.xl,
        }}
      />

      <View style={{ paddingLeft: s(4), gap: s(14) }}>
        {/* Row: badge "En foco principal" + duracion ~4 min */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: s(8),
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: s(6),
              paddingHorizontal: s(10),
              paddingVertical: s(2),
              borderRadius: sereneBorderRadius.full,
              backgroundColor: withAlpha(sereneColors['secondary-container'], 0.7),
            }}
          >
            <View
              style={{
                width: s(6),
                height: s(6),
                borderRadius: sereneBorderRadius.full,
                backgroundColor: sereneColors['primary-container'],
              }}
            />
            <RNText
              style={[
                sereneTypography['label-sm'] as TextStyle,
                {
                  color: sereneColors['primary-container'],
                  textTransform: 'uppercase',
                  fontWeight: '600',
                },
              ]}
            >
              {badge}
            </RNText>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(4) }}>
            <MaterialCommunityIcons
              name={mci('schedule')}
              size={s(15)}
              color={sereneColors['primary-container']}
            />
            <RNText
              style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
            >
              {minutesLabel}
            </RNText>
          </View>
        </View>

        {/* Titulo */}
        <View style={{ gap: s(4) }}>
          <RNText
            numberOfLines={2}
            style={[sereneTypography['headline-sm'] as TextStyle, { color: sereneColors['on-surface'] }]}
          >
            {title}
          </RNText>

          {/* Paso actual */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(8) }}>
            <MaterialCommunityIcons
              name={mci('subdirectory_arrow_right')}
              size={s(16)}
              color={sereneColors['primary-container']}
            />
            <RNText
              numberOfLines={2}
              style={[
                sereneTypography['body-sm'] as TextStyle,
                { color: sereneColors['on-surface-variant'], fontWeight: '500', flex: 1 },
              ]}
            >
              {stepLabel}: {stepTitle}
            </RNText>
          </View>
        </View>

        {/* Avance de sesion */}
        <View style={{ gap: s(6) }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <RNText
              style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
            >
              {sessionLabel}
            </RNText>
            <RNText
              style={[
                sereneTypography['label-sm'] as TextStyle,
                { color: sereneColors['primary-container'], fontWeight: '600' },
              ]}
            >
              {Math.round(sessionPercent * 100)}%
            </RNText>
          </View>
          <ProgressTrack
            progress={sessionPercent}
            height={s(8)}
            fillColor={sereneColors['primary-container']}
            trackColor={sereneColors['surface-container']}
          />
        </View>

        {/* CTA + toggle */}
        <View style={{ gap: s(8) }}>
          <Pressable
            onPress={onResume}
            accessibilityRole="button"
            accessibilityLabel={primaryCta}
            style={({ pressed }) => ({
              height: s(44),
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: s(8),
              borderRadius: sereneBorderRadius.lg,
              backgroundColor: sereneColors['primary-container'],
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <MaterialCommunityIcons name={mci('play_arrow')} size={s(18)} color={sereneColors['on-primary']} />
            <RNText
              style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}
            >
              {primaryCta}
            </RNText>
          </Pressable>

          <Pressable
            onPress={() => setStepsOpen((v) => !v)}
            accessibilityRole="button"
            accessibilityState={{ expanded: stepsOpen }}
            style={({ pressed }) => ({
              paddingVertical: s(4),
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: s(4),
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <RNText
              style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['primary-container'] }]}
            >
              {stepsOpen ? toggleClose : toggleOpen}
            </RNText>
            <MaterialCommunityIcons
              name={stepsOpen ? mci('expand_less') : mci('arrow_forward')}
              size={s(14)}
              color={sereneColors['primary-container']}
            />
          </Pressable>

          {stepsOpen && (
            <View
              style={{
                padding: s(12),
                borderRadius: sereneBorderRadius.lg,
                backgroundColor: sereneColors['surface-container-low'],
                gap: s(8),
              }}
            >
              {steps.map((step, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: s(8) }}>
                  <View
                    style={{
                      width: s(16),
                      height: s(16),
                      borderRadius: sereneBorderRadius.full,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: step.done
                        ? sereneColors['primary-container']
                        : step.current
                          ? sereneColors['secondary-container']
                          : sereneColors['surface-container-high'],
                    }}
                  >
                    {step.done ? (
                      <MaterialCommunityIcons
                        name={mci('check')}
                        size={s(12)}
                        color={sereneColors['on-primary']}
                      />
                    ) : (
                      <RNText
                        style={[
                          sereneTypography['label-sm'] as TextStyle,
                          {
                            color: step.current
                              ? sereneColors['primary-container']
                              : sereneColors['on-surface-variant'],
                            fontWeight: step.current ? '600' : '400',
                          },
                        ]}
                      >
                        {idx + 1}
                      </RNText>
                    )}
                  </View>
                  <RNText
                    numberOfLines={1}
                    style={[
                      sereneTypography['body-sm'] as TextStyle,
                      {
                        flex: 1,
                        color: step.done || !step.current
                          ? sereneColors['on-surface-variant']
                          : sereneColors['on-surface'],
                        textDecorationLine: step.done ? 'line-through' : 'none',
                        opacity: step.current ? 1 : 0.6,
                        fontWeight: step.current ? '500' : '400',
                      },
                    ]}
                  >
                    {step.title}
                  </RNText>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}