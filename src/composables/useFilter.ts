import { ref, computed, type Ref } from 'vue';
import type { FilterCriteria, FanStyle, DifficultyLevel, StyleStatus } from '../types';

const filterCriteria = ref<FilterCriteria>({});

export function useFilter(styles: Ref<FanStyle[]>) {
  const setDifficultyFilter = (difficulty?: DifficultyLevel) => {
    filterCriteria.value.difficulty = difficulty;
  };

  const setMaterialKeywordFilter = (keyword?: string) => {
    filterCriteria.value.materialKeyword = keyword;
  };

  const setPeopleRangeFilter = (min?: number, max?: number) => {
    filterCriteria.value.minPeople = min;
    filterCriteria.value.maxPeople = max;
  };

  const setStatusFilter = (status?: StyleStatus) => {
    filterCriteria.value.status = status;
  };

  const clearFilters = () => {
    filterCriteria.value = {};
  };

  const filteredStyles = computed(() => {
    return styles.value.filter(style => {
      if (filterCriteria.value.difficulty && style.difficulty !== filterCriteria.value.difficulty) {
        return false;
      }

      if (filterCriteria.value.status && style.status !== filterCriteria.value.status) {
        return false;
      }

      if (filterCriteria.value.materialKeyword) {
        const keyword = filterCriteria.value.materialKeyword.toLowerCase();
        const hasMaterial = style.materials.some(m => 
          m.name.toLowerCase().includes(keyword)
        );
        if (!hasMaterial) return false;
      }

      if (filterCriteria.value.minPeople !== undefined && style.suitablePeople < filterCriteria.value.minPeople) {
        return false;
      }

      if (filterCriteria.value.maxPeople !== undefined && style.suitablePeople > filterCriteria.value.maxPeople) {
        return false;
      }

      return true;
    });
  });

  const hasActiveFilters = computed(() => {
    return Object.keys(filterCriteria.value).some(key => {
      const value = filterCriteria.value[key as keyof FilterCriteria];
      return value !== undefined && value !== '';
    });
  });

  return {
    filterCriteria,
    filteredStyles,
    hasActiveFilters,
    setDifficultyFilter,
    setMaterialKeywordFilter,
    setPeopleRangeFilter,
    setStatusFilter,
    clearFilters
  };
}
