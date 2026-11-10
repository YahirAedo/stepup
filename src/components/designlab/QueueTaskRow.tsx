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
import SegmentedProgressBar, { type StepSegmentStatus } from './SegmentedProgressBar';

export type QueueTaskStatus = 'ready' | 'completed';

export interface QueueTaskItem {
  id: string;
  name: string;
  stepCount: number;
  totalMinutes: number;
  status: QueueTaskStatus;
  /** Estados de cada paso para la barra de avance (uno por paso). */
  stepStatuses?: StepSegmentStatus[];
  /** Fecha meta (dato neutro), ya formateada. Opcional. */
  dueLabel?: string;
  /** Fecha de finalizacion (dato neutro), ya formateada. Solo tareas completadas. */
  completedDate?: string;
}

export interface QueueTaskRowProps {
  item: QueueTaskItem;
  onPress?: () => void;
}

/**
 * Fila de la "Lista en espera" (bloque F del Listado).
 *
 * Nombre truncado en una línea, barra de avance debajo (si tiene pasos) o chip
 * compacto "Definir" (si no tiene pasos), ícono de calendario con fecha (si
 * hay) y flecha de navegar a la derecha. Tocar la tarjeta abre únicamente el
 * Detalle de la tarea.
 *
 * Tareas completadas: fondo salvia, círculo con check a la izquierda, título
 * sin tachado ni pill, fecha de finalización y flecha hacia abajo.
 */
export default function QueueTaskRow({ item, onPress }: QueueTaskRowProps) {
  const { scale: s } = useResponsive();
  const isCompleted = item.status === 'completed';
  const hasSteps = item.stepCount > 0;
  const stepStatuses = item.stepStatuses ?? Array(item.stepCount).fill('pending');
  const doneCount = stepStatuses.filter((s) => s === 'done').length;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={isCompleted ? `Ver detalles de ${item.name} (completada)` : `Ver detalles de ${item.name}`}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: sereneSpacing['space-md'],
        padding: s(14),
        borderRadius: sereneBorderRadius.xl,
        backgroundColor: isCompleted
          ? sereneColors['secondary-container']
          : sereneColors['surface-container-lowest'],
        ...sereneShadows.card,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: sereneSpacing['space-sm'], flex: 1, minWidth: 0 }}>
        {isCompleted ? (
          <View
            style={{
              width: s(28),
              height: s(28),
              borderRadius: s(14),
              backgroundColor: sereneColors['primary-container'],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name={mci('check')} size={s(14)} color={sereneColors['on-primary']} />
          </View>
        ) : null}

        <View style={{ minWidth: 0, gap: s(4), flex: 1 }}>
          <RNText
            numberOfLines={1}
            style={[
              sereneTypography['label-lg'] as TextStyle,
              {
                color: isCompleted ? sereneColors['on-surface-variant'] : sereneColors['on-surface'],
                textDecorationLine: isCompleted ? 'line-through' : 'none',
              },
            ]}
          >
            {item.name}
          </RNText>

          {/* Paso + tiempo total */}
          {hasSteps ? (
            <View style={{ marginTop: s(4) }}>
              <RNText
                style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
              >
                {item.stepCount} pasos (~{item.totalMinutes} min total)
              </RNText>
            </View>
          ) : null}

          {/* Fecha + calendario */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(6), marginTop: s(4) }}>
            {isCompleted && item.completedDate ? (
              <>
                <MaterialCommunityIcons
                  name={mci('calendar_today')}
                  size={s(14)}
                  color={sereneColors['on-surface-variant']}
                />
                <RNText
                  style={[
                    sereneTypography['label-sm'] as TextStyle,
                    { color: sereneColors['on-surface-variant'] },
                  ]}
                >
                  {item.completedDate}
                </RNText>
              </>
            ) : (
              item.dueLabel ? (
                <>
                  <MaterialCommunityIcons
                    name={mci('calendar_today')}
                    size={s(14)}
                    color={sereneColors['on-surface-variant']}
                  />
                  <RNText
                    style={[
                      sereneTypography['label-sm'] as TextStyle,
                      { color: sereneColors['on-surface-variant'] },
                    ]}
                  >
                    {item.dueLabel}
                  </RNText>
                </>
              ) : null
            )}
          </View>

          {/* Barra de avance (al fondo) o chip "Definir" */}
          {hasSteps ? (
            <View style={{ marginTop: s(4) }}>
              <SegmentedProgressBar
                statuses={stepStatuses}
                accessibilityLabel={`Avance de ${item.name}: ${doneCount} de ${item.stepCount} pasos completados`}
                accessibilityValue={{
                  text: item.stepCount > 0 ? `${Math.round((doneCount / item.stepCount) * 100)}%` : '0%',
                }}
              />
            </View>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: s(6),
                marginTop: s(4),
              }}
            >
              <View
                style={{
                  width: s(16),
                  height: s(16),
                  borderRadius: s(8),
                  backgroundColor: sereneColors['surface-container-high'],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialCommunityIcons name={mci('add_task')} size={s(10)} color={sereneColors['on-surface-variant']} />
              </View>
              <RNText
                style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
              >
                Definir pasos
              </RNText>
            </View>
          )}
        </View>
      </View>

      <Pressable
        onPress={onPress}
        hitSlop={s(8)}
        accessibilityRole="button"
        accessibilityLabel={isCompleted ? `Ver detalles de ${item.name} (completada)` : `Ver detalles de ${item.name}`}
        style={({ pressed }) => ({
          padding: s(6),
          borderRadius: sereneBorderRadius.lg,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <MaterialCommunityIcons
          name={isCompleted ? mci('expand_less') : mci('arrow_forward_ios')}
          size={s(20)}
          color={sereneColors['on-surface-variant']}
        />
      </Pressable>
    </Pressable>
  );
}