import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, Platform
} from 'react-native';
import { TaskService } from '../services/TaskService';
import { Task } from '../types';

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

    // Validar formato de fecha si se ingresó
    if (dueDate.trim()) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dueDate.trim())) {
        Alert.alert('Formato inválido', 'La fecha debe tener el formato AAAA-MM-DD.\nEjemplo: 2026-05-30');
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
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar la tarea. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>

        {/* Campo nombre */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nombre de la tarea *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Estudiar para el parcial de SO"
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={setName}
            autoFocus
            maxLength={120}
          />
          <Text style={styles.hint}>Usá un nombre claro para vos.</Text>
        </View>

        {/* Campo fecha límite */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Fecha límite</Text>
          <TextInput
            style={styles.input}
            placeholder="AAAA-MM-DD  (Ej: 2026-05-30)"
            placeholderTextColor="#94A3B8"
            value={dueDate}
            onChangeText={setDueDate}
            keyboardType="numeric"
            maxLength={10}
          />
          <Text style={styles.hint}>Opcional. Ayuda a priorizar.</Text>
        </View>

        {/* Tip */}
        <View style={styles.tip}>
          <Text style={styles.tipTitle}>💡 Tip</Text>
          <Text style={styles.tipText}>
            Después de crear la tarea podés dividirla en pasos pequeños de 5 a 15 minutos desde la pantalla de detalle.
          </Text>
        </View>

        {/* Botón guardar */}
        <TouchableOpacity
          style={[styles.btn, saving && styles.btnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>
            {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear tarea'}
          </Text>
        </TouchableOpacity>

        {/* Botón cancelar */}
        <TouchableOpacity
          style={styles.btnCancel}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.btnCancelText}>Cancelar</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  content: {
    padding: 20,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A3A5C',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#1A3A5C',
  },
  hint: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  tip: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: '#BFDBFE',
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D4ED8',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
  },
  btn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnDisabled: {
    backgroundColor: '#93C5FD',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  btnCancel: {
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  btnCancelText: {
    color: '#64748B',
    fontSize: 15,
  },
});