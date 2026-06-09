import { computed, type Ref } from 'vue';
import type { Group, FanStyle } from '../types';

export interface GroupMaterialNeed {
  name: string;
  unit: string;
  required: number;
  available: number;
  shortage: number;
}

export interface GroupMaterialsSummary {
  groupId: string;
  materials: GroupMaterialNeed[];
  shortageCount: number;
  totalShortage: number;
}

export interface GlobalMaterialsSummary {
  materials: GroupMaterialNeed[];
  shortageItems: GroupMaterialNeed[];
  shortageCount: number;
  totalRequired: number;
  totalAvailable: number;
  totalShortage: number;
}

/**
 * 按小组人数和已分配样式聚合材料需求与缺口。
 * 假设样式中 materials 列出的数量对应 suitablePeople 人数，
 * 实际需求按 peopleCount / suitablePeople 比例向上取整。
 */
export function useMaterials(groupsRef: Ref<Group[]>, stylesRef: Ref<FanStyle[]>) {
  const groupMaterials = computed<GroupMaterialsSummary[]>(() => {
    return groupsRef.value.map(group => {
      const map = new Map<string, GroupMaterialNeed>();
      group.styleIds.forEach(sid => {
        const style = stylesRef.value.find(s => s.id === sid);
        if (!style) return;
        const base = style.suitablePeople > 0 ? style.suitablePeople : 1;
        const people = group.peopleCount > 0 ? group.peopleCount : 0;
        style.materials.forEach(m => {
          const key = `${m.name}|${m.unit}`;
          const required = Math.ceil((m.quantity * people) / base);
          const available = m.available ?? 0;
          const existing = map.get(key);
          if (existing) {
            existing.required += required;
          } else {
            map.set(key, {
              name: m.name,
              unit: m.unit,
              required,
              available,
              shortage: 0
            });
          }
        });
      });
      const materials = Array.from(map.values()).map(m => ({
        ...m,
        shortage: Math.max(0, m.required - m.available)
      }));
      return {
        groupId: group.id,
        materials,
        shortageCount: materials.filter(m => m.shortage > 0).length,
        totalShortage: materials.reduce((s, m) => s + m.shortage, 0)
      };
    });
  });

  const globalSummary = computed<GlobalMaterialsSummary>(() => {
    const map = new Map<string, GroupMaterialNeed>();
    groupMaterials.value.forEach(g => {
      g.materials.forEach(m => {
        const key = `${m.name}|${m.unit}`;
        const existing = map.get(key);
        if (existing) {
          existing.required += m.required;
          // 同名材料视为同一物料池，取已知最大可用量
          existing.available = Math.max(existing.available, m.available);
        } else {
          map.set(key, { name: m.name, unit: m.unit, required: m.required, available: m.available, shortage: 0 });
        }
      });
    });
    const list = Array.from(map.values()).map(m => ({
      ...m,
      shortage: Math.max(0, m.required - m.available)
    }));
    const shortageItems = list.filter(m => m.shortage > 0);
    return {
      materials: list,
      shortageItems,
      shortageCount: shortageItems.length,
      totalRequired: list.reduce((s, m) => s + m.required, 0),
      totalAvailable: list.reduce((s, m) => s + m.available, 0),
      totalShortage: list.reduce((s, m) => s + m.shortage, 0)
    };
  });

  const getGroupMaterialSummary = (groupId: string): GroupMaterialsSummary | undefined => {
    return groupMaterials.value.find(g => g.groupId === groupId);
  };

  return {
    groupMaterials,
    globalSummary,
    getGroupMaterialSummary
  };
}
