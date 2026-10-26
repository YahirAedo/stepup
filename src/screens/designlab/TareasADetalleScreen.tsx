// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React, { useState } from 'react';
import { View, ScrollView, Text as RNText, Pressable, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBottomLayout } from '../../theme/layout';
import DesignLabHeader from '../../components/designlab/DesignLabHeader';
import StepProgressPanel, { type StepSegmentStatus } from '../../components/designlab/StepProgressPanel';
import StepRow from '../../components/designlab/StepRow';
import { mci } from '../../components/designlab/mciIconMap';
import DueDateField from '../../components/designlab/DueDateField';

import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  withAlpha,
  useResponsive,
} from '../../theme/serene';
import {
  clampStepPosition,
} from '../../utils/microplan';
import type { ProfileStackParamList } from '../../types/navigation';
import { flujoADetalleFixtures, type FlujoAPasoDetalle } from './tareasFlujoAFixtures';
import ConfirmDialog from '../../components/designlab/ConfirmDialog';

interface PasoConId extends FlujoAPasoDetalle {
  id: string;
}

/**
 * Variante A "Enfoque" — Tareas / Detalle.
 *
 * Secuencia lineal con el paso actual resaltado: card resumen + panel de avance
 * segmentado, secuencia de pasos (sin edición inline), y tres CTA apilados al
 * pie (Comenzar/Continuar, Editar tarea, Borrar tarea).
 */
export default function TareasADetalleScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList, 'TareasADetalle'>>();
  const { insets } = useBottomLayout();
  const { scale: s } = useResponsive();
  const f = flujoADetalleFixtures;

  const [steps] = useState<PasoConId[]>(f.steps.map((step, index) => ({ ...step, id: `step-${index}` })));
  const [deleteOpen, setDeleteOpen] = useState(false);

  const total = steps.length;
  const doneCount = steps.filter((step) => step.variant === 'completed').length;
  const currentIndex = clampStepPosition(doneCount + 1, total);

  const statuses: StepSegmentStatus[] = steps.map((step) =>
    step.variant === 'completed' ? 'done' : step.variant === 'active' ? 'current' : 'pending'
  );

  const primaryCta = doneCount > 0 ? 'Continuar' : 'Comenzar';

  const whisperColor = withAlpha(sereneColors['on-surface-variant'], 0.6);

  const handleEdit = () => {
    navigation.navigate('TareasAEditar');
  };

  const handleDelete = () => {
    setDeleteOpen(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <DesignLabHeader title={f.headerTitle} showAvatar={false} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.margin,
          paddingTop: sereneSpacing['space-md'],
          paddingBottom: insets.bottom + sereneSpacing['space-lg'],
          gap: sereneSpacing['space-lg'],
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Card resumen */}
        <View
          style={{
            backgroundColor: sereneColors['surface-container-lowest'],
            borderRadius: sereneBorderRadius.xl,
            padding: sereneSpacing['space-md'],
            gap: sereneSpacing['space-md'],
            ...sereneShadows.card,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: s(6),
              alignSelf: 'flex-start',
              paddingHorizontal: s(10),
              paddingVertical: s(4),
              borderRadius: sereneBorderRadius.full,
              backgroundColor: sereneColors['secondary-container'],
            }}
          >
            <View
              style={{
                width: s(6),
                height: s(6),
                borderRadius: sereneBorderRadius.full,
                backgroundColor: sereneColors.primary,
              }}
            />
            <RNText
              style={[
                sereneTypography['label-sm'] as TextStyle,
                { color: sereneColors['on-secondary-fixed-variant'], fontWeight: '600' },
              ]}
            >
              {`${f.summary.statusBadge.prefix} ${currentIndex} ${f.summary.statusBadge.of} ${total}`}
            </RNText>
          </View>

          <View style={{ gap: sereneSpacing['space-xs'] }}>
            <RNText
              style={[sereneTypography['headline-lg-mobile'] as TextStyle, { color: sereneColors['on-surface'] }]}
            >
              {f.summary.title}
            </RNText>
            <RNText
              style={[
                sereneTypography['body-md'] as TextStyle,
                { color: sereneColors['on-surface-variant'], lineHeight: s(24) },
              ]}
            >
              {f.summary.description}
            </RNText>
          </View>

          {/* Vencimiento (dato neutro y opcional) */}
          <DueDateField
            value={f.summary.dueDate}
            onChange={() => {}}
            label={f.summary.dueLabel}
            noneLabel={f.summary.dueNone}
            clearLabel={f.summary.dueClear}
            a11yLabel={f.summary.dueA11y}
          />

          <StepProgressPanel
            percentLabel={`${Math.round((doneCount / total) * 100)}% completado`}
            remainingLabel={`~${steps
              .filter((step) => step.variant !== 'completed')
              .reduce((acc, step) => acc + step.durationMin, 0)} min restantes`}
            doneLabel={`${doneCount} de ${total} pasos listos`}
            statuses={statuses}
          />
        </View>

        {/* Secuencia de pasos */}
        <View style={{ gap: sereneSpacing['space-sm'] }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: sereneSpacing['space-sm'],
              paddingHorizontal: s(2),
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(6), flexShrink: 1 }}>
              <MaterialCommunityIcons name={mci('alt_route')} size={s(20)} color={sereneColors.primary} />
              <RNText
                style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'], flexShrink: 1 }]}
              >
                {f.stepsTitle}
              </RNText>
            </View>
          </View>

          {steps.map((step) => (
            <StepRow
              key={step.id}
              name={step.name}
              durationMin={step.durationMin}
              completed={step.variant === 'completed'}
              pendingDelete={false}
              onPress={undefined}
            />
          ))}
        </View>

        {/* Tres botones apilados al pie */}
        <View style={{ gap: sereneSpacing['space-sm'] }}>
          <Pressable
            onPress={() => navigation.navigate('EnfoqueFocus')}
            accessibilityRole="button"
            accessibilityLabel={primaryCta}
            style={({ pressed }) => ({
              width: '100%',
              minHeight: s(48),
              borderRadius: sereneBorderRadius.lg,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: s(8),
              paddingVertical: sereneSpacing['space-sm'],
              backgroundColor: sereneColors.primary,
              ...sereneShadows.card,
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <MaterialCommunityIcons name={mci('play_circle')} size={s(20)} color={sereneColors['on-primary']} />
            <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}>
              {primaryCta}
            </RNText>
          </Pressable>

          <Pressable
            onPress={handleEdit}
            accessibilityRole="button"
            accessibilityLabel="Editar tarea"
            style={({ pressed }) => ({
              width: '100%',
              minHeight: s(48),
              borderRadius: sereneBorderRadius.lg,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: s(8),
              paddingVertical: sereneSpacing['space-sm'],
              backgroundColor: sereneColors['surface-container-high'],
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <MaterialCommunityIcons name={mci('edit')} size={s(20)} color={sereneColors['on-surface']} />
            <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-surface'] }]}>
              Editar tarea
            </RNText>
          </Pressable>

          <Pressable
            onPress={handleDelete}
            accessibilityRole="button"
            accessibilityLabel="Borrar tarea"
            style={({ pressed }) => ({
              width: '100%',
              minHeight: s(48),
              borderRadius: sereneBorderRadius.lg,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: s(8),
              paddingVertical: sereneSpacing['space-sm'],
              backgroundColor: sereneColors.error,
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <MaterialCommunityIcons name={mci('delete')} size={s(20)} color={sereneColors['on-error']} />
            <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-error'] }]}>
              Borrar tarea
            </RNText>
          </Pressable>
        </View>

        {/* Pie de página - diseño igual que FocusFixture */}
        <View
          style={{
            alignItems: 'center',
            paddingTop: sereneSpacing['space-xs'],
            paddingBottom: sereneSpacing['space-xs'],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(4) }}>
            <MaterialCommunityIcons name="spa" size={s(14)} color={whisperColor} />
            <RNText style={[sereneTypography['label-sm'] as TextStyle, { color: whisperColor }]}>
              {f.footerNote}
            </RNText>
          </View>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={deleteOpen}
        title={f.deleteDialog.title}
        body={f.deleteDialog.body}
        confirmLabel={f.deleteDialog.confirm}
        cancelLabel={f.deleteDialog.cancel}
        onConfirm={() => {
          setDeleteOpen(false);
          navigation.navigate('TareasAListado');
        }}
        onClose={() => setDeleteOpen(false)}
      />
    </View>
  );
}
