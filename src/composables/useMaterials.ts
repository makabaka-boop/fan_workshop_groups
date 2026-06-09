import { computed, type Ref } from 'vue';
import type { Group, FanStyle, MaterialItem, GroupMaterialItem, AllMaterialSummary } from '../types';

export function useMaterials(
  groups: Ref<Group[]> | Group[],
  styles: Ref<FanStyle[]> | FanStyle[]
) {
  const getGroups = () => Array.isArray(groups) ? groups : groups.value;
  const getStyles = () => Array.isArray(styles) ? styles : styles.value;

  const getStyleById = (id: string) => {
    return getStyles().find(s => s.id === id);
  };

  const getGroupStyles = (group: Group) => {
    return group.styleIds
      .map(id => getStyleById(id))
      .filter((s): s is FanStyle => s !== undefined);
  };

  const getGroupMaterials = (group: Group): GroupMaterialItem[] => {
    const materialMap = new Map<string, GroupMaterialItem>();
    const groupStyles = getGroupStyles(group);
    const peopleCount = group.peopleCount;

    groupStyles.forEach(style => {
      style.materials.forEach(m => {
        const key = `${m.name}-${m.unit}`;
        const quantityForStyle = m.quantity * peopleCount;
        const available = m.available ?? 0;

        if (materialMap.has(key)) {
          const existing = materialMap.get(key)!;
          existing.totalRequired += quantityForStyle;
          existing.styleBreakdown.push({
            styleId: style.id,
            styleName: style.name,
            quantityPerStyle: m.quantity,
            totalForStyle: quantityForStyle
          });
        } else {
          materialMap.set(key, {
            id: m.id,
            name: m.name,
            unit: m.unit,
            totalRequired: quantityForStyle,
            available: available,
            shortage: Math.max(0, quantityForStyle - available),
            isSufficient: quantityForStyle <= available,
            styleBreakdown: [{
              styleId: style.id,
              styleName: style.name,
              quantityPerStyle: m.quantity,
              totalForStyle: quantityForStyle
            }]
          });
        }
      });
    });

    const result = Array.from(materialMap.values());
    result.forEach(m => {
      m.shortage = Math.max(0, m.totalRequired - m.available);
      m.isSufficient = m.totalRequired <= m.available;
    });

    return result.sort((a, b) => {
      if (a.isSufficient !== b.isSufficient) {
        return a.isSufficient ? 1 : -1;
      }
      return b.shortage - a.shortage;
    });
  };

  const getAllMaterialsSummary = computed<AllMaterialSummary[]>(() => {
    const materialMap = new Map<string, AllMaterialSummary>();
    const currentGroups = getGroups();

    currentGroups.forEach(group => {
      const groupMaterials = getGroupMaterials(group);
      groupMaterials.forEach(mat => {
        const key = `${mat.name}-${mat.unit}`;
        if (materialMap.has(key)) {
          const existing = materialMap.get(key)!;
          existing.totalRequired += mat.totalRequired;
          existing.groupBreakdown.push({
            groupId: group.id,
            groupName: group.name,
            required: mat.totalRequired
          });
        } else {
          materialMap.set(key, {
            name: mat.name,
            unit: mat.unit,
            totalRequired: mat.totalRequired,
            totalAvailable: mat.available,
            totalShortage: Math.max(0, mat.totalRequired - mat.available),
            isSufficient: mat.totalRequired <= mat.available,
            groupBreakdown: [{
              groupId: group.id,
              groupName: group.name,
              required: mat.totalRequired
            }]
          });
        }
      });
    });

    const result = Array.from(materialMap.values());
    result.forEach(m => {
      m.totalShortage = Math.max(0, m.totalRequired - m.totalAvailable);
      m.isSufficient = m.totalRequired <= m.totalAvailable;
    });

    return result.sort((a, b) => {
      if (a.isSufficient !== b.isSufficient) {
        return a.isSufficient ? 1 : -1;
      }
      return b.totalShortage - a.totalShortage;
    });
  });

  const totalMaterialTypes = computed(() => getAllMaterialsSummary.value.length);

  const shortageMaterialCount = computed(() => 
    getAllMaterialsSummary.value.filter(m => !m.isSufficient).length
  );

  const hasMaterialShortage = computed(() => shortageMaterialCount.value > 0);

  return {
    getGroupMaterials,
    getAllMaterialsSummary,
    totalMaterialTypes,
    shortageMaterialCount,
    hasMaterialShortage
  };
}
