import React from 'react';
import { View, Text as RNText, Pressable, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  useResponsive,
} from '../../theme/serene';
import { mci } from './mciIconMap';

export type StepSequenceVariant = 'completed' | 'active' | 'pending';

export interface StepSequenceItemProps {
  variant: StepSequenceVariant;
  /** Posicion 1-based; se muestra en el circulo cuando el paso esta pendiente. */
  index: number;
  title: string;
  /** "Completado · 2 min" | "En espera · 3 min". */
  meta: string;
  /** Duracion a la derecha (solo variante `active`). */
  minutes?: number;
  /** Descripcion corta (solo variante `active`). */
  description?: string;
  /** Pill del paso en foco, ej. "Foco actual" (solo `active`). */
  activeBadge?: string;
  /** CTA del paso activo, ej. "Ejecutar este paso ahora" (solo `active`). */
  activeCta?: string;
  onExecute?: () => void;
  /**
   * Etiqueta del botón "Comenzar" (solo `active`). Cuando se define junto con
   * `completeCta`, el paso en foco muestra DOS botones en fila en lugar de `activeCta`.
   */
  startCta?: string;
  /** Etiqueta del botón "Hecho" (solo `active`). */
  completeCta?: string;
  onStart?: () => void;
  onComplete?: () => void;
  onReorder?: () => void;
  onPress?: () => void;
}

/**
 * Fila de la "Secuencia de pasos" del Detalle. Tres variantes:
 *
 * - `completed`: paso hecho, atenuado (`opacity-75`), titulo tachado, check.
 * - `active`: paso en foco, tarjeta destacada con barra lateral, badge
 *   "Foco actual", duracion y acciones. Con `startCta`/`completeCta` muestra dos
 *   botones en fila ("Comenzar" + "Hecho"); si no, cae al CTA unico `activeCta`.
 * - `pending`: paso en espera, circulo numerado y handle de reordenar.
 */
export default function StepSequenceItem({
  variant,
  index,
  title,
  meta,
  minutes,
  description,
  activeBadge = 'Foco actual',
  activeCta,
  onExecute,
  startCta,
  completeCta,
  onStart,
  onComplete,
  onReorder,
  onPress,
}: StepSequenceItemProps) {
  const { scale: s } = useResponsive();

  if (variant === 'active') {
    return (
      <View
        style={{
          backgroundColor: sereneColors['surface-container-lowest'],
          borderRadius: sereneBorderRadius.xl,
          padding: sereneSpacing['space-md'],
          gap: sereneSpacing['space-sm'],
          ...sereneShadows.card,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: s(6),
            backgroundColor: sereneColors.primary,
          }}
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: sereneSpacing['space-xs'],
            paddingLeft: s(4),
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: s(4),
              paddingHorizontal: s(8),
              paddingVertical: s(2),
              borderRadius: sereneBorderRadius.full,
              backgroundColor: sereneColors.primary,
            }}
          >
            <MaterialCommunityIcons name={mci('target')} size={s(13)} color={sereneColors['on-primary']} />
            <RNText
              style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-primary'] }]}
            >
              {activeBadge}
            </RNText>
          </View>

          {minutes !== undefined && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(4) }}>
              <MaterialCommunityIcons name={mci('schedule')} size={s(15)} color={sereneColors.primary} />
              <RNText
                style={[
                  sereneTypography['label-md'] as TextStyle,
                  { color: sereneColors.primary, fontWeight: '500' },
                ]}
              >
                {minutes} min
              </RNText>
            </View>
          )}
        </View>

        <View style={{ paddingLeft: s(4), gap: s(4) }}>
          <RNText
            style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'] }]}
          >
            {title}
          </RNText>
          {description !== undefined && (
            <RNText
              style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
            >
              {description}
            </RNText>
          )}
        </View>

        {completeCta !== undefined ? (
          <View
            style={{
              paddingTop: s(4),
              paddingLeft: s(4),
              flexDirection: 'row',
              gap: s(8),
            }}
          >
            {startCta !== undefined && (
              <Pressable
                onPress={onStart}
                accessibilityRole="button"
                accessibilityLabel={startCta}
                style={({ pressed }) => ({
                  flex: 1,
                  height: s(44),
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: s(6),
                  borderRadius: sereneBorderRadius.lg,
                  backgroundColor: sereneColors['primary-container'],
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <MaterialCommunityIcons name={mci('play_arrow')} size={s(18)} color={sereneColors['on-primary']} />
                <RNText
                  style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}
                >
                  {startCta}
                </RNText>
              </Pressable>
            )}

            <Pressable
              onPress={onComplete}
              accessibilityRole="button"
              accessibilityLabel={completeCta}
              style={({ pressed }) => ({
                flex: 1,
                height: s(44),
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: s(6),
                borderRadius: sereneBorderRadius.lg,
                backgroundColor: sereneColors['surface-container-lowest'],
                borderWidth: 1,
                borderColor: sereneColors.primary,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <MaterialCommunityIcons name={mci('done')} size={s(18)} color={sereneColors.primary} />
              <RNText
                style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors.primary }]}
              >
                {completeCta}
              </RNText>
            </Pressable>
          </View>
        ) : activeCta !== undefined ? (
          <View style={{ paddingTop: s(4), paddingLeft: s(4) }}>
            <Pressable
              onPress={onExecute}
              accessibilityRole="button"
              accessibilityLabel={activeCta}
              style={({ pressed }) => ({
                width: '100%',
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
                {activeCta}
              </RNText>
            </Pressable>
          </View>
        ) : null}
      </View>
    );
  }

  const isCompleted = variant === 'completed';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => ({
        backgroundColor: isCompleted
          ? sereneColors['surface-container-low']
          : sereneColors['surface-container-lowest'],
        borderRadius: sereneBorderRadius.xl,
        padding: sereneSpacing['space-sm'],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: sereneSpacing['space-sm'],
        opacity: isCompleted ? 0.75 : 1,
        ...(isCompleted ? {} : sereneShadows.card),
        ...(pressed ? { opacity: isCompleted ? 0.85 : 0.92 } : {}),
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: sereneSpacing['space-sm'], flex: 1, minWidth: 0 }}>
        <View
          style={{
            width: s(28),
            height: s(28),
            borderRadius: sereneBorderRadius.full,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isCompleted
              ? sereneColors.primary
              : sereneColors['surface-container-high'],
          }}
        >
          {isCompleted ? (
            <MaterialCommunityIcons name={mci('done')} size={s(18)} color={sereneColors['on-primary']} />
          ) : (
            <RNText
              style={[
                sereneTypography['label-md'] as TextStyle,
                { color: sereneColors['on-surface-variant'] },
              ]}
            >
              {index}
            </RNText>
          )}
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <RNText
            numberOfLines={1}
            style={[
              sereneTypography['body-md'] as TextStyle,
              {
                color: isCompleted ? sereneColors['on-surface-variant'] : sereneColors['on-surface'],
                textDecorationLine: isCompleted ? 'line-through' : 'none',
              },
            ]}
          >
            {title}
          </RNText>
          <RNText
            style={[
              sereneTypography['label-sm'] as TextStyle,
              { color: sereneColors['on-surface-variant'], marginTop: s(2) },
            ]}
          >
            {meta}
          </RNText>
        </View>
      </View>

      {isCompleted ? (
        <MaterialCommunityIcons name={mci('check_circle')} size={s(20)} color={sereneColors['outline-variant']} />
      ) : (
        <Pressable
          onPress={onReorder}
          hitSlop={s(8)}
          accessibilityRole="button"
          accessibilityLabel={`Reordenar ${title}`}
          style={({ pressed }) => ({
            width: s(32),
            height: s(32),
            borderRadius: sereneBorderRadius.DEFAULT,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <MaterialCommunityIcons name={mci('drag_handle')} size={s(19)} color={sereneColors.outline} />
        </Pressable>
      )}
    </Pressable>
  );
}