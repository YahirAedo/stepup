// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React, { useMemo, useState } from 'react';
import { View, ScrollView, Pressable, Text as RNText, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBottomLayout } from '../../theme/layout';
import DesignLabHeader from '../../components/designlab/DesignLabHeader';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  useResponsive,
} from '../../theme/serene';
import {
  logrosCopy,
  logrosFixtures,
  logrosResumen,
  type LogroFiltroKey,
  type LogroItem,
} from './logrosAFixtures';

/**
 * Flujo Perfil Variante A — Tus logros.
 *
 * Lista serena de 8 logros (5 obtenidos, 3 por lograr) con un resumen arriba y
 * filtros Todos / Obtenidos / Por lograr. Los datos son de demo (fixtures).
 */
function LogroRow({ logro }: { logro: LogroItem }) {
  const { scale: s } = useResponsive();
  const obtenido = logro.estado === 'obtenido';

  return (
    <View
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
          name={logro.icon}
          size={s(22)}
          color={obtenido ? sereneColors.primary : sereneColors['on-surface-variant']}
        />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <RNText
          style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'] }]}
        >
          {logro.title}
        </RNText>
        <RNText
          style={[
            sereneTypography['body-sm'] as TextStyle,
            { color: sereneColors['on-surface-variant'] },
          ]}
        >
          {logro.description}
        </RNText>
      </View>

      <MaterialCommunityIcons
        name={obtenido ? 'check-circle' : 'lock-outline'}
        size={s(obtenido ? 22 : 20)}
        color={obtenido ? sereneColors.primary : sereneColors.outline}
      />
    </View>
  );
}

export default function LogrosAScreen() {
  const { insets } = useBottomLayout();
  const { scale: s } = useResponsive();
  const [filtro, setFiltro] = useState<LogroFiltroKey>('todos');

  const visibles = useMemo(() => {
    if (filtro === 'todos') return logrosFixtures;
    const buscado = filtro === 'obtenidos' ? 'obtenido' : 'por-lograr';
    return logrosFixtures.filter((logro) => logro.estado === buscado);
  }, [filtro]);

  const progreso = logrosResumen.total > 0 ? logrosResumen.obtenidos / logrosResumen.total : 0;

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <DesignLabHeader title={logrosCopy.headerTitle} showAvatar={false} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.margin,
          paddingTop: sereneSpacing['space-md'],
          paddingBottom: insets.bottom + sereneSpacing['space-lg'],
          gap: sereneSpacing['space-md'],
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Resumen */}
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
            <MaterialCommunityIcons
              name="trophy-outline"
              size={s(26)}
              color={sereneColors['on-secondary-fixed']}
            />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <RNText
              style={[
                sereneTypography['label-sm'] as TextStyle,
                { color: sereneColors['on-surface-variant'], textTransform: 'uppercase' },
              ]}
            >
              {logrosCopy.resumenLabel}
            </RNText>
            <RNText
              style={[
                sereneTypography['headline-md'] as TextStyle,
                { color: sereneColors.primary, marginTop: s(2) },
              ]}
            >
              {`${logrosResumen.obtenidos} de ${logrosResumen.total}`}
            </RNText>
            <View
              style={{
                height: s(6),
                marginTop: s(8),
                borderRadius: sereneBorderRadius.full,
                backgroundColor: sereneColors['surface-container-high'],
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: `${Math.round(progreso * 100)}%`,
                  height: '100%',
                  borderRadius: sereneBorderRadius.full,
                  backgroundColor: sereneColors.primary,
                }}
              />
            </View>
          </View>
        </View>

        {/* Filtros */}
        <View style={{ flexDirection: 'row', gap: sereneSpacing['space-sm'] }}>
          {logrosCopy.filtros.map((f) => {
            const activo = filtro === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFiltro(f.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: activo }}
                accessibilityLabel={f.label}
                style={({ pressed }) => ({
                  flex: 1,
                  minHeight: s(40),
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: sereneBorderRadius.full,
                  backgroundColor: activo
                    ? sereneColors.primary
                    : sereneColors['surface-container-high'],
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <RNText
                  style={[
                    sereneTypography['label-md'] as TextStyle,
                    {
                      color: activo
                        ? sereneColors['on-primary']
                        : sereneColors['on-surface-variant'],
                    },
                  ]}
                >
                  {f.label}
                </RNText>
              </Pressable>
            );
          })}
        </View>

        {/* Lista */}
        {visibles.length === 0 ? (
          <View
            style={{
              alignItems: 'center',
              gap: sereneSpacing['space-sm'],
              paddingVertical: sereneSpacing['space-xl'],
            }}
          >
            <MaterialCommunityIcons name="trophy-outline" size={s(32)} color={sereneColors.outline} />
            <RNText
              style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'] }]}
            >
              {logrosCopy.vacioTitle}
            </RNText>
            <RNText
              style={[
                sereneTypography['body-sm'] as TextStyle,
                { color: sereneColors['on-surface-variant'], textAlign: 'center' },
              ]}
            >
              {logrosCopy.vacioBody}
            </RNText>
          </View>
        ) : (
          visibles.map((logro) => <LogroRow key={logro.id} logro={logro} />)
        )}

        <RNText
          style={[
            sereneTypography['body-sm'] as TextStyle,
            {
              color: sereneColors['on-surface-variant'],
              textAlign: 'center',
              marginTop: sereneSpacing['space-sm'],
            },
          ]}
        >
          {logrosCopy.nota}
        </RNText>
      </ScrollView>
    </View>
  );
}
