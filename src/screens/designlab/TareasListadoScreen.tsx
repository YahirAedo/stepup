// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React, { useCallback, useState } from 'react';
import { View, ScrollView, Text as RNText, Pressable, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBottomLayout } from '../../theme/layout';
import DesignLabHeader from '../../components/designlab/DesignLabHeader';
import FilterPills, { type FilterPillOption } from '../../components/designlab/FilterPills';
import FeaturedTaskCard from '../../components/designlab/FeaturedTaskCard';
import QueueTaskRow from '../../components/designlab/QueueTaskRow';
import AntiOverwhelmCard from '../../components/designlab/AntiOverwhelmCard';
import ImageBanner from '../../components/designlab/ImageBanner';
import { mci } from '../../components/designlab/mciIconMap';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  withAlpha,
  useResponsive,
} from '../../theme/serene';
import { listadoFixtures, type FilterKey } from './tareasFixtures';

/**
 * Preview "Tareas — Listado".
 *
 * Mockup fuente: `Tareas - Listado/code.html`. Reproduce los bloques B–H
 * (el header del shell y la tab bar del mockup NO se reproducen: el lab usa
 * `DesignLabHeader` y `GlassTabBar` es el shell real de la app).
 *
 * Todo es presentacional sobre fixtures. Ver `tareasFixtures.ts` para el
 * detalle de que campos existen en el modelo real y cuales son ⚠️ DESIGN.
 */
export default function TareasListadoScreen() {
  const { contentPaddingBottom } = useBottomLayout();
  const { scale: s } = useResponsive();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('activas');

  const filterOptions: FilterPillOption<FilterKey>[] = listadoFixtures.filters.map((f) => ({
    key: f.key,
    label: f.label,
    count: f.count,
  }));

  const handleFilterChange = useCallback((key: FilterKey) => {
    setActiveFilter(key);
  }, []);

  const f = listadoFixtures;

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <DesignLabHeader title={f.headerTitle} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.margin,
          paddingBottom: contentPaddingBottom,
          gap: sereneSpacing['space-lg'],
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado de seccion + resumen del dia */}
        <View style={{ gap: sereneSpacing['space-sm'], paddingTop: sereneSpacing['space-sm'] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <RNText
              style={[sereneTypography['headline-lg-mobile'] as TextStyle, { color: sereneColors['on-surface'] }]}
            >
              Tareas &amp; Pasos
            </RNText>
            <View
              style={{
                width: s(32),
                height: s(32),
                borderRadius: sereneBorderRadius.full,
                backgroundColor: withAlpha(sereneColors['secondary-container'], 0.5),
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name={mci('checklist')} size={s(18)} color={sereneColors['primary-container']} />
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: sereneSpacing['space-sm'],
              padding: s(10),
              borderRadius: sereneBorderRadius.xl,
              backgroundColor: sereneColors['surface-container-low'],
            }}
          >
            <MaterialCommunityIcons
              name={mci('calendar_today')}
              size={s(16)}
              color={sereneColors['primary-container']}
            />
            <RNText
              style={[
                sereneTypography['body-sm'] as TextStyle,
                { color: sereneColors['on-surface-variant'], flex: 1 },
              ]}
            >
              <RNText style={{ fontWeight: '600', color: sereneColors['on-surface'] }}>Hoy: </RNText>
              {`${f.summary.todayCompleted} pasos completados · ${f.summary.focusActive} en foco activo · ${f.summary.queueCount} en cola`}
            </RNText>
          </View>

          <FilterPills options={filterOptions} activeKey={activeFilter} onChange={handleFilterChange} />
        </View>

        {/* Tarjeta destacada en foco */}
        <FeaturedTaskCard
          badge={f.featured.badge}
          minutesLabel={f.featured.minutesLabel}
          title={f.featured.title}
          stepLabel={f.featured.stepLabel}
          stepTitle={f.featured.stepTitle}
          sessionLabel={f.featured.sessionLabel}
          sessionPercent={f.featured.sessionPercent}
          primaryCta={f.featured.primaryCta}
          toggleOpen={f.featured.toggleOpen}
          toggleClose={f.featured.toggleClose}
          steps={f.featured.steps}
          onResume={() => console.log('[DesignLab] Resume focus')}
        />

        {/* Quick-create */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={f.quickCreate.title}
          onPress={() => console.log('[DesignLab] Quick create')}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: sereneSpacing['space-md'],
            padding: s(14),
            borderRadius: sereneBorderRadius.xl,
            backgroundColor: sereneColors['surface-container'],
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: sereneSpacing['space-md'], flex: 1, minWidth: 0 }}>
            <View
              style={{
                width: s(36),
                height: s(36),
                borderRadius: sereneBorderRadius.lg,
                backgroundColor: sereneColors['surface-container-lowest'],
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name={mci('add')} size={s(20)} color={sereneColors['primary-container']} />
            </View>
            <View style={{ minWidth: 0, flex: 1 }}>
              <RNText
                numberOfLines={1}
                style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'] }]}
              >
                {f.quickCreate.title}
              </RNText>
              <RNText
                style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
              >
                {f.quickCreate.subtitle}
              </RNText>
            </View>
          </View>
          <View
            style={{
              paddingHorizontal: s(8),
              paddingVertical: s(4),
              borderRadius: sereneBorderRadius.full,
              backgroundColor: withAlpha(sereneColors['secondary-container'], 0.8),
            }}
          >
            <RNText
              style={[
                sereneTypography['label-sm'] as TextStyle,
                { color: sereneColors['primary-container'], fontWeight: '600' },
              ]}
            >
              {f.quickCreate.badge}
            </RNText>
          </View>
        </Pressable>

        {/* Cola de espera */}
        <View style={{ gap: sereneSpacing['space-sm'] }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <RNText style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'] }]}>
              {f.queue.title}{' '}
              <RNText
                style={[
                  sereneTypography['body-sm'] as TextStyle,
                  { color: sereneColors['on-surface-variant'], fontWeight: '400' },
                ]}
              >
                {f.queue.subtitle}
              </RNText>
            </RNText>
            <RNText
              style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
            >
              {f.queue.maxVisible}
            </RNText>
          </View>

          <View style={{ gap: sereneSpacing['space-sm'] + 2 }}>
            {f.queue.items.map((item) => (
              <QueueTaskRow
                key={item.id}
                item={item}
                onToggleComplete={() => console.log('[DesignLab] Complete queued task:', item.id)}
                onPress={() => console.log('[DesignLab] Open queued task:', item.id)}
              />
            ))}
          </View>
        </View>

        {/* Card anti-abrumamiento */}
        <AntiOverwhelmCard
          title={f.antiOverwhelm.title}
          body={f.antiOverwhelm.body}
          cta={f.antiOverwhelm.cta}
          onActivate={() => console.log('[DesignLab] Activate tunnel mode')}
        />

        {/* Imagen serena */}
        <ImageBanner imageUrl={f.banner.imageUrl} caption={f.banner.caption} />
      </ScrollView>
    </View>
  );
}