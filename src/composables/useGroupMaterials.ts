import { computed } from 'vue';
import type { FanStyle, Group, GroupMaterialItem, GroupMaterialSummary, OverallMaterialItem, MaterialDetail } from '../types';
import { useGroups } from './useGroups';
import { useStyles } from './useStyles';

export function useGroupMaterials() {
  const { groups } = useGroups();
  const { styles } = useStyles();

  const getStyleById = (id: string): FanStyle | undefined => {
    return styles.value.find(s => s.id === id);
  };

  const calcScaledQuantity = (baseQuantity: number, groupPeople: number, styleSuitablePeople: number): number => {
    if (styleSuitablePeople <= 0) return baseQuantity;
    return Math.ceil(baseQuantity * groupPeople / styleSuitablePeople);
  };

  const getGroupMaterialSummary = (group: Group): GroupMaterialSummary => {
    const groupStyles = group.styleIds
      .map(id => getStyleById(id))
      .filter((s): s is FanStyle => s !== undefined);

    const materialMap = new Map<string, {
      name: string;
      unit: string;
      required: number;
      available: number;
      hasAvailableData: boolean;
      details: MaterialDetail[];
    }>();

    groupStyles.forEach(style => {
      style.materials.forEach(m => {
        const key = `${m.name}-${m.unit}`;
        const scaled = calcScaledQuantity(m.quantity, group.peopleCount, style.suitablePeople);
        const existing = materialMap.get(key);
        if (existing) {
          existing.required += scaled;
          if (m.available !== undefined) {
            existing.available = Math.max(existing.available, m.available);
            existing.hasAvailableData = true;
          }
          existing.details.push({
            styleName: style.name,
            baseQuantity: m.quantity,
            scaledQuantity: scaled
          });
        } else {
          materialMap.set(key, {
            name: m.name,
            unit: m.unit,
            required: scaled,
            available: m.available ?? 0,
            hasAvailableData: m.available !== undefined,
            details: [{
              styleName: style.name,
              baseQuantity: m.quantity,
              scaledQuantity: scaled
            }]
          });
        }
      });
    });

    const materials: GroupMaterialItem[] = Array.from(materialMap.values()).map(m => ({
      name: m.name,
      unit: m.unit,
      required: m.required,
      available: m.available,
      shortage: m.hasAvailableData ? Math.max(0, m.required - m.available) : 0,
      isShortage: m.hasAvailableData && m.required > m.available,
      noStockData: !m.hasAvailableData,
      details: m.details
    }));

    return {
      groupId: group.id,
      groupName: group.name,
      materials,
      shortageCount: materials.filter(m => m.isShortage).length
    };
  };

  const groupMaterialSummaries = computed<GroupMaterialSummary[]>(() => {
    return groups.value.map(group => getGroupMaterialSummary(group));
  });

  const overallMaterialShortage = computed<OverallMaterialItem[]>(() => {
    const globalMap = new Map<string, {
      name: string;
      unit: string;
      totalRequired: number;
      available: number;
      hasAvailableData: boolean;
      groupBreakdown: Map<string, number>;
    }>();

    groupMaterialSummaries.value.forEach(summary => {
      summary.materials.forEach(mat => {
        const key = `${mat.name}-${mat.unit}`;
        const existing = globalMap.get(key);
        if (existing) {
          existing.totalRequired += mat.required;
          if (!mat.noStockData) {
            existing.available = Math.max(existing.available, mat.available);
            existing.hasAvailableData = true;
          }
          if (mat.required > 0) {
            const prev = existing.groupBreakdown.get(summary.groupName) ?? 0;
            existing.groupBreakdown.set(summary.groupName, prev + mat.required);
          }
        } else {
          const breakdown = new Map<string, number>();
          if (mat.required > 0) {
            breakdown.set(summary.groupName, mat.required);
          }
          globalMap.set(key, {
            name: mat.name,
            unit: mat.unit,
            totalRequired: mat.required,
            available: mat.noStockData ? 0 : mat.available,
            hasAvailableData: !mat.noStockData,
            groupBreakdown: breakdown
          });
        }
      });
    });

    return Array.from(globalMap.values()).map(m => ({
      name: m.name,
      unit: m.unit,
      totalRequired: m.totalRequired,
      available: m.available,
      shortage: m.hasAvailableData ? Math.max(0, m.totalRequired - m.available) : 0,
      isShortage: m.hasAvailableData && m.totalRequired > m.available,
      noStockData: !m.hasAvailableData,
      groupBreakdown: Array.from(m.groupBreakdown.entries()).map(([groupName, required]) => ({
        groupName,
        required
      }))
    }));
  });

  const totalShortageCount = computed(() => {
    return overallMaterialShortage.value.filter(m => m.isShortage).length;
  });

  const totalNoDataCount = computed(() => {
    return overallMaterialShortage.value.filter(m => m.noStockData).length;
  });

  return {
    groupMaterialSummaries,
    overallMaterialShortage,
    totalShortageCount,
    totalNoDataCount,
    getGroupMaterialSummary
  };
}
