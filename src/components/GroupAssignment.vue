<script setup lang="ts">
import { ref, computed } from 'vue';
import { Users, Clock, Package, Plus, Trash2, ChevronDown, ChevronUp, AlertTriangle, CheckCircle } from 'lucide-vue-next';
import type { Group, FanStyle, GroupMaterialItem } from '../types';

interface Props {
  groups: Group[];
  styles: FanStyle[];
  unassignedStyles: FanStyle[];
}

interface Emits {
  (e: 'addGroup'): void;
  (e: 'updateGroup', id: string, updates: Partial<Group>): void;
  (e: 'deleteGroup', id: string): void;
  (e: 'assignStyle', groupId: string, styleId: string): void;
  (e: 'removeStyle', groupId: string, styleId: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const getStyleById = (id: string) => {
  return props.styles.find(s => s.id === id);
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

const expandedGroups = ref<Set<string>>(new Set());

const toggleGroup = (groupId: string) => {
  if (expandedGroups.value.has(groupId)) {
    expandedGroups.value.delete(groupId);
  } else {
    expandedGroups.value.add(groupId);
  }
};

const getGroupTotalDuration = (group: Group) => {
  return getGroupStyles(group).reduce((sum, s) => sum + s.duration, 0);
};

const getGroupShortageCount = (group: Group) => {
  const materials = getGroupMaterials(group);
  return materials.filter(m => !m.isSufficient).length;
};

const selectStyleForAssignment = ref<string | null>(null);
const assigningToGroup = ref<string | null>(null);

const startAssign = (groupId: string) => {
  assigningToGroup.value = groupId;
  selectStyleForAssignment.value = null;
};

const confirmAssign = () => {
  if (assigningToGroup.value && selectStyleForAssignment.value) {
    emit('assignStyle', assigningToGroup.value, selectStyleForAssignment.value);
  }
  assigningToGroup.value = null;
  selectStyleForAssignment.value = null;
};

const cancelAssign = () => {
  assigningToGroup.value = null;
  selectStyleForAssignment.value = null;
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-4">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <Users class="w-5 h-5 text-green-600" />
        分组执行表
      </h2>
      <button
        @click="emit('addGroup')"
        class="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
      >
        <Plus class="w-4 h-4" />
        添加小组
      </button>
    </div>

    <div v-if="groups.length === 0" class="text-center py-8 text-gray-500">
      暂无小组，点击上方按钮添加
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="group in groups"
        :key="group.id"
        class="border border-gray-200 rounded-lg overflow-hidden"
      >
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <input
                :value="group.name"
                @input="emit('updateGroup', group.id, { name: ($event.target as HTMLInputElement).value })"
                type="text"
                class="font-semibold text-gray-800 bg-transparent border-b border-transparent focus:border-green-500 outline-none"
              />
              <div class="flex items-center gap-4 text-sm text-gray-600">
                <span class="flex items-center gap-1">
                  <Users class="w-4 h-4" />
                  <input
                    :value="group.peopleCount"
                    @input="emit('updateGroup', group.id, { peopleCount: Number(($event.target as HTMLInputElement).value) })"
                    type="number"
                    min="1"
                    class="w-12 text-center bg-white/50 rounded px-1"
                  />
                  人
                </span>
                <span class="flex items-center gap-1">
                  <Clock class="w-4 h-4" />
                  {{ getGroupTotalDuration(group) }} 分钟
                </span>
                <span class="flex items-center gap-1">
                  <Package class="w-4 h-4" />
                  {{ getGroupMaterials(group).length }} 种材料
                </span>
                <span v-if="getGroupShortageCount(group) > 0" class="flex items-center gap-1 text-red-500 font-medium">
                  <AlertTriangle class="w-4 h-4" />
                  {{ getGroupShortageCount(group) }} 种缺口
                </span>
                <span v-else class="flex items-center gap-1 text-green-600 font-medium">
                  <CheckCircle class="w-4 h-4" />
                  材料充足
                </span>
                <span class="text-green-600 font-medium">
                  {{ group.styleIds.length }} 个样式
                </span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="toggleGroup(group.id)"
                class="p-2 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded transition-colors"
              >
                <ChevronUp v-if="expandedGroups.has(group.id)" class="w-5 h-5" />
                <ChevronDown v-else class="w-5 h-5" />
              </button>
              <button
                @click="emit('deleteGroup', group.id)"
                class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div v-show="expandedGroups.has(group.id)" class="p-4">
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">分配的样式</span>
              <button
                v-if="unassignedStyles.length > 0"
                @click="startAssign(group.id)"
                class="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
              >
                <Plus class="w-4 h-4" />
                分配样式
              </button>
            </div>

            <div v-if="assigningToGroup === group.id" class="mb-3 p-3 bg-green-50 rounded-lg">
              <div class="flex items-center gap-2">
                <select
                  v-model="selectStyleForAssignment"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                >
                  <option value="">选择样式...</option>
                  <option v-for="style in unassignedStyles" :key="style.id" :value="style.id">
                    {{ style.name }}
                  </option>
                </select>
                <button
                  @click="confirmAssign"
                  :disabled="!selectStyleForAssignment"
                  class="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  确认
                </button>
                <button
                  @click="cancelAssign"
                  class="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>

            <div v-if="group.styleIds.length === 0" class="text-center py-4 text-gray-400 text-sm">
              暂无分配的样式
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div
                v-for="style in getGroupStyles(group)"
                :key="style.id"
                class="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div>
                  <span class="font-medium text-gray-800">{{ style.name }}</span>
                  <span class="text-sm text-gray-500 ml-2">({{ style.duration }}分钟)</span>
                </div>
                <button
                  @click="emit('removeStyle', group.id, style.id)"
                  class="text-red-500 hover:text-red-700 text-sm"
                >
                  移除
                </button>
              </div>
            </div>
          </div>

          <div v-if="getGroupStyles(group).length > 0">
            <div class="border-t border-gray-200 pt-4">
              <h4 class="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Package class="w-4 h-4 text-purple-500" />
                材料清单预估（按{{ group.peopleCount }}人计算）
              </h4>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-gray-50">
                      <th class="text-left px-3 py-2 font-medium text-gray-600 rounded-l-lg">材料名称</th>
                      <th class="text-center px-3 py-2 font-medium text-gray-600">单位用量</th>
                      <th class="text-center px-3 py-2 font-medium text-gray-600">总需求量</th>
                      <th class="text-center px-3 py-2 font-medium text-gray-600">可用量</th>
                      <th class="text-center px-3 py-2 font-medium text-gray-600 rounded-r-lg">缺口</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    <tr
                      v-for="mat in getGroupMaterials(group)"
                      :key="`${mat.name}-${mat.unit}`"
                      :class="mat.isSufficient ? '' : 'bg-red-50'"
                    >
                      <td class="px-3 py-2 font-medium text-gray-800">
                        <div class="flex items-center gap-2">
                          <AlertTriangle v-if="!mat.isSufficient" class="w-4 h-4 text-red-500" />
                          <CheckCircle v-else class="w-4 h-4 text-green-500" />
                          {{ mat.name }}
                        </div>
                      </td>
                      <td class="px-3 py-2 text-center text-gray-600">
                        <span v-for="(bd, idx) in mat.styleBreakdown" :key="bd.styleId" class="block text-xs">
                          {{ bd.styleName }}: {{ bd.quantityPerStyle }}{{ mat.unit }}
                        </span>
                      </td>
                      <td class="px-3 py-2 text-center font-semibold text-blue-600">
                        {{ mat.totalRequired }}{{ mat.unit }}
                      </td>
                      <td class="px-3 py-2 text-center text-gray-600">
                        {{ mat.available }}{{ mat.unit }}
                      </td>
                      <td class="px-3 py-2 text-center">
                        <span v-if="mat.shortage > 0" class="font-semibold text-red-500">
                          缺{{ mat.shortage }}{{ mat.unit }}
                        </span>
                        <span v-else class="text-green-600 font-medium">
                          充足
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-if="getGroupShortageCount(group) > 0" class="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <div class="flex items-start gap-2">
                  <AlertTriangle class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p class="text-sm font-medium text-red-800">
                      注意：该组有 {{ getGroupShortageCount(group) }} 种材料缺口
                    </p>
                    <p class="text-xs text-red-600 mt-1">
                      请及时补充材料或调整分配方案
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
