import React from 'react';
import { Text as RNText, View, type TextStyle } from 'react-native';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
} from '../../../theme/serene';

export interface PerfilCardProps {
  /** Titulo de seccion opcional (ej. "Datos y sincronización"). */
  title?: string;
  children: React.ReactNode;
}

/**
 * Superficie en tarjeta de las previews de Perfil (radius, sombra ambiente y
 * padding). La usan la Variante A (todas las secciones) y la Variante C (bloque
 * de datos). No define fondo de pantalla.
 */
export default function PerfilCard({ title, children }: PerfilCardProps) {
  return (
    <View
      style={{
        padding: sereneSpacing['space-lg'],
        borderRadius: sereneBorderRadius.xl,
        backgroundColor: sereneColors['surface-container-lowest'],
        ...sereneShadows.card,
      }}
    >
      {title ? (
        <RNText
          style={[
            sereneTypography['title-md'] as TextStyle,
            { color: sereneColors['on-surface'], marginBottom: sereneSpacing['space-md'] },
          ]}
        >
          {title}
        </RNText>
      ) : null}
      {children}
    </View>
  );
}
