<script setup lang="ts">
import { ref } from 'vue';
import { Palette, Users, Clock, Package, AlertTriangle, CheckCircle, HelpCircle, ChevronUp, ChevronDown } from 'lucide-vue-next';
import type { Alert, OverallMaterialItem } from '../types';

interface Props {
  totalStyles: number;
  totalGroups: number;
  totalPeople: number;
  totalDuration: number;
  assignedDuration: number;
  totalMaterials: number;
  alerts: Alert[];
  overallMaterialShortage: OverallMaterialItem[];
  totalShortageCount: number;
  totalNoDataCount: number;
}

const props = defineProps<Props>();

const showShortageDetail = ref(false);

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}小时${mins > 0 ? mins + '分' : ''}`;
  }
  return `${mins}分钟`;
};
</script>

<template>
  <div class="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg z-50">
    <div class="max-w-6xl mx-auto px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-6">
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
          </div>
        </div>

        <div class="flex items-center gap-4">
          <button
            v-if="overallMaterialShortage.length > 0"
            @click="showShortageDetail = !showShortageDetail"
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
            :class="totalShortageCount > 0 ? 'bg-red-900/50 hover:bg-red-900/70' : 'bg-gray-700/50 hover:bg-gray-700/70'"
          >
            <Package class="w-4 h-4" :class="totalShortageCount > 0 ? 'text-red-400' : 'text-green-400'" />
            <span class="text-sm">
              <span v-if="totalShortageCount > 0" class="text-red-400 font-semibold">{{ totalShortageCount }}</span>
              <span v-else class="text-green-400 font-semibold">0</span>
              <span class="text-gray-400 ml-1">项缺口</span>
              <span v-if="totalNoDataCount > 0" class="text-gray-500 mx-1">·</span>
              <span v-if="totalNoDataCount > 0" class="text-gray-400">{{ totalNoDataCount }}项无数据</span>
            </span>
            <ChevronUp v-if="showShortageDetail" class="w-3.5 h-3.5 text-gray-400" />
            <ChevronDown v-else class="w-3.5 h-3.5 text-gray-400" />
          </button>

          <div class="flex items-center gap-2">
            <div v-if="alerts.length > 0" class="flex items-center gap-2">
              <AlertTriangle class="w-5 h-5 text-amber-400" />
              <span class="text-sm">
                <span class="text-red-400 font-semibold">
                  {{ alerts.filter(a => a.severity === 'error').length }}
                </span>
                <span class="text-gray-400">个错误</span>
                <span class="text-gray-500 mx-1">·</span>
                <span class="text-amber-400 font-semibold">
                  {{ alerts.filter(a => a.severity === 'warning').length }}
                </span>
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

      <div v-if="showShortageDetail && overallMaterialShortage.length > 0" class="mt-3 pt-3 border-t border-gray-700">
        <h4 class="text-xs font-medium text-gray-400 mb-2">全场材料缺口概览</h4>
        <div class="max-h-48 overflow-y-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-gray-500 text-xs">
                <th class="text-left py-1 pr-2 font-medium">材料</th>
                <th class="text-right py-1 px-2 font-medium">总需求</th>
                <th class="text-right py-1 px-2 font-medium">库存</th>
                <th class="text-right py-1 px-2 font-medium">缺口</th>
                <th class="text-left py-1 pl-2 font-medium">各组需求</th>
                <th class="text-center py-1 pl-2 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="mat in overallMaterialShortage"
                :key="`${mat.name}-${mat.unit}`"
                class="border-t border-gray-700/50"
                :class="mat.isShortage ? 'bg-red-900/20' : ''"
              >
                <td class="py-1.5 pr-2">
                  <span class="font-medium" :class="mat.isShortage ? 'text-red-300' : 'text-gray-200'">{{ mat.name }}</span>
                  <span class="text-gray-500 text-xs ml-1">({{ mat.unit }})</span>
                </td>
                <td class="text-right py-1.5 px-2 text-gray-200">{{ mat.totalRequired }}</td>
                <td class="text-right py-1.5 px-2" :class="mat.noStockData ? 'text-gray-600' : 'text-gray-300'">
                  {{ mat.noStockData ? '-' : mat.available }}
                </td>
                <td class="text-right py-1.5 px-2 font-medium" :class="mat.isShortage ? 'text-red-400' : 'text-green-400'">
                  {{ mat.isShortage ? `-${mat.shortage}` : '0' }}
                </td>
                <td class="py-1.5 pl-2 text-xs text-gray-400">
                  <span v-for="(bg, idx) in mat.groupBreakdown" :key="bg.groupName">
                    {{ bg.groupName }}:{{ bg.required }}{{ mat.unit }}<span v-if="idx < mat.groupBreakdown.length - 1">、</span>
                  </span>
                </td>
                <td class="text-center py-1.5 pl-2">
                  <AlertTriangle v-if="mat.isShortage" class="w-3.5 h-3.5 text-red-400 inline" />
                  <CheckCircle v-else-if="!mat.noStockData" class="w-3.5 h-3.5 text-green-400 inline" />
                  <HelpCircle v-else class="w-3.5 h-3.5 text-gray-600 inline" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
