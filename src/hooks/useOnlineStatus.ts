import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
/**
 * État de la connexion réseau, utilisé pour signaler le mode hors-ligne.
 *
 * Sur le web, `navigator.onLine` et les évènements `online` / `offline`
 * suffisent et sont fiables. Sur mobile, une détection fiable demanderait
 * NetInfo : on considère l'appareil en ligne, et c'est la lecture Firestore
 * qui tranche (`getCatalogue` renvoie alors `degraded: true`).
 */
export const useOnlineStatus = (): boolean => {
  const isWeb = Platform.OS === 'web';
  const [online, setOnline] = useState<boolean>(() =>
    isWeb && typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    if (!isWeb || typeof window === 'undefined') return;

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    // L'état a pu changer entre le premier rendu et le montage.
    setOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isWeb]);

  return online;
};
