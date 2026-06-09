import { computed } from 'vue';
import type { FanStyle, Group, GroupMaterialDetail, GlobalMaterialSummary, GroupMaterialEstimate } from '../types';

export function useMaterialEstimation(
  groups: () => Group[],
  styles: () => FanStyle[]
) {
  const getStyleById = (id: string): FanStyle | undefined => {
    return styles().find(s => s.id === id);
  };

  const groupMaterialEstimates = computed<GroupMaterialEstimate[]>(() => {
    return groups().map(group => {
      const materialMap = new Map<string, GroupMaterialDetail>();

      group.styleIds.forEach(styleId => {
        const style = getStyleById(styleId);
        if (!style) return;

        const sets = Math.max(1, Math.ceil(group.peopleCount / Math.max(1, style.suitablePeople)));

        style.materials.forEach(m => {
          const key = `${m.name}-${m.unit}`;
          const requiredForStyle = m.quantity * sets;
          const existing = materialMap.get(key);

          if (existing) {
            existing.required += requiredForStyle;
            existing.available = Math.max(existing.available, m.available ?? 0);
            if (!existing.fromStyles.includes(style.name)) {
              existing.fromStyles.push(style.name);
            }
          } else {
            materialMap.set(key, {
              name: m.name,
              unit: m.unit,
              required: requiredForStyle,
              available: m.available ?? 0,
              gap: 0,
              sufficient: true,
              fromStyles: [style.name]
            });
          }
        });
      });

      const materials: GroupMaterialDetail[] = [];
      materialMap.forEach(mat => {
        const gap = mat.available > 0 ? Math.max(0, mat.required - mat.available) : 0;
        mat.gap = gap;
        mat.sufficient = mat.available === 0 || gap === 0;
        materials.push(mat);
      });

      materials.sort((a, b) => {
        if (a.sufficient !== b.sufficient) return a.sufficient ? 1 : -1;
        return a.name.localeCompare(b.name);
      });

      const shortageKinds = materials.filter(m => !m.sufficient).length;

      return {
        groupId: group.id,
        groupName: group.name,
        materials,
        totalKinds: materials.length,
        shortageKinds,
        hasShortage: shortageKinds > 0
      };
    });
  });

  const globalMaterialSummary = computed<GlobalMaterialSummary[]>(() => {
    const globalMap = new Map<string, GlobalMaterialSummary>();

    groups().forEach(group => {
      group.styleIds.forEach(styleId => {
        const style = getStyleById(styleId);
        if (!style) return;

        const sets = Math.max(1, Math.ceil(group.peopleCount / Math.max(1, style.suitablePeople)));

        style.materials.forEach(m => {
          const key = `${m.name}-${m.unit}`;
          const requiredForEntry = m.quantity * sets;
          const existing = globalMap.get(key);

          if (existing) {
            existing.totalRequired += requiredForEntry;
            existing.globalAvailable = Math.max(existing.globalAvailable, m.available ?? 0);
            if (!existing.affectedGroups.includes(group.name)) {
              existing.affectedGroups.push(group.name);
            }
          } else {
            globalMap.set(key, {
              name: m.name,
              unit: m.unit,
              totalRequired: requiredForEntry,
              globalAvailable: m.available ?? 0,
              totalGap: 0,
              sufficient: true,
              affectedGroups: [group.name]
            });
          }
        });
      });
    });

    const result: GlobalMaterialSummary[] = [];
    globalMap.forEach(mat => {
      const gap = mat.globalAvailable > 0 ? Math.max(0, mat.totalRequired - mat.globalAvailable) : 0;
      mat.totalGap = gap;
      mat.sufficient = mat.globalAvailable === 0 || gap === 0;
      result.push(mat);
    });

    result.sort((a, b) => {
      if (a.sufficient !== b.sufficient) return a.sufficient ? 1 : -1;
      return a.name.localeCompare(b.name);
    });

    return result;
  });

  const totalShortageKinds = computed(() => {
    return globalMaterialSummary.value.filter(m => !m.sufficient).length;
  });

  const totalMaterialKinds = computed(() => {
    return globalMaterialSummary.value.length;
  });

  const anyGroupShortage = computed(() => {
    return groupMaterialEstimates.value.some(g => g.hasShortage);
  });

  return {
    groupMaterialEstimates,
    globalMaterialSummary,
    totalShortageKinds,
    totalMaterialKinds,
    anyGroupShortage
  };
}
