import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useConflicts } from './hooks/useConflicts';
import ConflictosView from './views/ConflictosView';

export default function ConflictosMainScreen() {
  const navigation = useNavigation();
  const conflicts = useConflicts();

  return (
    <ConflictosView
      items={conflicts.items}
      loading={conflicts.loading}
      error={conflicts.error}
      busyIds={conflicts.busyIds}
      onResolve={conflicts.resolve}
      onBack={() => navigation.goBack()}
      onReload={conflicts.reload}
    />
  );
}
