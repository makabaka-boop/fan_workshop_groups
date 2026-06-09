<script setup lang="ts">
import { computed } from 'vue';
import { AlertTriangle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-vue-next';
import type { Alert } from '../types';
import { ref } from 'vue';

interface Props {
  alerts: Alert[];
}

const props = defineProps<Props>();

const isExpanded = ref(true);

const errorAlerts = computed(() => props.alerts.filter(a => a.severity === 'error'));
const warningAlerts = computed(() => props.alerts.filter(a => a.severity === 'warning'));

const getAlertIcon = (type: string) => {
  const icons: Record<string, string> = {
    'high-difficulty': '📊',
    'material-shortage': '📦',
    'duplicate-demo': '📋',
    'time-exceeded': '⏰'
  };
  return icons[type] || '⚠️';
};
</script>

<template>
  <div v-if="alerts.length > 0" class="mb-6">
    <div
      class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg overflow-hidden"
    >
      <button
        @click="isExpanded = !isExpanded"
        class="w-full px-4 py-3 flex items-center justify-between hover:bg-amber-100/50 transition-colors"
      >
        <div class="flex items-center gap-3">
          <AlertTriangle class="w-5 h-5 text-amber-600" />
          <span class="font-semibold text-amber-800">
            发现 {{ alerts.length }} 个问题需要注意
          </span>
          <div class="flex gap-2">
            <span v-if="errorAlerts.length > 0" class="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
              {{ errorAlerts.length }} 个错误
            </span>
            <span v-if="warningAlerts.length > 0" class="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
              {{ warningAlerts.length }} 个警告
            </span>
          </div>
        </div>
        <ChevronUp v-if="isExpanded" class="w-5 h-5 text-amber-600" />
        <ChevronDown v-else class="w-5 h-5 text-amber-600" />
      </button>

      <div v-show="isExpanded" class="px-4 pb-4 space-y-2">
        <div
          v-for="alert in alerts"
          :key="alert.id"
          class="flex items-start gap-3 p-3 rounded-lg"
          :class="alert.severity === 'error' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'"
        >
          <span class="text-xl">{{ getAlertIcon(alert.type) }}</span>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <AlertCircle
                v-if="alert.severity === 'error'"
                class="w-4 h-4 text-red-500"
              />
              <AlertTriangle
                v-else
                class="w-4 h-4 text-yellow-500"
              />
              <span
                class="font-medium"
                :class="alert.severity === 'error' ? 'text-red-800' : 'text-yellow-800'"
              >
                {{ alert.message }}
              </span>
            </div>
            <p
              v-if="alert.details"
              class="mt-1 text-sm"
              :class="alert.severity === 'error' ? 'text-red-600' : 'text-yellow-600'"
            >
              {{ alert.details }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
