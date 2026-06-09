import { ref, computed, watch } from 'vue';
import type { FanStyle, MaterialItem, FAQ, DifficultyLevel, StyleStatus } from '../types';
import { mockStyles } from '../data/mockData';
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '../utils/storage';

const styles = ref<FanStyle[]>(loadFromStorage(STORAGE_KEYS.STYLES, mockStyles));

watch(styles, (newVal) => {
  saveToStorage(STORAGE_KEYS.STYLES, newVal);
}, { deep: true });

export function useStyles() {
  const addStyle = (style: Omit<FanStyle, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const newStyle: FanStyle = {
      ...style,
      id: now.toString(),
      createdAt: now,
      updatedAt: now
    };
    styles.value.push(newStyle);
    return newStyle;
  };

  const copyStyle = (styleId: string) => {
    const originalStyle = getStyleById(styleId);
    if (!originalStyle) return null;

    const now = Date.now();
    const newStyle: FanStyle = {
      ...JSON.parse(JSON.stringify(originalStyle)),
      id: now.toString(),
      name: `${originalStyle.name} (副本)`,
      createdAt: now,
      updatedAt: now
    };
    styles.value.push(newStyle);
    return newStyle;
  };

  const updateStyle = (id: string, updates: Partial<FanStyle>) => {
    const index = styles.value.findIndex(s => s.id === id);
    if (index !== -1) {
      styles.value[index] = {
        ...styles.value[index],
        ...updates,
        updatedAt: Date.now()
      };
    }
  };

  const deleteStyle = (id: string) => {
    const index = styles.value.findIndex(s => s.id === id);
    if (index !== -1) {
      styles.value.splice(index, 1);
    }
  };

  const getStyleById = (id: string) => {
    return styles.value.find(s => s.id === id);
  };

  const addMaterial = (styleId: string, material: Omit<MaterialItem, 'id'>) => {
    const style = getStyleById(styleId);
    if (style) {
      style.materials.push({
        ...material,
        id: Date.now().toString()
      });
    }
  };

  const updateMaterial = (styleId: string, materialId: string, updates: Partial<MaterialItem>) => {
    const style = getStyleById(styleId);
    if (style) {
      const material = style.materials.find(m => m.id === materialId);
      if (material) {
        Object.assign(material, updates);
      }
    }
  };

  const deleteMaterial = (styleId: string, materialId: string) => {
    const style = getStyleById(styleId);
    if (style) {
      const index = style.materials.findIndex(m => m.id === materialId);
      if (index !== -1) {
        style.materials.splice(index, 1);
      }
    }
  };

  const addFAQ = (styleId: string, faq: Omit<FAQ, 'id'>) => {
    const style = getStyleById(styleId);
    if (style) {
      style.faqs.push({
        ...faq,
        id: Date.now().toString()
      });
    }
  };

  const updateFAQ = (styleId: string, faqId: string, updates: Partial<FAQ>) => {
    const style = getStyleById(styleId);
    if (style) {
      const faq = style.faqs.find(f => f.id === faqId);
      if (faq) {
        Object.assign(faq, updates);
      }
    }
  };

  const deleteFAQ = (styleId: string, faqId: string) => {
    const style = getStyleById(styleId);
    if (style) {
      const index = style.faqs.findIndex(f => f.id === faqId);
      if (index !== -1) {
        style.faqs.splice(index, 1);
      }
    }
  };

  const stylesByDifficulty = computed(() => {
    const grouped: Record<DifficultyLevel, FanStyle[]> = {
      easy: [],
      medium: [],
      hard: [],
      expert: []
    };
    styles.value.forEach(style => {
      grouped[style.difficulty].push(style);
    });
    return grouped;
  });

  const stylesByStatus = computed(() => {
    const grouped: Record<StyleStatus, FanStyle[]> = {
      beginner: [],
      'demo-required': [],
      'insufficient-material': [],
      'display-only': []
    };
    styles.value.forEach(style => {
      grouped[style.status].push(style);
    });
    return grouped;
  });

  const totalDuration = computed(() => {
    return styles.value.reduce((sum, style) => sum + style.duration, 0);
  });

  const resetStyles = () => {
    styles.value = [...mockStyles];
  };

  return {
    styles,
    addStyle,
    copyStyle,
    updateStyle,
    deleteStyle,
    getStyleById,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    addFAQ,
    updateFAQ,
    deleteFAQ,
    stylesByDifficulty,
    stylesByStatus,
    totalDuration,
    resetStyles
  };
}
