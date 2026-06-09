<script setup lang="ts">
import { ref, computed } from 'vue';
import { Users, Clock, Package, Plus, Trash2, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2 } from 'lucide-vue-next';
import type { Group, FanStyle } from '../types';
import { useMaterials, type GroupMaterialsSummary, type GlobalMaterialsSummary } from '../composables/useMaterials';

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

const groupsRef = computed(() => props.groups);
const stylesRef = computed(() => props.styles);
const { groupMaterials, globalSummary } = useMaterials(groupsRef, stylesRef);

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

const getGroupSummary = (groupId: string): GroupMaterialsSummary | undefined => {
  return groupMaterials.value.find(g => g.groupId === groupId);
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

const global = computed<GlobalMaterialsSummary>(() => globalSummary.value);
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

    <div
      v-if="groups.length > 0"
      class="mb-4 p-3 rounded-lg border"
      :class="global.shortageCount > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'"
    >
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="flex items-center gap-2">
          <AlertTriangle v-if="global.shortageCount > 0" class="w-5 h-5 text-red-500" />
          <CheckCircle2 v-else class="w-5 h-5 text-green-600" />
          <span class="font-medium" :class="global.shortageCount > 0 ? 'text-red-700' : 'text-green-700'">
            {{ global.shortageCount > 0
              ? `全场共 ${global.shortageCount} 种材料存在缺口，合计缺 ${global.totalShortage} 件`
              : '全场材料储备充足' }}
          </span>
        </div>
        <span class="text-xs text-gray-500">
          需求 {{ global.totalRequired }} · 可用 {{ global.totalAvailable }}
        </span>
      </div>
      <div v-if="global.shortageItems.length > 0" class="mt-2 flex flex-wrap gap-2">
        <span
          v-for="item in global.shortageItems"
          :key="`${item.name}-${item.unit}`"
          class="text-xs px-2 py-1 bg-white border border-red-200 text-red-700 rounded"
        >
          {{ item.name }} 缺 {{ item.shortage }}{{ item.unit }}
        </span>
      </div>
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
                  {{ getGroupSummary(group.id)?.materials.length ?? 0 }} 种材料
                </span>
                <span class="text-green-600 font-medium">
                  {{ group.styleIds.length }} 个样式
                </span>
                <span
                  v-if="(getGroupSummary(group.id)?.shortageCount ?? 0) > 0"
                  class="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium"
                >
                  <AlertTriangle class="w-3.5 h-3.5" />
                  缺 {{ getGroupSummary(group.id)?.shortageCount }} 种 / {{ getGroupSummary(group.id)?.totalShortage }} 件
                </span>
                <span
                  v-else-if="group.styleIds.length > 0"
                  class="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium"
                >
                  <CheckCircle2 class="w-3.5 h-3.5" />
                  材料齐备
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
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Package class="w-4 h-4 text-amber-600" />
                  分组材料清单预估
                </h4>
                <span class="text-xs text-gray-500">
                  按 {{ group.peopleCount }} 人需求估算
                </span>
              </div>
              <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                  <thead>
                    <tr class="bg-amber-50 text-amber-800">
                      <th class="text-left px-3 py-2 font-medium">材料</th>
                      <th class="text-right px-3 py-2 font-medium">需求</th>
                      <th class="text-right px-3 py-2 font-medium">可用</th>
                      <th class="text-right px-3 py-2 font-medium">缺口</th>
                      <th class="text-center px-3 py-2 font-medium">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="mat in getGroupSummary(group.id)?.materials ?? []"
                      :key="`${mat.name}-${mat.unit}`"
                      class="border-b border-gray-100"
                      :class="mat.shortage > 0 ? 'bg-red-50/40' : ''"
                    >
                      <td class="px-3 py-2 text-gray-800">{{ mat.name }}</td>
                      <td class="px-3 py-2 text-right text-gray-700">{{ mat.required }}{{ mat.unit }}</td>
                      <td class="px-3 py-2 text-right text-gray-700">{{ mat.available }}{{ mat.unit }}</td>
                      <td
                        class="px-3 py-2 text-right font-medium"
                        :class="mat.shortage > 0 ? 'text-red-600' : 'text-gray-400'"
                      >
                        {{ mat.shortage > 0 ? `-${mat.shortage}${mat.unit}` : '—' }}
                      </td>
                      <td class="px-3 py-2 text-center">
                        <span
                          v-if="mat.shortage > 0"
                          class="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded"
                        >
                          <AlertTriangle class="w-3 h-3" />
                          不足
                        </span>
                        <span
                          v-else
                          class="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded"
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
