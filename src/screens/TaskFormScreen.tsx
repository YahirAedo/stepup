import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ScrollView, Pressable, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TasksStackParamList } from '../types/navigation';
import { TaskService } from '../services/TaskService';
import { parseISODate, toISODate, formatDateForDisplay } from '../services/dateFormat';
import { Task } from '../types';
import { colors, typography, spacing, borderRadius, shadows, useBottomLayout } from '../theme';
import Button from '../components/Button';
import TextField from '../components/TextField';

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

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Campo requerido', 'El nombre de la tarea no puede estar vacío.');
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await TaskService.update(existingTask.id, {
          name: name.trim(),
          description: description.trim() || null,
          due_date: dueDate.trim() || null,
        });
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

        {/* Due date */}
        <View style={{ gap: spacing.unit * 2 }}>
          <Text
            style={[
              typography['label-sm'],
              {
                color: colors.secondary,
                textTransform: 'uppercase',
                letterSpacing: 1,
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
                <Pressable
                  onPress={handleClearDate}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Borrar fecha límite"
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={20}
                    color={colors['on-surface-variant']}
                  />
                </Pressable>
              ) : (
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={20}
                  color={colors['on-surface-variant']}
                />
              )}
            </View>
          ) : (
            <Pressable
              onPress={openDatePicker}
              accessibilityRole="button"
              accessibilityLabel="Seleccionar fecha límite"
              style={({ pressed }) => ({
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
                opacity: pressed ? 0.7 : 1,
              })}
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
                <Pressable
                  onPress={handleClearDate}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Borrar fecha límite"
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={20}
                    color={colors['on-surface-variant']}
                  />
                </Pressable>
              ) : (
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={20}
                  color={colors['on-surface-variant']}
                />
              )}
            </Pressable>
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
              typography['label-md'],
              { color: colors['on-primary-fixed'], marginBottom: spacing.unit },
            ]}
          >
            💡 Tip
          </Text>
          <Text
            style={[typography['body-md'], { color: colors['on-primary-fixed'] }]}
          >
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
