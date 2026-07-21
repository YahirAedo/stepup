const isWeb = typeof window !== 'undefined' && window.localStorage;

function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    return Promise.resolve(localStorage.getItem(key));
  }
  return import('@react-native-async-storage/async-storage').then(
    (m) => m.default.getItem(key),
  );
}

function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    localStorage.setItem(key, value);
    return Promise.resolve();
  }
  return import('@react-native-async-storage/async-storage').then((m) =>
    m.default.setItem(key, value),
  );
}

export const storage = { getItem, setItem };
