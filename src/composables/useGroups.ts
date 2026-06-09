import { ref, computed, watch } from 'vue';
import type { Group } from '../types';
import { mockGroups } from '../data/mockData';
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '../utils/storage';

const groups = ref<Group[]>(loadFromStorage(STORAGE_KEYS.GROUPS, mockGroups));

watch(groups, (newVal) => {
  saveToStorage(STORAGE_KEYS.GROUPS, newVal);
}, { deep: true });

export function useGroups() {
  const addGroup = (group: Omit<Group, 'id'>) => {
    const newGroup: Group = {
      ...group,
      id: 'g' + Date.now().toString()
    };
    groups.value.push(newGroup);
    return newGroup;
  };

  const updateGroup = (id: string, updates: Partial<Group>) => {
    const index = groups.value.findIndex(g => g.id === id);
    if (index !== -1) {
      groups.value[index] = { ...groups.value[index], ...updates };
    }
  };

  const deleteGroup = (id: string) => {
    const index = groups.value.findIndex(g => g.id === id);
    if (index !== -1) {
      groups.value.splice(index, 1);
    }
  };

  const getGroupById = (id: string) => {
    return groups.value.find(g => g.id === id);
  };

  const assignStyleToGroup = (groupId: string, styleId: string) => {
    const group = getGroupById(groupId);
    if (group && !group.styleIds.includes(styleId)) {
      group.styleIds.push(styleId);
    }
  };

  const removeStyleFromGroup = (groupId: string, styleId: string) => {
    const group = getGroupById(groupId);
    if (group) {
      const index = group.styleIds.indexOf(styleId);
      if (index !== -1) {
        group.styleIds.splice(index, 1);
      }
    }
  };

  const getStyleGroup = (styleId: string) => {
    return groups.value.find(g => g.styleIds.includes(styleId));
  };

  const isStyleAssigned = (styleId: string) => {
    return groups.value.some(g => g.styleIds.includes(styleId));
  };

  const totalPeopleInGroups = computed(() => {
    return groups.value.reduce((sum, group) => sum + group.peopleCount, 0);
  });

  const getAssignedStyleIds = computed(() => {
    const ids: string[] = [];
    groups.value.forEach(group => {
      ids.push(...group.styleIds);
    });
    return ids;
  });

  const resetGroups = () => {
    groups.value = [...mockGroups];
  };

  return {
    groups,
    addGroup,
    updateGroup,
    deleteGroup,
    getGroupById,
    assignStyleToGroup,
    removeStyleFromGroup,
    getStyleGroup,
    isStyleAssigned,
    totalPeopleInGroups,
    getAssignedStyleIds,
    resetGroups
  };
}
