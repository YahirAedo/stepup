// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React, { useCallback, useState } from 'react';
import { View, ScrollView, Text as RNText, Pressable, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBottomLayout } from '../../theme/layout';
import DesignLabHeader from '../../components/designlab/DesignLabHeader';
import DenseTaskRow from '../../components/designlab/tareas/DenseTaskRow';
import QuickCreateBar from '../../components/designlab/tareas/QuickCreateBar';
import { mci } from '../../components/designlab/mciIconMap';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  useResponsive,
} from '../../theme/serene';
import type { ProfileStackParamList } from '../../types/navigation';
import {
  flujoBListadoFixtures,
  type FlujoBEstadoTarea,
  type FlujoBSeccionListado,
} from './tareasFlujoBFixtures';

type TareasBListadoNav = NativeStackNavigationProp<ProfileStackParamList, 'TareasBListado'>;

/**
 * Preview "Tareas Variante B — Listado" (Ritmo): densidad + gestos.
 *
 * Secciones por estado en acordeón (En foco / Cola / Pausadas / Completadas)
 * con conteo; cada fila es un `DenseTaskRow` con swipe para completar/pausar.
 * El único CTA principal es la barra de creación rápida fija abajo.
 *
 * Todo es presentacional sobre fixtures. Ver `tareasFlujoBFixtures.ts` para
 * que existe en el modelo real y que requiere migración.
 */
export default function TareasBListadoScreen() {
  const { contentPaddingBottom } = useBottomLayout();
  const { scale: s } = useResponsive();
  const navigation = useNavigation<TareasBListadoNav>();
  const f = flujoBListadoFixtures;

  const [quickText, setQuickText] = useState('');
  const [openSections, setOpenSections] = useState<Record<FlujoBEstadoTarea, boolean>>({
    foco: true,
    cola: true,
    pausada: false,
    completada: false,
  });

  const toggleSection = useCallback((key: FlujoBEstadoTarea) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleQuickSubmit = useCallback(() => {
    console.log('[DesignLab] Quick create:', quickText);
    navigation.navigate('TareasBCrear');
  }, [navigation, quickText]);

  const renderSection = (section: FlujoBSeccionListado) => {
    const open = openSections[section.key];
    return (
      <View key={section.key} style={{ gap: sereneSpacing['space-sm'] }}>
        <Pressable
          onPress={() => toggleSection(section.key)}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel={`${section.title}, ${section.items.length} tareas`}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: sereneSpacing['space-sm'],
            minHeight: s(44),
            paddingHorizontal: s(4),
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(8), flexShrink: 1, flexWrap: 'wrap' }}>
            <RNText
              style={[
                sereneTypography['title-md'] as TextStyle,
                { color: sereneColors['on-surface'], flexShrink: 1 },
              ]}
            >
              {section.title}
            </RNText>
            <View
              style={{
                paddingHorizontal: s(8),
                paddingVertical: s(2),
                borderRadius: sereneBorderRadius.full,
                backgroundColor: sereneColors['surface-container-high'],
              }}
            >
              <RNText
                style={[
                  sereneTypography['label-sm'] as TextStyle,
                  { color: sereneColors['on-surface-variant'] },
                ]}
              >
                {String(section.items.length)}
              </RNText>
            </View>
          </View>

          <MaterialCommunityIcons
            name={open ? mci('expand_less') : mci('expand_more')}
            size={s(20)}
            color={sereneColors['on-surface-variant']}
          />
        </Pressable>

        {open && (
          <View style={{ gap: sereneSpacing['space-sm'] }}>
            {section.items.map((item) => (
              <DenseTaskRow
                key={item.id}
                title={item.title}
                stepCount={item.stepCount}
                totalMinutes={item.totalMinutes}
                progress={item.progress}
                onPress={() => {
                  console.log('[DesignLab] Open task:', item.id);
                  navigation.navigate('TareasBDetalle');
                }}
                onComplete={() => console.log('[DesignLab] Complete task:', item.id)}
                onPause={() => console.log('[DesignLab] Pause task:', item.id)}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <DesignLabHeader title={f.headerTitle} showAvatar={false} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.margin,
          paddingTop: sereneSpacing['space-sm'],
          paddingBottom: contentPaddingBottom,
          gap: sereneSpacing['space-lg'],
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {f.sections.map(renderSection)}
      </ScrollView>

      {/* Único CTA principal: creación rápida fija abajo (en el flujo, no absolute). */}
      <QuickCreateBar
        value={quickText}
        onChange={setQuickText}
        placeholder={f.quickCreate.placeholder}
        ctaLabel={f.quickCreate.ctaLabel}
        onSubmit={handleQuickSubmit}
      />
    </View>
  );
}
