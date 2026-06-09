<script setup lang="ts">
import { Filter, X } from 'lucide-vue-next';
import type { DifficultyLevel, StyleStatus } from '../types';

interface Props {
  difficulty?: DifficultyLevel;
  status?: StyleStatus;
  materialKeyword?: string;
  minPeople?: number;
  maxPeople?: number;
  hasActiveFilters: boolean;
}

interface Emits {
  (e: 'update:difficulty', value?: DifficultyLevel): void;
  (e: 'update:status', value?: StyleStatus): void;
  (e: 'update:materialKeyword', value: string): void;
  (e: 'update:minPeople', value?: number): void;
  (e: 'update:maxPeople', value?: number): void;
  (e: 'clear'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const difficultyOptions: { value: DifficultyLevel | ''; label: string }[] = [
  { value: '', label: '全部难度' },
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' },
  { value: 'expert', label: '专家' }
];

const statusOptions: { value: StyleStatus | ''; label: string }[] = [
  { value: '', label: '全部状态' },
  { value: 'beginner', label: '适合新手' },
  { value: 'demo-required', label: '需提前示范' },
  { value: 'insufficient-material', label: '材料不足' },
  { value: 'display-only', label: '改为展示' }
];
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-4 mb-6">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <Filter class="w-5 h-5 text-green-600" />
        <h3 class="font-semibold text-gray-700">筛选条件</h3>
      </div>
      <button
        v-if="hasActiveFilters"
        @click="emit('clear')"
        class="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
      >
        <X class="w-4 h-4" />
        清除筛选
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div>
        <label class="block text-sm text-gray-600 mb-1">难度等级</label>
        <select
          :value="difficulty || ''"
          @change="emit('update:difficulty', ($event.target as HTMLSelectElement).value as DifficultyLevel || undefined)"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
        >
          <option v-for="opt in difficultyOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm text-gray-600 mb-1">状态</label>
        <select
          :value="status || ''"
          @change="emit('update:status', ($event.target as HTMLSelectElement).value as StyleStatus || undefined)"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
        >
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm text-gray-600 mb-1">材料关键词</label>
        <input
          type="text"
          :value="materialKeyword"
          @input="emit('update:materialKeyword', ($event.target as HTMLInputElement).value)"
          placeholder="搜索材料..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
        />
      </div>

      <div>
        <label class="block text-sm text-gray-600 mb-1">最少人数</label>
        <input
          type="number"
          :value="minPeople"
          @input="emit('update:minPeople', Number(($event.target as HTMLInputElement).value) || undefined)"
          placeholder="0"
          min="0"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
        />
      </div>

      <div>
        <label class="block text-sm text-gray-600 mb-1">最多人数</label>
        <input
          type="number"
          :value="maxPeople"
          @input="emit('update:maxPeople', Number(($event.target as HTMLInputElement).value) || undefined)"
          placeholder="不限"
          min="0"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
        />
      </div>
    </div>
  </div>
</template>
