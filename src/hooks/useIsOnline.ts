import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

// Estado de conectividad para el flujo de IA (issue #155, HU-14): la IA nunca
// bloquea — sin conexión el botón de IA no aparece y la creación manual queda intacta.
// Arranca en `false` (oculto hasta confirmar) para no mostrar un botón que fallaría.
export function useIsOnline(): boolean {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    let mounted = true;
    NetInfo.fetch().then((state) => {
      if (mounted) setIsOnline(state.isConnected === true);
    });
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (mounted) setIsOnline(state.isConnected === true);
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return isOnline;
}
