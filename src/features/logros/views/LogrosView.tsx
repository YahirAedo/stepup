import React from 'react';
import { View, ScrollView, Text as RNText, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  useResponsive,
} from '../../../theme/serene';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import FilterPills from '../../../components/ui/FilterPills';
import type { LogroFiltroKey } from '../logic/logrosCopy';
import type { LogrosView as LogrosViewModel } from '../logic/buildLogrosView';
import { formatLogrosSummary } from '../logic/formatLogrosSummary';
import { logrosCopy } from '../logic/logrosCopy';

export interface LogrosViewProps {
  view: LogrosViewModel;
  filter: LogroFiltroKey;
  onFilterChange: (key: LogroFiltroKey) => void;
}

function LogroRow({ logro }: { logro: LogrosViewModel['items'][number] }) {
  const { scale: s } = useResponsive();
  const obtenido = logro.estado === 'obtenido';

  const accessibilityLabel = `${logro.title}, ${obtenido ? 'obtenido' : 'por lograr'}. ${logro.description}`;

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: sereneSpacing['space-md'],
        padding: sereneSpacing['space-md'],
        borderRadius: sereneBorderRadius.xl,
        backgroundColor: sereneColors['surface-container-lowest'],
        opacity: obtenido ? 1 : 0.72,
        ...sereneShadows.card,
      }}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={{
          width: s(44),
          height: s(44),
          borderRadius: s(22),
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: obtenido
            ? sereneColors['primary-fixed']
            : sereneColors['surface-container-high'],
        }}
      >
        <MaterialCommunityIcons
          name={logro.icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
          size={s(22)}
          color={obtenido ? sereneColors.primary : sereneColors['on-surface-variant']}
          importantForAccessibility="no"
          accessibilityElementsHidden
        />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <RNText style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'] }]}>
          {logro.title}
        </RNText>
        <RNText style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}>
          {logro.description}
        </RNText>
      </View>

      <MaterialCommunityIcons
        name={obtenido ? 'check-circle' : 'lock-outline'}
        size={s(obtenido ? 22 : 20)}
        color={obtenido ? sereneColors.primary : sereneColors.outline}
        importantForAccessibility="no"
        accessibilityElementsHidden
      />
    </View>
  );
}

export default function LogrosView({ view, filter, onFilterChange }: LogrosViewProps) {
  const { scale: s } = useResponsive();
  const progreso = view.total > 0 ? view.obtenidos / view.total : 0;

  const filterOptions = logrosCopy.filtros.map((f) => ({ key: f.key, label: f.label }));

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <ScreenHeader variant="detail" title={logrosCopy.headerTitle} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.margin,
          paddingBottom: sereneSpacing['space-lg'],
          gap: sereneSpacing['space-md'],
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: sereneSpacing['space-md'],
            padding: sereneSpacing['space-md'],
            borderRadius: sereneBorderRadius.xl,
            backgroundColor: sereneColors['surface-container-lowest'],
            ...sereneShadows.card,
          }}
        >
          <View
            style={{
              width: s(56),
              height: s(56),
              borderRadius: s(28),
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: sereneColors['secondary-fixed'],
            }}
          >
            <MaterialCommunityIcons name="trophy-outline" size={s(26)} color={sereneColors['on-secondary-fixed']} importantForAccessibility="no" accessibilityElementsHidden />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <RNText style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'], textTransform: 'uppercase' }]}>
              {logrosCopy.resumenLabel}
            </RNText>
            <RNText style={[sereneTypography['headline-md'] as TextStyle, { color: sereneColors.primary, marginTop: s(2) }]}>
              {formatLogrosSummary(view.obtenidos, view.total)}
            </RNText>
            <View style={{ height: s(6), marginTop: s(8), borderRadius: sereneBorderRadius.full, backgroundColor: sereneColors['surface-container-high'], overflow: 'hidden' }}>
              <View style={{ width: `${Math.round(progreso * 100)}%`, height: '100%', borderRadius: sereneBorderRadius.full, backgroundColor: sereneColors.primary }} />
            </View>
          </View>
        </View>

        <FilterPills
          options={filterOptions}
          activeKey={filter}
          onChange={onFilterChange}
          accessibilityLabel="Filtros de logros"
        />

        {view.isEmpty ? (
          <View style={{ alignItems: 'center', gap: sereneSpacing['space-sm'], paddingVertical: sereneSpacing['space-xl'] }}>
            <MaterialCommunityIcons name="trophy-outline" size={s(32)} color={sereneColors.outline} importantForAccessibility="no" accessibilityElementsHidden />
            <RNText style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'] }]}>
              {logrosCopy.vacioTitle}
            </RNText>
            <RNText style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface-variant'], textAlign: 'center' }]}>
              {logrosCopy.vacioBody}
            </RNText>
          </View>
        ) : (
          view.items.map((logro) => <LogroRow key={logro.id} logro={logro} />)
        )}

        <RNText style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface-variant'], textAlign: 'center', marginTop: sereneSpacing['space-sm'] }]}>
          {logrosCopy.nota}
        </RNText>
      </ScrollView>
    </View>
  );
}
