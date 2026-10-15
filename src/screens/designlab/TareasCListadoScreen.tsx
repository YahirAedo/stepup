// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React, { useCallback, useState } from 'react';
import { View, ScrollView, Text as RNText, Pressable, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBottomLayout } from '../../theme/layout';
import DesignLabHeader from '../../components/designlab/DesignLabHeader';
import FilterPills, { type FilterPillOption } from '../../components/designlab/FilterPills';
import TaskProgressRow from '../../components/designlab/tareas/TaskProgressRow';
import QuickCreateBar from '../../components/designlab/tareas/QuickCreateBar';
import { mci } from '../../components/designlab/mciIconMap';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  useResponsive,
} from '../../theme/serene';
import type { ProfileStackParamList } from '../../types/navigation';
import { flujoCListadoFixtures, type FlujoCFilterKey } from './tareasFlujoCFixtures';

type TareasCListadoNav = NativeStackNavigationProp<ProfileStackParamList, 'TareasCListado'>;

/**
 * Variante C "Sendero" — Tareas / Listado.
 *
 * Resumen del día en una línea, filtros, el "sendero principal" como fila de
 * progreso (`TaskProgressRow`), la entrada a plantillas y otras tareas en la
 * misma fila compacta. El único CTA principal es la barra de creación rápida
 * fija abajo (en el flujo del layout, nunca `position: 'absolute'`).
 */
export default function TareasCListadoScreen() {
  const { contentPaddingBottom } = useBottomLayout();
  const { scale: s } = useResponsive();
  const navigation = useNavigation<TareasCListadoNav>();
  const [activeFilter, setActiveFilter] = useState<FlujoCFilterKey>('activas');
  const [quickText, setQuickText] = useState('');

  const f = flujoCListadoFixtures;

  const filterOptions: FilterPillOption<FlujoCFilterKey>[] = f.filters.map((filter) => ({
    key: filter.key,
    label: filter.label,
    count: filter.count,
  }));

  const handleFilterChange = useCallback((key: FlujoCFilterKey) => {
    setActiveFilter(key);
  }, []);

  const handleQuickSubmit = useCallback(() => {
    console.log('[DesignLab] Quick create:', quickText);
    navigation.navigate('TareasCCrear');
  }, [navigation, quickText]);

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
        {/* Encabezado + resumen del día (una línea) + filtros */}
        <View style={{ gap: sereneSpacing['space-sm'], paddingTop: sereneSpacing['space-xs'] }}>
          <RNText
            style={[sereneTypography['headline-lg-mobile'] as TextStyle, { color: sereneColors['on-surface'] }]}
          >
            {f.pageTitle}
          </RNText>

          {/* REQUIERE MIGRACIÓN: "en foco" sale de una sesión de foco activa; no existe en Task. */}
          <RNText
            style={[
              sereneTypography['body-sm'] as TextStyle,
              { color: sereneColors['on-surface-variant'], flexShrink: 1 },
            ]}
          >
            {`Hoy: ${f.summary.todayCompleted} pasos completados · ${f.summary.focusActive} en foco · ${f.summary.queueCount} en cola`}
          </RNText>

          <FilterPills options={filterOptions} activeKey={activeFilter} onChange={handleFilterChange} />
        </View>

        {/* Sendero principal: fila de progreso (única superficie primaria) */}
        <View style={{ gap: sereneSpacing['space-sm'] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(8) }}>
            <MaterialCommunityIcons name={mci('timelapse')} size={s(18)} color={sereneColors.primary} />
            <RNText
              style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors.primary, flexShrink: 1 }]}
            >
              {f.sendero.badge}
            </RNText>
          </View>

          <TaskProgressRow
            title={f.sendero.title}
            steps={f.sendero.steps}
            onPress={() => navigation.navigate('TareasCDetalle')}
          />

          <RNText
            style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
          >
            {f.sendero.description}
          </RNText>
        </View>

        {/* Entrada a plantillas */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={f.templatesEntry.title}
          // REQUIERE MIGRACIÓN: no hay entidad "plantilla" en el modelo; abre el formulario con el TemplatePicker.
          onPress={() => {
            console.log('[DesignLab] Open templates');
            navigation.navigate('TareasCCrear');
          }}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: sereneSpacing['space-md'],
            minHeight: s(44),
            padding: sereneSpacing['space-md'],
            borderRadius: sereneBorderRadius.xl,
            backgroundColor: sereneColors['surface-container-low'],
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <View
            style={{
              width: s(36),
              height: s(36),
              borderRadius: sereneBorderRadius.lg,
              backgroundColor: sereneColors['surface-container-high'],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name={mci('content_copy')} size={s(18)} color={sereneColors.primary} />
          </View>
          <View style={{ minWidth: 0, flex: 1 }}>
            <RNText
              numberOfLines={1}
              style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'] }]}
            >
              {f.templatesEntry.title}
            </RNText>
            <RNText
              style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
            >
              {f.templatesEntry.subtitle}
            </RNText>
          </View>
          <MaterialCommunityIcons
            name={mci('arrow_forward_ios')}
            size={s(16)}
            color={sereneColors['on-surface-variant']}
          />
        </Pressable>

        {/* Otras tareas */}
        <View style={{ gap: sereneSpacing['space-sm'] }}>
          <RNText style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'] }]}>
            {f.queue.title}
          </RNText>

          <View style={{ gap: sereneSpacing['space-sm'] }}>
            {f.queue.items.map((item) => (
              <View key={item.id} style={{ ...sereneShadows.card, borderRadius: sereneBorderRadius.xl }}>
                <TaskProgressRow
                  title={item.title}
                  steps={item.steps}
                  onPress={() => navigation.navigate('TareasCDetalle')}
                />
              </View>
            ))}
          </View>
        </View>
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
