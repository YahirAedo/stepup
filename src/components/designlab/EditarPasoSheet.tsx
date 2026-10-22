import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text as RNText,
  Pressable,
  TextInput,
  type TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheet from './BottomSheet';
import DurationChips from './DurationChips';
import MinutesStepper from './MinutesStepper';
import { mci } from './mciIconMap';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  withAlpha,
  useResponsive,
} from '../../theme/serene';
import { frictionIcons, frictionLabels, frictionLevelFor, nextStepPosition } from '../../utils/microplan';

export interface EditarPasoSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  /** Titulo de la tarea en contexto (no editable aca). */
  taskTitle: string;
  initialTitle: string;
  initialDuration: number;
  position: number;
  total: number;
}

/**
 * UNICA propuesta de "Editar paso" como bottom sheet (compartida por las 3
 * variantes). Es presentacional sobre props: la duracion calibra el badge de
 * friccion con la logica pura de `microplan`.
 *
 * // REQUIERE MIGRACIÓN: nota por paso (`Step.note`) no existe en el modelo.
 */
export default function EditarPasoSheet({
  visible,
  onClose,
  onSave,
  onDelete,
  taskTitle,
  initialTitle,
  initialDuration,
  position,
  total,
}: EditarPasoSheetProps) {
  const { scale: s } = useResponsive();
  const [title, setTitle] = useState(initialTitle);
  const [duration, setDuration] = useState(initialDuration);
  const [note, setNote] = useState('');
  const [pos, setPos] = useState(position);

  useEffect(() => {
    if (visible) {
      setTitle(initialTitle);
      setDuration(initialDuration);
      setNote('');
      setPos(position);
    }
  }, [visible, initialTitle, initialDuration, position]);

  const frictionLevel = frictionLevelFor(duration);
  const frictionColor = frictionLevel === 'high' ? sereneColors.error : sereneColors.primary;

  return (
    <BottomSheet visible={visible} onClose={onClose} closeLabel="Cerrar edición de paso">
      <ScrollView
        style={{ maxHeight: s(430) }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: sereneSpacing['space-md'], paddingBottom: sereneSpacing['space-sm'] }}
      >
        <View style={{ gap: s(2) }}>
          <RNText
            style={[
              sereneTypography['label-sm'] as TextStyle,
              { color: sereneColors['on-surface-variant'], textTransform: 'uppercase', letterSpacing: 0.6 },
            ]}
          >
            {`Tarea activa · ${taskTitle}`}
          </RNText>
          <RNText style={[sereneTypography['headline-sm'] as TextStyle, { color: sereneColors['on-surface'] }]}>
            Editar paso
          </RNText>
        </View>

        <View style={{ gap: sereneSpacing['space-xs'] }}>
          <RNText
            style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
          >
            Acción concreta y observable
          </RNText>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="¿Qué acción concreta vas a hacer?"
            placeholderTextColor={sereneColors['on-surface-variant']}
            multiline
            maxLength={80}
            style={[
              sereneTypography['body-md'] as TextStyle,
              {
                backgroundColor: sereneColors['surface-container-high'],
                borderRadius: sereneBorderRadius.lg,
                padding: sereneSpacing['space-md'],
                color: sereneColors['on-surface'],
                minHeight: s(64),
                textAlignVertical: 'top',
              },
            ]}
          />
          <RNText
            style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
          >
            Usá verbos directos: abrir, escribir, elegir, enviar.
          </RNText>
        </View>

        <DurationChips value={duration} onChange={setDuration} />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: sereneSpacing['space-sm'],
            flexWrap: 'wrap',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: s(6),
              paddingHorizontal: s(10),
              paddingVertical: s(6),
              borderRadius: sereneBorderRadius.full,
              backgroundColor: withAlpha(sereneColors['secondary-container'], 0.6),
            }}
          >
            <RNText style={[sereneTypography['body-sm'] as TextStyle, { color: frictionColor }]}>
              {frictionIcons[frictionLevel]}
            </RNText>
            <RNText style={[sereneTypography['label-md'] as TextStyle, { color: frictionColor }]}>
              {frictionLabels[frictionLevel]}
            </RNText>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: sereneSpacing['space-sm'] }}>
            <MinutesStepper value={duration} onChange={setDuration} />
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: sereneSpacing['space-sm'],
          }}
        >
          <RNText
            style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
          >
            {`Secuencia · Paso ${pos} de ${total}`}
          </RNText>
          <View style={{ flexDirection: 'row', gap: sereneSpacing['space-sm'] }}>
            <Pressable
              onPress={() => setPos((p) => nextStepPosition(p, total, 'up'))}
              accessibilityRole="button"
              accessibilityLabel="Mover paso arriba"
              style={({ pressed }) => ({
                width: s(44),
                height: s(44),
                borderRadius: sereneBorderRadius.lg,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: sereneColors['surface-container-low'],
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <MaterialCommunityIcons name={mci('expand_less')} size={s(20)} color={sereneColors['on-surface']} />
            </Pressable>
            <Pressable
              onPress={() => setPos((p) => nextStepPosition(p, total, 'down'))}
              accessibilityRole="button"
              accessibilityLabel="Mover paso abajo"
              style={({ pressed }) => ({
                width: s(44),
                height: s(44),
                borderRadius: sereneBorderRadius.lg,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: sereneColors['surface-container-low'],
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <MaterialCommunityIcons name={mci('expand_more')} size={s(20)} color={sereneColors['on-surface']} />
            </Pressable>
          </View>
        </View>

        <View style={{ gap: sereneSpacing['space-xs'] }}>
          <RNText
            style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
          >
            Nota mental para desatascarte (opcional)
          </RNText>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Ej: si te trabás, escribí una sola oración y seguí."
            placeholderTextColor={sereneColors['on-surface-variant']}
            multiline
            maxLength={140}
            style={[
              sereneTypography['body-md'] as TextStyle,
              {
                backgroundColor: sereneColors['surface-container-high'],
                borderRadius: sereneBorderRadius.lg,
                padding: sereneSpacing['space-md'],
                color: sereneColors['on-surface'],
                minHeight: s(64),
                textAlignVertical: 'top',
              },
            ]}
          />
          <RNText
            style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
          >
            // REQUIERE MIGRACIÓN: la nota por paso no existe todavía en el modelo.
          </RNText>
        </View>
      </ScrollView>

      <View style={{ gap: sereneSpacing['space-sm'], paddingTop: sereneSpacing['space-sm'] }}>
        <Pressable
          onPress={onSave}
          accessibilityRole="button"
          accessibilityLabel="Guardar paso"
          style={({ pressed }) => ({
            minHeight: s(48),
            borderRadius: sereneBorderRadius.lg,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: sereneColors.primary,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}>
            Guardar paso
          </RNText>
        </Pressable>

        <Pressable
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel="Eliminar este paso"
          style={({ pressed }) => ({
            minHeight: s(44),
            borderRadius: sereneBorderRadius.lg,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: pressed ? withAlpha(sereneColors['error-container'], 0.5) : 'transparent',
          })}
        >
          <RNText style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors.error }]}>
            Eliminar este paso
          </RNText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
