<script setup lang="ts">
import { Plus } from 'lucide-vue-next';
import type { FanStyle, DifficultyLevel, StyleStatus, MaterialItem, FAQ, Group } from '../types';
import StyleCard from './StyleCard.vue';

interface Props {
  styles: FanStyle[];
  groups: Group[];
  isStyleAssigned: (styleId: string) => boolean;
  getStyleGroup: (styleId: string) => Group | undefined;
}

interface Emits {
  (e: 'addStyle'): void;
  (e: 'updateStyle', id: string, updates: Partial<FanStyle>): void;
  (e: 'deleteStyle', id: string): void;
  (e: 'assignStyle', styleId: string, groupId: string): void;
  (e: 'unassignStyle', styleId: string): void;
  (e: 'copyStyle', id: string): void;
  (e: 'quickEditStyle', id: string, updates: Partial<FanStyle>): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const createNewStyle = () => {
  emit('addStyle');
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-800">团扇样式列表</h2>
      <button
        @click="createNewStyle"
        class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <Plus class="w-5 h-5" />
        添加样式
      </button>
    </div>

    <div v-if="styles.length === 0" class="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
      <p class="text-gray-500 mb-4">暂无样式，点击上方按钮添加</p>
    </div>

    <div v-else class="space-y-4">
      <StyleCard
        v-for="style in styles"
        :key="style.id"
        :style="style"
        :groups="groups"
        :is-assigned="isStyleAssigned(style.id)"
        :assigned-group="getStyleGroup(style.id)?.name"
        @update="(updates) => emit('updateStyle', style.id, updates)"
        @delete="() => emit('deleteStyle', style.id)"
        @assign="(groupId) => emit('assignStyle', style.id, groupId)"
        @unassign="() => emit('unassignStyle', style.id)"
        @copy="() => emit('copyStyle', style.id)"
        @quick-edit="(updates) => emit('quickEditStyle', style.id, updates)"
      />
    </div>
  </div>
</template>
