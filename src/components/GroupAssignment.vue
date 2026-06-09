<script setup lang="ts">
import { ref, computed } from 'vue';
import { Users, Clock, Package, Plus, Trash2, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-vue-next';
import type { Group, FanStyle, GroupMaterialSummary, GroupMaterialItem } from '../types';

interface Props {
  groups: Group[];
  styles: FanStyle[];
  unassignedStyles: FanStyle[];
  groupMaterialSummaries: GroupMaterialSummary[];
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

const expandedGroups = ref<Set<string>>(new Set());
const expandedMaterials = ref<Set<string>>(new Set());

const toggleGroup = (groupId: string) => {
  if (expandedGroups.value.has(groupId)) {
    expandedGroups.value.delete(groupId);
  } else {
    expandedGroups.value.add(groupId);
  }
};

const toggleMaterials = (groupId: string) => {
  if (expandedMaterials.value.has(groupId)) {
    expandedMaterials.value.delete(groupId);
  } else {
    expandedMaterials.value.add(groupId);
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

const getGroupMaterialSummary = (groupId: string): GroupMaterialSummary | undefined => {
  return props.groupMaterialSummaries.find(s => s.groupId === groupId);
};

const getShortageBadge = (summary: GroupMaterialSummary) => {
  if (summary.shortageCount > 0) {
    return { text: `${summary.shortageCount}项缺口`, class: 'bg-red-100 text-red-700' };
  }
  const noDataCount = summary.materials.filter(m => m.noStockData).length;
  if (noDataCount > 0) {
    return { text: `${noDataCount}项无库存数据`, class: 'bg-gray-100 text-gray-600' };
  }
  return { text: '库存充足', class: 'bg-green-100 text-green-700' };
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
                  {{ getGroupMaterialSummary(group.id)?.materials.length ?? 0 }} 种材料
                </span>
                <span class="text-green-600 font-medium">
                  {{ group.styleIds.length }} 个样式
                </span>
                <span
                  v-if="getGroupMaterialSummary(group.id)"
                  :class="getShortageBadge(getGroupMaterialSummary(group.id)!).class"
                  class="px-2 py-0.5 rounded-full text-xs font-medium"
                >
                  {{ getShortageBadge(getGroupMaterialSummary(group.id)!).text }}
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
                <h4 class="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Package class="w-4 h-4" />
                  材料清单预估
                </h4>
                <button
                  @click="toggleMaterials(group.id)"
                  class="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <ChevronUp v-if="expandedMaterials.has(group.id)" class="w-3.5 h-3.5" />
                  <ChevronDown v-else class="w-3.5 h-3.5" />
                  {{ expandedMaterials.has(group.id) ? '收起明细' : '展开明细' }}
                </button>
              </div>

              <div v-if="getGroupMaterialSummary(group.id)" class="space-y-2">
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead>
                      <tr class="border-b border-gray-200 text-gray-500">
                        <th class="text-left py-1.5 pr-2 font-medium">材料</th>
                        <th class="text-right py-1.5 px-2 font-medium">需求量</th>
                        <th class="text-right py-1.5 px-2 font-medium">库存</th>
                        <th class="text-right py-1.5 px-2 font-medium">缺口</th>
                        <th class="text-center py-1.5 pl-2 font-medium">状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="mat in getGroupMaterialSummary(group.id)!.materials"
                        :key="`${mat.name}-${mat.unit}`"
                        class="border-b border-gray-100 last:border-0"
                        :class="mat.isShortage ? 'bg-red-50/50' : ''"
                      >
                        <td class="py-1.5 pr-2">
                          <span class="font-medium" :class="mat.isShortage ? 'text-red-800' : 'text-gray-800'">{{ mat.name }}</span>
                          <span class="text-gray-400 text-xs ml-1">({{ mat.unit }})</span>
                        </td>
                        <td class="text-right py-1.5 px-2 font-medium text-gray-800">{{ mat.required }}</td>
                        <td class="text-right py-1.5 px-2" :class="mat.noStockData ? 'text-gray-300' : 'text-gray-600'">
                          {{ mat.noStockData ? '-' : mat.available }}
                        </td>
                        <td class="text-right py-1.5 px-2 font-medium" :class="mat.isShortage ? 'text-red-600' : 'text-green-600'">
                          {{ mat.isShortage ? `-${mat.shortage}` : '0' }}
                        </td>
                        <td class="text-center py-1.5 pl-2">
                          <AlertTriangle v-if="mat.isShortage" class="w-4 h-4 text-red-500 inline" />
                          <CheckCircle v-else-if="!mat.noStockData" class="w-4 h-4 text-green-500 inline" />
                          <HelpCircle v-else class="w-4 h-4 text-gray-300 inline" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div v-if="expandedMaterials.has(group.id)" class="mt-2 p-3 bg-gray-50 rounded-lg">
                  <h5 class="text-xs font-medium text-gray-500 mb-2">各样式材料明细（按人数缩放）</h5>
                  <div class="space-y-2">
                    <div
                      v-for="mat in getGroupMaterialSummary(group.id)!.materials"
                      :key="`detail-${mat.name}-${mat.unit}`"
                      class="text-xs"
                    >
                      <div class="font-medium text-gray-700 mb-1">{{ mat.name }}（{{ mat.unit }}）</div>
                      <div class="pl-3 space-y-0.5">
                        <div
                          v-for="detail in mat.details"
                          :key="detail.styleName"
                          class="flex items-center justify-between text-gray-500"
                        >
                          <span>{{ detail.styleName }}</span>
                          <span>基础 {{ detail.baseQuantity }} → 缩放后 {{ detail.scaledQuantity }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  v-if="getGroupMaterialSummary(group.id)!.shortageCount > 0"
                  class="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700"
                >
                  <AlertTriangle class="w-4 h-4 flex-shrink-0" />
                  <span>该组有 {{ getGroupMaterialSummary(group.id)!.shortageCount }} 项材料存在缺口，请及时补充</span>
                </div>
                <div
                  v-else-if="getGroupMaterialSummary(group.id)!.materials.some(m => m.noStockData)"
                  class="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2 text-sm text-gray-500"
                >
                  <HelpCircle class="w-4 h-4 flex-shrink-0" />
                  <span>部分材料暂无库存数据，建议补充后确认</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
