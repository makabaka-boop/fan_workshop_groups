<script setup lang="ts">
import { ref, computed } from 'vue';
import { Users, Clock, Package, Plus, Trash2, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2 } from 'lucide-vue-next';
import type { Group, FanStyle } from '../types';
import { useMaterialEstimation } from '../composables/useMaterialEstimation';

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

const { groupMaterialEstimates } = useMaterialEstimation(
  () => props.groups,
  () => props.styles
);

const expandedGroups = ref<Set<string>>(new Set());

const toggleGroup = (groupId: string) => {
  if (expandedGroups.value.has(groupId)) {
    expandedGroups.value.delete(groupId);
  } else {
    expandedGroups.value.add(groupId);
  }
};

const getGroupStyles = (group: Group) => {
  return group.styleIds
    .map(id => props.styles.find(s => s.id === id))
    .filter((s): s is FanStyle => s !== undefined);
};

const getGroupTotalDuration = (group: Group) => {
  return getGroupStyles(group).reduce((sum, s) => sum + s.duration, 0);
};

const getGroupEstimate = (groupId: string) => {
  return groupMaterialEstimates.value.find(e => e.groupId === groupId);
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
        <span class="text-xs font-normal text-gray-500 ml-2">材料预估按小组人数自动汇总</span>
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
            <div class="flex items-center gap-4 flex-wrap">
              <input
                :value="group.name"
                @input="emit('updateGroup', group.id, { name: ($event.target as HTMLInputElement).value })"
                type="text"
                class="font-semibold text-gray-800 bg-transparent border-b border-transparent focus:border-green-500 outline-none"
              />
              <div class="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                <span class="flex items-center gap-1">
                  <Users class="w-4 h-4" />
                  <input
                    :value="group.peopleCount"
                    @input="emit('updateGroup', group.id, { peopleCount: Math.max(1, Number(($event.target as HTMLInputElement).value) || 1) })"
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
                  {{ getGroupEstimate(group.id)?.totalKinds ?? 0 }} 种材料
                </span>
                <span class="text-green-600 font-medium">
                  {{ group.styleIds.length }} 个样式
                </span>
                <span
                  v-if="getGroupEstimate(group.id)?.hasShortage"
                  class="flex items-center gap-1 text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded-full"
                >
                  <AlertTriangle class="w-3.5 h-3.5" />
                  {{ getGroupEstimate(group.id)?.shortageKinds }} 项缺口
                </span>
                <span
                  v-else-if="getGroupEstimate(group.id) && getGroupEstimate(group.id)!.totalKinds > 0"
                  class="flex items-center gap-1 text-green-700 font-medium bg-green-100 px-2 py-0.5 rounded-full"
                >
                  <CheckCircle2 class="w-3.5 h-3.5" />
                  材料充足
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
                    {{ style.name }}（{{ style.suitablePeople }}人/{{ style.duration }}分钟）
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
                  <span class="text-sm text-gray-500 ml-2">({{ style.suitablePeople }}人/{{ style.duration }}分钟)</span>
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

          <div v-if="getGroupEstimate(group.id) && getGroupEstimate(group.id)!.materials.length > 0">
            <div class="border-t border-gray-200 pt-4">
              <h4 class="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Package class="w-4 h-4 text-amber-600" />
                材料清单预估
                <span class="text-xs font-normal text-gray-400">
                  （按 {{ group.peopleCount }} 人 × 样式套数计算）
                </span>
              </h4>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="text-left text-gray-500 border-b border-gray-200">
                      <th class="pb-2 pr-3 font-medium">材料名称</th>
                      <th class="pb-2 px-3 font-medium text-center">总需求量</th>
                      <th class="pb-2 px-3 font-medium text-center">可用库存</th>
                      <th class="pb-2 pl-3 font-medium text-center">缺口</th>
                      <th class="pb-2 pl-3 font-medium">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="mat in getGroupEstimate(group.id)!.materials"
                      :key="`${mat.name}-${mat.unit}`"
                      class="border-b border-gray-100 last:border-0"
                      :class="mat.sufficient ? '' : 'bg-red-50/50'"
                    >
                      <td class="py-2 pr-3">
                        <div class="font-medium text-gray-800">{{ mat.name }}</div>
                        <div class="text-xs text-gray-400">来自：{{ mat.fromStyles.join('、') }}</div>
                      </td>
                      <td class="py-2 px-3 text-center font-semibold text-gray-700">
                        {{ mat.required }}{{ mat.unit }}
                      </td>
                      <td class="py-2 px-3 text-center">
                        <span v-if="mat.available > 0" class="text-gray-600">
                          {{ mat.available }}{{ mat.unit }}
                        </span>
                        <span v-else class="text-gray-400 italic">未登记</span>
                      </td>
                      <td class="py-2 pl-3 text-center font-semibold">
                        <span v-if="!mat.sufficient" class="text-red-600">
                          缺 {{ mat.gap }}{{ mat.unit }}
                        </span>
                        <span v-else class="text-green-600">—</span>
                      </td>
                      <td class="py-2 pl-3">
                        <span
                          v-if="!mat.sufficient"
                          class="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full"
                        >
                          <AlertTriangle class="w-3 h-3" />
                          不足
                        </span>
                        <span
                          v-else-if="mat.available === 0"
                          class="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full"
                        >
                          待确认
                        </span>
                        <span
                          v-else
                          class="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full"
                        >
                          <CheckCircle2 class="w-3 h-3" />
                          充足
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
