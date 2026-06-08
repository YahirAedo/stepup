// ─── src/screens/FocusScreen.tsx ────────────────────────────────────────────
// Placeholder — Integrante C completa esta pantalla (DEV-C1)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FocusScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vista Foco</Text>
      <Text style={styles.sub}>DEV-C1 — Integrante C</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title:     { fontSize: 24, fontWeight: '600', color: '#1A3A5C' },
  sub:       { fontSize: 14, color: '#94A3B8', marginTop: 8 },
});