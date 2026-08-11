import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { TaskService } from '../services/TaskService';
import { Task } from '../types';
import { colors, typography, spacing, borderRadius, shadows, useBottomLayout } from '../theme';
import Button from '../components/Button';
import TextField from '../components/TextField';

type Props = {
  navigation: any;
  route: any;
};

export default function TaskFormScreen({ navigation, route }: Props) {
  const { contentPaddingBottom } = useBottomLayout();
  const existingTask: Task | undefined = route.params?.task;
  const isEditing = !!existingTask;

  const [name, setName] = useState(existingTask?.name ?? '');
  const [dueDate, setDueDate] = useState(existingTask?.due_date ?? '');
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(() => new Date());

  function parseISODate(dateStr: string): Date {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function toISODate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function formatDateForDisplay(dateStr: string): string {
    if (!dateStr) return '';
    const opt: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    };
    return parseISODate(dateStr).toLocaleDateString('es-AR', opt);
  }

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
          due_date: dueDate.trim() || null,
        });
      } else {
        await TaskService.create({
          name: name.trim(),
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
                dueDate ? typography['body-md'] : typography['body-md'],
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
            style={[typography['body-md'], { color: colors['on-primary-fixed'], lineHeight: 22 }]}
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
