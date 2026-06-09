import { ref, watch } from 'vue';
import type { ActivityInfo } from '../types';
import { defaultActivity } from '../data/mockData';
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '../utils/storage';

const activity = ref<ActivityInfo>(loadFromStorage(STORAGE_KEYS.ACTIVITY, defaultActivity));

watch(activity, (newVal) => {
  saveToStorage(STORAGE_KEYS.ACTIVITY, newVal);
}, { deep: true });

export function useActivity() {
  const updateActivity = (updates: Partial<ActivityInfo>) => {
    activity.value = { ...activity.value, ...updates };
  };

  const resetActivity = () => {
    activity.value = { ...defaultActivity };
  };

  return {
    activity,
    updateActivity,
    resetActivity
  };
}
