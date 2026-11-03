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
import BottomSheet from '../../components/designlab/BottomSheet';
import { mci } from '../designlab/mciIconMap';
import { taskEditCopy as f } from '../../features/tasks/logic/taskEditCopy';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  useResponsive,
} from '../../theme/serene';

export interface EditarPasoSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Recibe el nombre, la duración y el estado editados. */
  onSave: (values: { title: string; duration: number; status: 'pending' | 'completed' }) => void;
  /** Título de la tarea en contexto (no editable acá). */
  taskTitle: string;
  initialTitle: string;
  initialDuration: number;
  /** Estado inicial del paso. */
  initialStatus?: 'pending' | 'completed';
  position: number;
  total: number;
  error?: string | null;
  /** Modo del sheet: 'edit' (default) o 'create'. */
  mode?: 'create' | 'edit';
  /** Si es true, no se muestra el selector de estado y onSave devuelve initialStatus. */
  hideStatus?: boolean;
}

/**
 * Única propuesta de "Editar paso" como bottom sheet (compartida por las 3
 * variantes). Nombre, duración y estado del paso. Sin nota, sin papelera, sin +/-
 * en la duración (se escribe directamente), sin subir/bajar, con el mínimo de pasos.
 *
 * Es presentacional sobre props: la pantalla host persiste el resultado.
 *
 * // REQUIERE MIGRACIÓN: `onSave` aún no conecta con StepService; el paso
 * real se guarda al salir de la pantalla (Crear/Editar/Detalle).
 */
export default function EditarPasoSheet({
  visible,
  onClose,
  onSave,
  taskTitle,
  initialTitle,
  initialDuration,
  initialStatus = 'pending',
  position,
  total,
  error,
  mode = 'edit',
  hideStatus = false,
}: EditarPasoSheetProps) {
  const { scale: s } = useResponsive();
  const [title, setTitle] = useState(initialTitle);
  const [duration, setDuration] = useState(String(initialDuration));
  const [status, setStatus] = useState<'pending' | 'completed'>(initialStatus);

  useEffect(() => {
    if (visible) {
      setTitle(initialTitle);
      setDuration(String(initialDuration));
      setStatus(initialStatus);
    }
  }, [visible, initialTitle, initialDuration, initialStatus]);

  const handleSave = () => {
    const nextDuration = Math.max(1, Number(duration) || 1);
    onSave({ title: title.trim(), duration: nextDuration, status: hideStatus ? initialStatus : status });
  };

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
            {mode === 'create' ? 'Nuevo paso' : 'Editar paso'}
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

        <View style={{ gap: sereneSpacing['space-xs'] }}>
          <RNText
            style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
          >
            Duración (minutos)
          </RNText>
          <TextInput
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            placeholder="Ej: 5"
            placeholderTextColor={sereneColors['on-surface-variant']}
            maxLength={3}
            style={[
              sereneTypography['body-md'] as TextStyle,
              {
                backgroundColor: sereneColors['surface-container-high'],
                borderRadius: sereneBorderRadius.lg,
                padding: sereneSpacing['space-md'],
                color: sereneColors['on-surface'],
                minHeight: s(56),
                textAlignVertical: 'top',
              },
            ]}
          />
        </View>

        {!hideStatus && (
        <View style={{ gap: sereneSpacing['space-xs'] }}>
          <RNText
            style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
          >
            {f.stepStatus.label}
          </RNText>
          <View
            accessibilityRole="radiogroup"
            accessibilityLabel={f.stepStatus.label}
            style={{ flexDirection: 'row', gap: sereneSpacing['space-sm'] }}
          >
            {(['pending', 'completed'] as const).map((opt) => {
              const checked = status === opt;
              const label = opt === 'pending' ? f.stepStatus.pending : f.stepStatus.completed;
              return (
                <Pressable
                  key={opt}
                  onPress={() => setStatus(opt)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked }}
                  accessibilityLabel={label}
                  style={({ pressed }) => ({
                    flex: 1,
                    minHeight: s(48),
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: sereneSpacing['space-sm'],
                    paddingHorizontal: sereneSpacing['space-sm'],
                    paddingVertical: sereneSpacing['space-sm'],
                    borderRadius: sereneBorderRadius.lg,
                    backgroundColor: checked
                      ? sereneColors['primary-container']
                      : sereneColors['surface-container-high'],
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  {checked && (
                    <MaterialCommunityIcons
                      name={mci('check')}
                      size={s(18)}
                      color={checked ? sereneColors['on-primary'] : sereneColors['on-surface']}
                    />
                  )}
                  <RNText
                    style={[
                      sereneTypography['label-md'] as TextStyle,
                      {
                        color: checked ? sereneColors['on-primary'] : sereneColors['on-surface'],
                        fontWeight: checked ? '700' : '400',
                      },
                    ]}
                  >
                    {label}
                  </RNText>
                </Pressable>
              );
            })}
          </View>
        </View>
        )}

        {error && (
          <RNText
            style={[sereneTypography['caption'] as TextStyle, { color: sereneColors.error }]}
          >
            {error}
          </RNText>
        )}

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
            {`Secuencia · Paso ${position} de ${total}`}
          </RNText>
        </View>
      </ScrollView>

      <Pressable
        onPress={handleSave}
        accessibilityRole="button"
        accessibilityLabel={mode === 'create' ? 'Añadir paso' : 'Guardar paso'}
        style={({ pressed }) => ({
          minHeight: s(48),
          borderRadius: sereneBorderRadius.lg,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: sereneColors.primary,
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <MaterialCommunityIcons name={mci('check')} size={s(18)} color={sereneColors['on-primary']} />
        <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}>
          {mode === 'create' ? 'Añadir paso' : 'Guardar paso'}
        </RNText>
      </Pressable>
    </BottomSheet>
  );
}
