<script setup lang="ts">
import { ref } from 'vue';
import { Palette, Users, Clock, Package, AlertTriangle, CheckCircle, ChevronUp, ChevronDown } from 'lucide-vue-next';
import type { Alert, GlobalMaterialSummary } from '../types';

interface Props {
  totalStyles: number;
  totalGroups: number;
  totalPeople: number;
  totalDuration: number;
  assignedDuration: number;
  totalMaterials: number;
  alerts: Alert[];
  globalMaterialSummary?: GlobalMaterialSummary[];
  totalShortageKinds?: number;
}

const props = defineProps<Props>();

const showMaterialDetail = ref(false);

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}小时${mins > 0 ? mins + '分' : ''}`;
  }
  return `${mins}分钟`;
};

const errorCount = () => props.alerts.filter(a => a.severity === 'error').length;
const warningCount = () => props.alerts.filter(a => a.severity === 'warning').length;

const shortageMaterials = () => props.globalMaterialSummary?.filter(m => !m.sufficient) ?? [];
</script>

<template>
  <div class="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg z-50">
    <div
      v-if="showMaterialDetail && shortageMaterials().length > 0"
      class="border-t border-gray-700 bg-gray-800/95 max-h-48 overflow-y-auto"
    >
      <div class="max-w-6xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-red-400 flex items-center gap-1">
            <AlertTriangle class="w-4 h-4" />
            全场材料缺口概览
          </span>
          <button
            @click="showMaterialDetail = false"
            class="text-xs text-gray-400 hover:text-gray-200"
          >
            收起
          </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <div
            v-for="mat in shortageMaterials()"
            :key="`${mat.name}-${mat.unit}`"
            class="flex items-center justify-between bg-gray-700/60 rounded px-3 py-1.5 text-sm"
          >
            <div>
              <span class="font-medium text-white">{{ mat.name }}</span>
              <span class="text-gray-400 text-xs ml-2">涉及 {{ mat.affectedGroups.join('、') }}</span>
            </div>
            <div class="text-right">
              <span class="text-gray-300">{{ mat.totalRequired }}{{ mat.unit }}</span>
              <span class="text-gray-500 mx-1">/</span>
              <span class="text-gray-400">{{ mat.globalAvailable }}{{ mat.unit }}</span>
              <span class="text-red-400 ml-2 font-semibold">缺{{ mat.totalGap }}{{ mat.unit }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-6 flex-wrap">
          <div class="flex items-center gap-2">
            <Palette class="w-5 h-5 text-green-400" />
            <span class="text-sm">
              <span class="font-semibold text-lg">{{ totalStyles }}</span>
              <span class="text-gray-400 ml-1">个样式</span>
            </span>
          </div>

          <div class="flex items-center gap-2">
            <Users class="w-5 h-5 text-blue-400" />
            <span class="text-sm">
              <span class="font-semibold text-lg">{{ totalGroups }}</span>
              <span class="text-gray-400 ml-1">个小组</span>
              <span class="text-gray-500 mx-2">·</span>
              <span class="font-semibold">{{ totalPeople }}</span>
              <span class="text-gray-400 ml-1">人</span>
            </span>
          </div>

          <div class="flex items-center gap-2">
            <Clock class="w-5 h-5 text-amber-400" />
            <span class="text-sm">
              <span class="font-semibold" :class="assignedDuration > totalDuration ? 'text-red-400' : 'text-amber-300'">
                {{ formatDuration(assignedDuration) }}
              </span>
              <span class="text-gray-500 mx-1">/</span>
              <span class="text-gray-400">{{ formatDuration(totalDuration) }}</span>
            </span>
          </div>

          <div class="flex items-center gap-2">
            <Package class="w-5 h-5 text-purple-400" />
            <span class="text-sm">
              <span class="font-semibold text-lg">{{ totalMaterials }}</span>
              <span class="text-gray-400 ml-1">种材料</span>
            </span>
            <button
              v-if="totalShortageKinds && totalShortageKinds > 0"
              @click="showMaterialDetail = !showMaterialDetail"
              class="flex items-center gap-1 ml-1 text-xs text-red-400 hover:text-red-300 bg-red-500/20 px-2 py-0.5 rounded-full transition-colors"
            >
              <AlertTriangle class="w-3 h-3" />
              {{ totalShortageKinds }} 项缺口
              <ChevronUp v-if="showMaterialDetail" class="w-3 h-3" />
              <ChevronDown v-else class="w-3 h-3" />
            </button>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div v-if="errorCount() > 0 || warningCount() > 0" class="flex items-center gap-2">
            <AlertTriangle class="w-5 h-5 text-amber-400" />
            <span class="text-sm">
              <span class="text-red-400 font-semibold">{{ errorCount() }}</span>
              <span class="text-gray-400">个错误</span>
              <span class="text-gray-500 mx-1">·</span>
              <span class="text-amber-400 font-semibold">{{ warningCount() }}</span>
              <span class="text-gray-400">个警告</span>
            </span>
          </div>
          <div v-else class="flex items-center gap-2 text-green-400">
            <CheckCircle class="w-5 h-5" />
            <span class="text-sm font-medium">一切正常</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
