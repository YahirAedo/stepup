import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, ScrollView } from 'react-native';
import { TaskService } from '../services/TaskService';
import { Task } from '../types';
import { colors, typography, spacing, borderRadius } from '../theme';
import Button from '../components/Button';
import TextField from '../components/TextField';

type Props = {
  navigation: any;
  route: any;
};

export default function TaskFormScreen({ navigation, route }: Props) {
  const existingTask: Task | undefined = route.params?.task;
  const isEditing = !!existingTask;

  const [name, setName] = useState(existingTask?.name ?? '');
  const [dueDate, setDueDate] = useState(existingTask?.due_date ?? '');
  const [saving, setSaving] = useState(false);

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

    if (dueDate.trim()) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dueDate.trim())) {
        Alert.alert(
          'Formato inválido',
          'La fecha debe tener el formato AAAA-MM-DD.\nEjemplo: 2026-05-30',
        );
        return;
      }
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
      <View style={{ padding: spacing['container-padding'], gap: spacing['section-gap'] }}>
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
          <TextInput
            style={{
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: colors['outline-variant'],
              borderRadius: borderRadius.lg,
              padding: spacing['stack-gap'] - 4,
              fontSize: 16,
              color: colors['on-surface'],
            }}
            placeholder="AAAA-MM-DD  (Ej: 2026-05-30)"
            placeholderTextColor={colors['on-surface-variant']}
            value={dueDate}
            onChangeText={setDueDate}
            keyboardType="numeric"
            maxLength={10}
          />
          <Text style={[typography['body-md'], { color: colors['on-surface-variant'] }]}>
            Opcional. Ayuda a priorizar.
          </Text>
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
