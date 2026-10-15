import React, { type ComponentProps } from 'react';
import { View, Text as RNText, Pressable, ScrollView, type TextStyle } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBottomLayout } from '../../theme/layout';
import type { ProfileStackParamList } from '../../types/navigation';
import DesignLabHeader from '../../components/designlab/DesignLabHeader';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  withAlpha,
  useResponsive,
} from '../../theme/serene';

type Props = NativeStackScreenProps<ProfileStackParamList, 'DesignLab'>;

/** Destinos validos de la preview; evita castear a `keyof ProfileStackParamList`. */
type DesignLabTarget =
  | 'CronometroLimpio'
  | 'FocusPrevio'
  | 'FocusCompletado'
  | 'EnfoqueFocus'
  | 'FocusSinTareas'
  | 'TareasListado'
  | 'TareasDetalle';

interface MockupEntry {
  key: string;
  title: string;
  description: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
  target: DesignLabTarget;
}

const MOCKUPS: MockupEntry[] = [
  {
    key: 'cronometro-limpio',
    title: 'Cronómetro limpio (modo claro)',
    description: 'Focus Timer — anillo SVG, estados Pausa/Reanudar, +2 Minutos, toast',
    icon: 'timer',
    target: 'CronometroLimpio',
  },
  {
    key: 'focus-previo',
    title: 'Focus — Paso previo',
    description: 'Estado de preparación: step hero, selector 3/5/10 min, cola, transición al timer',
    icon: 'play-circle-outline',
    target: 'FocusPrevio',
  },
  {
    key: 'focus-completado',
    title: 'Focus — Paso completado',
    description: 'Cierre: celebración, logro registrado, siguiente paso, acciones y pausa consciente',
    icon: 'check-circle-outline',
    target: 'FocusCompletado',
  },
];

/**
 * Variantes de arte para la skin del "paso previo". Mismo contenido que
 * `FocusPrevio`, distinta presentación — sirven para elegir dirección visual.
 */
const VARIANTS: MockupEntry[] = [
  {
    key: 'variant-enfoque',
    title: 'Variante E — Enfoque',
    description: 'Título protagonista en panel inset + cola colapsada (acordeón). Propuesta armonizada',
    icon: 'gesture-tap',
    target: 'EnfoqueFocus',
  },
];

/**
 * Estados vacíos (zero states) de los flujos.
 */
const EMPTY_STATES: MockupEntry[] = [
  {
    key: 'focus-sin-tareas',
    title: 'Focus — Sin tareas',
    description: 'Estado vacío: sin tareas, guía de respiración y resumen del día',
    icon: 'meditation',
    target: 'FocusSinTareas',
  },
];

/**
 * Epico Tareas (rediseño Serene Focus). Se agregan aquí a medida que se portan
 * los 9 mockups de `Stepup Rediseño/stitch_stepup_anti_procrastination_app`.
 */
const TAREAS_MOCKUPS: MockupEntry[] = [
  {
    key: 'tareas-listado',
    title: 'Tareas — Listado',
    description: 'Encabezado + resumen, filtros, tarjeta en foco, quick-create, cola de espera, rescate anti-abrumamiento',
    icon: 'format-list-checks',
    target: 'TareasListado',
  },
  {
    key: 'tareas-detalle',
    title: 'Tareas — Detalle',
    description: 'Resumen de tarea, avance segmentado, secuencia de pasos, gestión, respiro consciente y acciones',
    icon: 'format-list-bulleted',
    target: 'TareasDetalle',
  },
];

function MockupCard({ entry, onPress }: { entry: MockupEntry; onPress: () => void }) {
  const { scale: s } = useResponsive();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${entry.title}`}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: sereneSpacing['space-md'],
        padding: sereneSpacing['space-md'],
        borderRadius: sereneBorderRadius.lg,
        backgroundColor: sereneColors['surface-container-low'],
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <View
        style={{
          width: s(40),
          height: s(40),
          borderRadius: s(12),
          backgroundColor: withAlpha(sereneColors['primary-fixed'], 0.4),
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialCommunityIcons name={entry.icon} size={s(20)} color={sereneColors.primary} />
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <RNText
          style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'] }]}
          numberOfLines={1}
        >
          {entry.title}
        </RNText>
        <RNText
          style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
          numberOfLines={2}
        >
          {entry.description}
        </RNText>
      </View>

      <MaterialCommunityIcons name="chevron-right" size={s(20)} color={sereneColors['on-surface-variant']} />
    </Pressable>
  );
}

/**
 * Índice del Design Lab. Por ahora solo hay 1 mockup; la idea es ir
 * agregando los 28 restantes aquí (sin romper lo ya implementado).
 */
export default function DesignLabScreen({ navigation }: Props) {
  const { contentPaddingBottom } = useBottomLayout();

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <DesignLabHeader title="Design Lab" />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.gutter,
          paddingTop: sereneSpacing['space-md'],
          paddingBottom: contentPaddingBottom,
          gap: sereneSpacing['space-md'],
        }}
      >
        <RNText
          style={[
            sereneTypography['label-sm'] as TextStyle,
            {
              color: sereneColors['on-surface-variant'],
              textTransform: 'uppercase',
              letterSpacing: 0.8,
            },
          ]}
        >
          Mockups implementados
        </RNText>

        {MOCKUPS.map((m) => (
          <MockupCard key={m.key} entry={m} onPress={() => navigation.navigate(m.target)} />
        ))}

        <RNText
          style={[
            sereneTypography['label-sm'] as TextStyle,
            {
              color: sereneColors['on-surface-variant'],
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginTop: sereneSpacing['space-md'],
            },
          ]}
        >
          Variante elegida — Focus (paso previo)
        </RNText>

        {VARIANTS.map((m) => (
          <MockupCard key={m.key} entry={m} onPress={() => navigation.navigate(m.target)} />
        ))}

        <RNText
          style={[
            sereneTypography['label-sm'] as TextStyle,
            {
              color: sereneColors['on-surface-variant'],
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginTop: sereneSpacing['space-md'],
            },
          ]}
        >
          Estados vacíos
        </RNText>

        {EMPTY_STATES.map((m) => (
          <MockupCard key={m.key} entry={m} onPress={() => navigation.navigate(m.target)} />
        ))}

        <RNText
          style={[
            sereneTypography['label-sm'] as TextStyle,
            {
              color: sereneColors['on-surface-variant'],
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginTop: sereneSpacing['space-md'],
            },
          ]}
        >
          Tareas
        </RNText>

        {TAREAS_MOCKUPS.map((m) => (
          <MockupCard key={m.key} entry={m} onPress={() => navigation.navigate(m.target)} />
        ))}

        <RNText
          style={[
            sereneTypography['body-sm'] as TextStyle,
            { color: sereneColors['on-surface-variant'], textAlign: 'center', marginTop: sereneSpacing['space-md'] },
          ]}
        >
          Estos prototipos usan una paleta paralela (Serene Focus) y NO tocan datos reales.
        </RNText>
      </ScrollView>
    </View>
  );
}
