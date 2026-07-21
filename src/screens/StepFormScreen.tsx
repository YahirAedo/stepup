import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { StepService } from '../services/StepService';
import { Step } from '../types';
import { colors, typography, spacing, borderRadius } from '../theme';
import TextField from '../components/TextField';
import Button from '../components/Button';

type Props = {
  navigation: any;
  route: any;
};

const DURATION_PILLS = [5, 10, 15, 20, 30];

export default function StepFormScreen({ navigation, route }: Props) {
  const { taskId, stepId } = route.params;
  const isEditing = !!stepId;

  const [name, setName] = useState('');
  const [duration, setDuration] = useState<string>('');
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
    } catch {
      Alert.alert('Error', 'No se pudo guardar el paso. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: spacing['container-padding'],
          paddingTop: spacing['container-padding'],
          paddingBottom: 120,
          gap: spacing['section-gap'],
        }}
      >
        {/* Task name input */}
        <TextField
          label="Descripción del paso"
          placeholder="Ej. Leer las primeras 10 páginas"
          value={name}
          onChangeText={setName}
          autoFocus
          maxLength={200}
          hint="Tiene que ser algo que puedas hacer ahora."
        />

        {/* Duration pills */}
        <View style={{ gap: spacing['stack-gap'] }}>
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
            Duración estimada
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.unit * 2, flexWrap: 'wrap' }}>
            {DURATION_PILLS.map((d) => {
              const active = duration === String(d);
              return (
                <TouchableOpacity
                  key={d}
                  onPress={() => setDuration(active ? '' : String(d))}
                  activeOpacity={0.7}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: borderRadius.full,
                    backgroundColor: active ? colors.secondary : colors['surface-container-low'],
                    borderWidth: 1,
                    borderColor: active ? colors.secondary : colors['outline-variant'],
                  }}
                >
                  <Text
                    style={[
                      typography['label-md'],
                      { color: active ? '#FFFFFF' : colors['on-surface-variant'] },
                    ]}
                  >
                    {d} min
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={[typography['body-md'], { color: colors['on-surface-variant'] }]}>
            Opcional. Se usa para el timer.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: spacing['container-padding'],
          paddingVertical: 16,
          paddingBottom: 32,
          backgroundColor: colors.surface,
          flexDirection: 'row',
          gap: spacing['stack-gap'],
        }}
      >
        <Button
          title="Cancelar"
          onPress={() => navigation.goBack()}
          variant="secondary"
          style={{ flex: 1 }}
        />
        <Button
          title={saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Guardar Tarea'}
          onPress={handleSave}
          variant="primary"
          disabled={saving}
          style={{ flex: 2 }}
        />
      </View>
    </View>
  );
}
