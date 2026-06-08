import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView
} from 'react-native';
import { StepService } from '../services/StepService';
import { Step } from '../types';

type Props = {
  navigation: any;
  route: any;
};

export default function StepFormScreen({ navigation, route }: Props) {
  const { taskId, stepId } = route.params;
  const isEditing = !!stepId;

  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Editar paso' : 'Nuevo paso' });
    if (isEditing) loadStep();
  }, []);

  async function loadStep() {
    const steps = await StepService.getByTask(taskId);
    const step = steps.find((s: Step) => s.id === stepId);
    if (step) {
      setName(step.name);
      setDuration(step.duration_min ? String(step.duration_min) : '');
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Campo requerido', 'El nombre del paso no puede estar vacío.');
      return;
    }

    const dur = duration.trim() ? parseInt(duration.trim(), 10) : null;
    if (duration.trim() && (isNaN(dur!) || dur! <= 0)) {
      Alert.alert('Duración inválida', 'Ingresá un número de minutos válido. Ej: 15');
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await StepService.update(stepId, { name: name.trim(), duration_min: dur });
      } else {
        await StepService.add({ task_id: taskId, name: name.trim(), duration_min: dur });
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el paso. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Descripción del paso *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Leer las primeras 10 páginas"
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={setName}
            autoFocus
            maxLength={200}
            multiline
          />
          <Text style={styles.hint}>Tiene que ser algo que puedas hacer ahora.</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Duración estimada (minutos)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 15"
            placeholderTextColor="#94A3B8"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            maxLength={3}
          />
          <Text style={styles.hint}>Opcional. Se usa para el timer.</Text>
        </View>

        {/* Sugerencias de duración */}
        <View style={styles.suggestions}>
          <Text style={styles.suggestionsLabel}>Sugerencias rápidas:</Text>
          <View style={styles.suggestionRow}>
            {['5', '10', '15', '20', '30'].map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.suggestionBtn, duration === d && styles.suggestionBtnActive]}
                onPress={() => setDuration(d)}
              >
                <Text style={[styles.suggestionText, duration === d && styles.suggestionTextActive]}>
                  {d} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btn, saving && styles.btnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>
            {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Agregar paso'}
          </Text>
        </TouchableOpacity>

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
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  content: { padding: 20 },
  fieldGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#1A3A5C', marginBottom: 6 },
  input: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 10, padding: 12, fontSize: 14, color: '#1A3A5C',
  },
  hint: { fontSize: 11, color: '#94A3B8', marginTop: 4 },
  suggestions: { marginBottom: 24 },
  suggestionsLabel: { fontSize: 12, color: '#64748B', marginBottom: 8 },
  suggestionRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  suggestionBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF',
  },
  suggestionBtnActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  suggestionText: { fontSize: 12, color: '#64748B' },
  suggestionTextActive: { color: '#FFFFFF', fontWeight: '600' },
  btn: {
    backgroundColor: '#2563EB', borderRadius: 10,
    padding: 14, alignItems: 'center', marginBottom: 10,
  },
  btnDisabled: { backgroundColor: '#93C5FD' },
  btnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  btnCancel: {
    borderRadius: 10, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  btnCancelText: { color: '#64748B', fontSize: 15 },
});