const STORAGE_KEYS = {
  ACTIVITY: 'fan-workshop-activity',
  STYLES: 'fan-workshop-styles',
  GROUPS: 'fan-workshop-groups'
};

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
  }
  return defaultValue;
}

export function clearStorage(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

export { STORAGE_KEYS };
