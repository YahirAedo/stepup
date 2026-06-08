// ─── src/screens/TaskListScreen.tsx ─────────────────────────────────────────
// Placeholder — Integrante B completa esta pantalla (DEV-B2)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TaskListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Tareas</Text>
      <Text style={styles.sub}>DEV-B2 — Integrante B</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title:     { fontSize: 24, fontWeight: '600', color: '#1A3A5C' },
  sub:       { fontSize: 14, color: '#94A3B8', marginTop: 8 },
});