import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TasksStackParamList } from '../types/navigation';
import { TaskService } from '../services/TaskService';
import { AIService, aiErrorMessage } from '../services/AIService';
import { hasSession } from '../services/session';
import { parseISODate, toISODate, formatDateForDisplay } from '../services/dateFormat';
import { Task, DescriptionSection, DraftStep } from '../types';
import { colors, typography, spacing, borderRadius, shadows, useBottomLayout } from '../theme';
import { useIsOnline } from '../hooks/useIsOnline';
import { parseDraftSteps } from '../utils/draftSteps';
import Button from '../components/Button';
import TextField from '../components/TextField';
import SuggestedStepsDraft from '../components/SuggestedStepsDraft';

type Props = NativeStackScreenProps<TasksStackParamList, 'TaskForm'>;

export default function TaskFormScreen({ navigation, route }: Props) {
  const { contentPaddingBottom } = useBottomLayout();
  const existingTask: Task | undefined = route.params?.task;
  const isEditing = !!existingTask;

  const [name, setName] = useState(existingTask?.name ?? '');
  const [description, setDescription] = useState(existingTask?.description ?? '');
  const [dueDate, setDueDate] = useState(existingTask?.due_date ?? '');
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(() => new Date());

  const isOnline = useIsOnline();
  const aiVisible = !isEditing && isOnline && hasSession();
  const [suggesting, setSuggesting] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftStep[] | null>(null);
  const [describing, setDescribing] = useState(false);
  const [describeError, setDescribeError] = useState<string | null>(null);
  const [describeSections, setDescribeSections] = useState<DescriptionSection[] | null>(null);

  function openDatePicker() {
    setPickerDate(dueDate ? parseISODate(dueDate) : new Date());

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: dueDate ? parseISODate(dueDate) : new Date(),
        mode: 'date',
        onChange: onDateChange,
      });
      return;
    }

    setShowDatePicker(true);
  }

  function onDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (event.type === 'set' && selectedDate) {
      setDueDate(toISODate(selectedDate));
    }
  }

  function handleClearDate() {
    setDueDate('');
    setShowDatePicker(false);
  }

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Editar tarea' : 'Nueva tarea',
    });
  }, []);

  // IA — sugerir pasos (HU-4..HU-8, HU-10). "Otra propuesta" re-usa esta misma función:
  // descarta el borrador actual y regenera la secuencia completa.
  async function handleSuggestSteps() {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'Poné un nombre a la tarea para que la IA tenga contexto.');
      return;
    }
    setSuggesting(true);
    setAiError(null);
    setDraft(null);
    try {
      const steps = await AIService.suggestSteps(name, description);
      setDraft(
        steps.map((step, index) => ({
          key: `ai-${index}`,
          name: step.name,
          durationMin: String(step.duration_min),
        })),
      );
    } catch (err) {
      setAiError(aiErrorMessage(err));
    } finally {
      setSuggesting(false);
    }
  }

  // IA — asistente de descripción (HU-3): muestra una estructura contextual para completar.
  async function handleDescribeHelp() {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'Poné un nombre a la tarea para armar la estructura.');
      return;
    }
    setDescribing(true);
    setDescribeError(null);
    try {
      const sections = await AIService.describeHelp(name);
      setDescribeSections(sections);
    } catch (err) {
      setDescribeError(aiErrorMessage(err));
    } finally {
      setDescribing(false);
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Campo requerido', 'El nombre de la tarea no puede estar vacío.');
      return;
    }

    const parsedSteps: Array<{ name: string; duration_min: number | null }> = [];
    if (!isEditing && draft && draft.length > 0) {
      const result = parseDraftSteps(draft);
      if (!result.ok) {
        Alert.alert('Borrador inválido', result.message);
        return;
      }
      parsedSteps.push(...result.steps);
    }

    setSaving(true);
    try {
      if (isEditing) {
        await TaskService.update(existingTask.id, {
          name: name.trim(),
          description: description.trim() || null,
          due_date: dueDate.trim() || null,
        });
      } else if (parsedSteps.length > 0) {
        // HU-12: la tarea y sus pasos nacen juntos en una sola acción.
        await TaskService.createWithSteps(
          {
            name: name.trim(),
            description: description.trim() || null,
            due_date: dueDate.trim() || null,
          },
          parsedSteps,
        );
      } else {
        await TaskService.create({
          name: name.trim(),
          description: description.trim() || null,
          due_date: dueDate.trim() || null,
        });
      }
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'No se pudo guardar la tarea. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface }}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={{
          padding: spacing['container-padding'],
          paddingBottom: contentPaddingBottom,
          gap: spacing['section-gap'],
        }}
      >
        {/* Task name */}
        <TextField
          label="Nombre de la tarea *"
          placeholder="Ej: Estudiar para el parcial de SO"
          value={name}
          onChangeText={setName}
          autoFocus
          maxLength={120}
          hint="Usá un nombre claro para vos."
        />

        {/* Description */}
        <View style={{ gap: spacing['stack-gap'] - 4 }}>
          <TextField
            label="Descripción"
            placeholder="Ej: Parcial de Sistemas Operativos, temas: memoria virtual, procesos, deadlocks..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={1000}
            hint="Opcional. Ayuda a dividir mejor la tarea en pasos."
            style={{
              ...typography['body-md'],
              minHeight: 100,
              textAlignVertical: 'top',
            }}
          />

          {aiVisible && (
            <>
              <Button
                title={describeSections ? 'Regenerar estructura' : 'Ayudame a describir'}
                onPress={handleDescribeHelp}
                variant="secondary"
                disabled={describing || suggesting}
                icon={
                  describing ? (
                    <ActivityIndicator size="small" color={colors['on-surface-variant']} />
                  ) : (
                    <MaterialCommunityIcons
                      name="auto-fix"
                      size={18}
                      color={colors['on-surface-variant']}
                    />
                  )
                }
              />

              {describeSections && (
                <View
                  style={{
                    backgroundColor: colors['surface-container-low'],
                    borderRadius: borderRadius.lg,
                    borderWidth: 1,
                    borderColor: colors['outline-variant'],
                    padding: spacing['stack-gap'],
                    gap: spacing['stack-gap'] - 4,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={[typography['label-md'], { color: colors.secondary }]}>
                      Estructura sugerida
                    </Text>
                    <TouchableOpacity
                      onPress={() => setDescribeSections(null)}
                      accessibilityRole="button"
                      accessibilityLabel="Cerrar estructura sugerida"
                      hitSlop={8}
                      style={{
                        minWidth: 48,
                        minHeight: 48,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <MaterialCommunityIcons
                        name="close"
                        size={20}
                        color={colors['on-surface-variant']}
                      />
                    </TouchableOpacity>
                  </View>
                  {describeSections.map((section, index) => (
                    <View key={index} style={{ gap: 2 }}>
                      <Text style={[typography['label-md'], { color: colors['on-surface'] }]}>
                        {index + 1}. {section.title}
                      </Text>
                      <Text
                        style={[typography['body-md'], { color: colors['on-surface-variant'] }]}
                      >
                        {section.guiding_question}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {describeError && (
                <Text style={[typography['body-md'], { color: colors.error }]}>
                  {describeError}
                </Text>
              )}
            </>
          )}
        </View>

        {/* IA — sugerir pasos */}
        {aiVisible && (
          <View style={{ gap: spacing['stack-gap'] - 4 }}>
            <Button
              title="Sugerir pasos con IA"
              onPress={handleSuggestSteps}
              variant="tertiary"
              disabled={suggesting}
              icon={
                <MaterialCommunityIcons
                  name="creation-outline"
                  size={20}
                  color={colors['on-tertiary']}
                />
              }
            />

            {(suggesting || !!aiError || !!draft) && (
              <SuggestedStepsDraft
                draft={draft}
                onChangeDraft={setDraft}
                onRegenerate={handleSuggestSteps}
                suggesting={suggesting}
                error={aiError}
              />
            )}
          </View>
        )}

        {/* Due date */}
        <View style={{ gap: spacing.unit * 2 }}>
          <Text
            style={[
              typography['label-sm'],
              {
                color: colors.secondary,
                textTransform: 'uppercase',
                paddingLeft: 4,
              },
            ]}
          >
            Fecha límite
          </Text>
          {Platform.OS === 'web' ? (
            <View
              style={{
                backgroundColor: colors['surface-container-lowest'],
                borderWidth: 1,
                borderColor: colors['outline-variant'],
                borderRadius: borderRadius.lg,
                paddingHorizontal: spacing['stack-gap'] - 4,
                height: 56,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing['stack-gap'] - 4,
                ...shadows.ambient,
              }}
            >
              <MaterialCommunityIcons
                name="calendar-month-outline"
                size={22}
                color={dueDate ? colors['primary-container'] : colors['on-surface-variant']}
              />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{
                  flex: 1,
                  height: '100%',
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: typography['body-md'].fontSize,
                  fontFamily: typography['body-md'].fontFamily,
                  lineHeight: typography['body-md'].lineHeight,
                  color: dueDate ? colors['on-surface'] : colors['on-surface-variant'],
                }}
              />
              {dueDate ? (
                <TouchableOpacity onPress={handleClearDate} hitSlop={8}>
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={20}
                    color={colors['on-surface-variant']}
                  />
                </TouchableOpacity>
              ) : (
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={20}
                  color={colors['on-surface-variant']}
                />
              )}
            </View>
          ) : (
            <TouchableOpacity
              onPress={openDatePicker}
              activeOpacity={0.7}
              style={{
                backgroundColor: colors['surface-container-lowest'],
                borderWidth: 1,
                borderColor: colors['outline-variant'],
                borderRadius: borderRadius.lg,
                paddingHorizontal: spacing['stack-gap'] - 4,
                height: 56,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing['stack-gap'] - 4,
                ...shadows.ambient,
              }}
            >
              <MaterialCommunityIcons
                name="calendar-month-outline"
                size={22}
                color={dueDate ? colors['primary-container'] : colors['on-surface-variant']}
              />
              <Text
                style={[
                  typography['body-md'],
                  {
                    color: dueDate ? colors['on-surface'] : colors['on-surface-variant'],
                    flex: 1,
                  },
                ]}
                numberOfLines={1}
              >
                {dueDate ? formatDateForDisplay(dueDate) : 'Seleccionar fecha'}
              </Text>
              {dueDate ? (
                <TouchableOpacity onPress={handleClearDate} hitSlop={8}>
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={20}
                    color={colors['on-surface-variant']}
                  />
                </TouchableOpacity>
              ) : (
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={20}
                  color={colors['on-surface-variant']}
                />
              )}
            </TouchableOpacity>
          )}
          <Text style={[typography['body-md'], { color: colors['on-surface-variant'] }]}>
            Opcional. Ayuda a priorizar.
          </Text>

          {showDatePicker && Platform.OS === 'ios' && (
            <DateTimePicker
              value={pickerDate}
              mode="date"
              display="inline"
              onChange={onDateChange}
            />
          )}
        </View>

        {/* Tip */}
        <View
          style={{
            backgroundColor: colors['primary-fixed'],
            borderRadius: borderRadius.lg,
            padding: spacing['stack-gap'] - 2,
            borderWidth: 1,
            borderColor: colors['primary-container'],
          }}
        >
          <Text
            style={[
              typography['label-sm'],
              { color: colors['on-primary-fixed'], textTransform: 'uppercase', marginBottom: spacing.unit },
            ]}
          >
            💡 Tip
          </Text>
          <Text style={[typography['body-md'], { color: colors['on-primary-fixed'] }]}>
            Después de crear la tarea podés dividirla en pasos pequeños de 5 a 15 minutos desde la
            pantalla de detalle.
          </Text>
        </View>

        {/* Buttons */}
        <View style={{ gap: spacing['stack-gap'] - 6 }}>
          <Button
            title={saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear tarea'}
            onPress={handleSave}
            variant="primary"
            disabled={saving}
          />
          <Button title="Cancelar" onPress={() => navigation.goBack()} variant="secondary" />
        </View>
      </View>
    </ScrollView>
  );
}
