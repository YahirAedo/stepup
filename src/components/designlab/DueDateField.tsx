import React, { useState } from 'react';
import { View, Text as RNText, Pressable, Platform, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  useResponsive,
} from '../../theme/serene';
import { mci } from './mciIconMap';
import { dateFromIso, formatDueDate, isoFromDate } from '../../utils/designlab/dueDate';

export interface DueDateFieldProps {
  /** Valor ISO corto `YYYY-MM-DD`, o `undefined` si no hay fecha meta. */
  value?: string;
  onChange: (iso?: string) => void;
  label: string;
  /** Texto mostrado cuando no hay fecha. */
  noneLabel: string;
  /** Texto accesible del botón para quitar la fecha. */
  clearLabel: string;
  /** Etiqueta accesible del control. */
  a11yLabel: string;
}

/**
 * Campo de fecha meta (dato neutro y opcional). Abre el date picker nativo
 * (`@react-native-community/datetimepicker`, ya en dependencias). Reusable por
 * el formulario de Crear/Editar y por el Detalle de la tarea.
 */
export default function DueDateField({
  value,
  onChange,
  label,
  noneLabel,
  clearLabel,
  a11yLabel,
}: DueDateFieldProps) {
  const { scale: s } = useResponsive();
  const [open, setOpen] = useState(false);
  const hasValue = Boolean(value);
  const pickerValue = dateFromIso(value) ?? new Date();

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== 'ios') setOpen(false);
    if (event.type === 'set' && selected) {
      onChange(isoFromDate(selected));
      if (Platform.OS === 'ios') setOpen(false);
    }
  };

  return (
    <View style={{ gap: sereneSpacing['space-xs'] }}>
      <RNText
        style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
      >
        {label}
      </RNText>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: sereneSpacing['space-sm'] }}>
        <Pressable
          onPress={() => setOpen((prev) => !prev)}
          accessibilityRole="button"
          accessibilityLabel={a11yLabel}
          accessibilityState={{ expanded: open }}
          style={({ pressed }) => ({
            flex: 1,
            minHeight: s(48),
            flexDirection: 'row',
            alignItems: 'center',
            gap: s(8),
            paddingHorizontal: sereneSpacing['space-md'],
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: sereneColors['surface-container-high'],
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <MaterialCommunityIcons
            name={mci('calendar_today')}
            size={s(18)}
            color={sereneColors['on-surface-variant']}
          />
          <RNText
            style={[
              sereneTypography['body-md'] as TextStyle,
              {
                color: hasValue ? sereneColors['on-surface'] : sereneColors['on-surface-variant'],
                flex: 1,
              },
            ]}
          >
            {hasValue ? formatDueDate(value) : noneLabel}
          </RNText>
        </Pressable>

        {hasValue && (
          <Pressable
            onPress={() => {
              setOpen(false);
              onChange(undefined);
            }}
            accessibilityRole="button"
            accessibilityLabel={clearLabel}
            hitSlop={s(8)}
            style={({ pressed }) => ({
              width: s(44),
              height: s(44),
              borderRadius: sereneBorderRadius.lg,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <MaterialCommunityIcons name="close" size={s(18)} color={sereneColors['on-surface-variant']} />
          </Pressable>
        )}
      </View>

      {open && (
        <DateTimePicker
          value={pickerValue}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleChange}
        />
      )}
    </View>
  );
}
