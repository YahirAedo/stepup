import React from 'react';
import { useLogros } from './hooks/useLogros';
import LogrosView from './views/LogrosView';

export default function LogrosMainScreen() {
  const logros = useLogros();

  return (
    <LogrosView
      view={logros.view}
      filter={logros.filter}
      onFilterChange={logros.setFilter}
    />
  );
}
