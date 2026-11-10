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
  | 'FocusCompletado'
  | 'EnfoqueFocus'
  | 'FocusSinTareas'
  | 'TareasAListado'
  | 'TareasACrear'
  | 'TareasADetalle'
  | 'TareasAEditar'
  | 'TareasACompletada'
  | 'TareasEditarPasoSheet'
  | 'PerfilA'
  | 'SereneTabs'
  | 'LogrosA'
  | 'ConflictosA'
  | 'Onboarding1A'
  | 'Onboarding2A'
  | 'LoginA'
  | 'RegistroA';

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
    key: 'focus-completado',
    title: 'Focus — Paso completado',
    description: 'Cierre: logro registrado, siguiente paso y acciones de salida',
    icon: 'check-circle-outline',
    target: 'FocusCompletado',
  },
];

/**
 * Skin elegida del "paso previo" de Focus: título protagonista en panel inset
 * y cola colapsada en acordeón.
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
 * Base compartida del rediseño (Fase 1): piezas comunes a Foco, Tareas y Perfil.
 */
const SISTEMA_BASE: MockupEntry[] = [
  {
    key: 'serene-tabs',
    title: 'Marco con tabs — Foco / Tareas / Perfil',
    description: 'Barra de 3 tabs dentro del layout: comprobá que no tape el botón de abajo',
    icon: 'dock-bottom',
    target: 'SereneTabs',
  },
];

/**
 * Estados vacíos (zero states) de los flujos.
 */
const EMPTY_STATES: MockupEntry[] = [
  {
    key: 'focus-sin-tareas',
    title: 'Focus — Sin tareas',
    description: 'Estado vacío: sin tareas activas y resumen del día',
    icon: 'meditation',
    target: 'FocusSinTareas',
  },
];

/**
 * Onboarding rediseñado: entrada de la app en dos pasos (problema y solución).
 */
const ONBOARDING_A: MockupEntry[] = [
  {
    key: 'onboarding-1-a',
    title: 'Onboarding 1 — El problema',
    description: 'Una tarea grande frente a sus pasos, y por qué cuesta arrancar',
    icon: 'clock-outline',
    target: 'Onboarding1A',
  },
  {
    key: 'onboarding-2-a',
    title: 'Onboarding 2 — La solución',
    description: 'Tres ventajas del flujo por pasos y el aviso de datos en el teléfono',
    icon: 'format-list-checks',
    target: 'Onboarding2A',
  },
];

/**
 * Flujo elegido de Tareas (rediseño Serene Focus): las 4 pantallas del flujo
 * (Listado → Crear → Detalle → Editar) más el aviso de tarea completada, sobre
 * fixtures. Variante A "Enfoque".
 */
const TAREAS_FLUJO_A: MockupEntry[] = [
  {
    key: 'tareas-a-listado',
    title: 'A — Listado',
    description: 'Enfoque: una superficie primaria, tarjeta en foco y lista en espera atenuada',
    icon: 'format-list-checks',
    target: 'TareasAListado',
  },
  {
    key: 'tareas-a-crear',
    title: 'A — Crear',
    description: 'Alta con IA primero: banner de arranque, título con contador y pasos sugeridos',
    icon: 'playlist-plus',
    target: 'TareasACrear',
  },
  {
    key: 'tareas-a-detalle',
    title: 'A — Detalle',
    description: 'Secuencia de pasos con paso activo y gestión de la tarea',
    icon: 'format-list-bulleted',
    target: 'TareasADetalle',
  },
  {
    key: 'tareas-a-editar',
    title: 'A — Editar',
    description: 'Formulario precargado con guardar y entrar en foco',
    icon: 'pencil-outline',
    target: 'TareasAEditar',
  },
  {
    key: 'tareas-a-completada',
    title: 'A — Tarea completada',
    description: 'Aviso de cierre: hero botánico, resumen del logro y volver al listado',
    icon: 'check-circle-outline',
    target: 'TareasACompletada',
  },
];

/**
 * Piezas compartidas por las tres variantes del flujo Tareas.
 */
const TAREAS_COMPARTIDO: MockupEntry[] = [
  {
    key: 'tareas-editar-paso-sheet',
    title: 'Editar paso (bottom sheet)',
    description: 'Propuesta única compartida: duración con chips y nota opcional',
    icon: 'swap-vertical',
    target: 'TareasEditarPasoSheet',
  },
];

/**
 * Variante elegida de Perfil (rediseño Serene Focus): tarjetas apiladas con
 * identidad, métricas, logros, datos y sincronización, recordatorios y cuenta.
 */
const PERFIL_VARIANTE_A: MockupEntry[] = [
  {
    key: 'perfil-a',
    title: 'A — Tarjetas por sección',
    description: 'Tarjetas apiladas: identidad + métricas, logros, datos y sincronización, recordatorios y cuenta',
    icon: 'card-outline',
    target: 'PerfilA',
  },
];

/**
 * Pantallas del flujo Perfil Variante A (rediseño Serene Focus). Son los destinos
 * de las filas de logros y conflictos de la Variante A.
 */
const PERFIL_PANTALLAS: MockupEntry[] = [
  {
    key: 'perfil-logros',
    title: 'A — Tus logros',
    description: 'Lista de logros con resumen y filtros Todos / Obtenidos / Por lograr',
    icon: 'trophy-outline',
    target: 'LogrosA',
  },
  {
    key: 'perfil-conflictos',
    title: 'A — Conflictos de sincronización',
    description: 'Un conflicto por item: versiones lado a lado y una acción por lado',
    icon: 'swap-horizontal',
    target: 'ConflictosA',
  },
];

/**
 * Acceso (Login y Registro) — rediseño Serene Focus.
 */
const AUTH_A: MockupEntry[] = [
  {
    key: 'login-a',
    title: 'Login A — Iniciar sesión',
    description: '6 estados: normal, error, cargando, sin conexión, cambio de cuenta (con/sin cambios)',
    icon: 'login',
    target: 'LoginA',
  },
  {
    key: 'registro-a',
    title: 'Registro A — Crear cuenta',
    description: '4 estados: normal, error (password corta), cargando, sin conexión',
    icon: 'account-plus-outline',
    target: 'RegistroA',
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

  // `navigate` tipa cada ruta como una sobrecarga distinta y no acepta un
  // argumento de tipo union (`DesignLabTarget`), asi que el cast vive aca una
  // sola vez en lugar de repetirse en cada card.
  const open = (target: DesignLabTarget) => navigation.navigate(target as never);

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
          <MockupCard key={m.key} entry={m} onPress={() => open(m.target)} />
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
          Base compartida
        </RNText>

        {SISTEMA_BASE.map((m) => (
          <MockupCard key={m.key} entry={m} onPress={() => open(m.target)} />
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
          <MockupCard key={m.key} entry={m} onPress={() => open(m.target)} />
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
          <MockupCard key={m.key} entry={m} onPress={() => open(m.target)} />
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
          Onboarding — Paso 1 y 2
        </RNText>

        {ONBOARDING_A.map((m) => (
          <MockupCard key={m.key} entry={m} onPress={() => open(m.target)} />
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
          Tareas — Variante A · Enfoque
        </RNText>

        {TAREAS_FLUJO_A.map((m) => (
          <MockupCard key={m.key} entry={m} onPress={() => open(m.target)} />
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
          Tareas — Compartido
        </RNText>

        {TAREAS_COMPARTIDO.map((m) => (
          <MockupCard key={m.key} entry={m} onPress={() => open(m.target)} />
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
          Perfil — Variante A · Tarjetas
        </RNText>

        {PERFIL_VARIANTE_A.map((m) => (
          <MockupCard key={m.key} entry={m} onPress={() => open(m.target)} />
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
          Perfil — Pantallas
        </RNText>

        {PERFIL_PANTALLAS.map((m) => (
          <MockupCard key={m.key} entry={m} onPress={() => open(m.target)} />
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
          Acceso — Login y Registro
        </RNText>

        {AUTH_A.map((m) => (
          <MockupCard key={m.key} entry={m} onPress={() => open(m.target)} />
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
