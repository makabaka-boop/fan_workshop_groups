<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Users,
  Package,
  Lightbulb,
  HelpCircle,
  Shield,
  Trash2,
  Plus,
  Minus,
  X,
  Copy,
  Sparkles,
  Edit3
} from 'lucide-vue-next';
import type { FanStyle, DifficultyLevel, StyleStatus, MaterialItem, FAQ, Group } from '../types';

interface Props {
  style: FanStyle;
  isAssigned?: boolean;
  assignedGroup?: string;
  groups: Group[];
}

interface Emits {
  (e: 'update', updates: Partial<FanStyle>): void;
  (e: 'delete'): void;
  (e: 'assign', groupId: string): void;
  (e: 'unassign'): void;
  (e: 'copy'): void;
  (e: 'quickEdit', updates: Partial<FanStyle>): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const showGroupSelector = ref(false);
const showQuickEdit = ref(false);
const selectedGroupId = ref<string | null>(null);

const quickEditForm = ref({
  name: '',
  status: 'beginner' as StyleStatus,
  difficulty: 'easy' as DifficultyLevel,
  suitablePeople: 5,
  duration: 30,
  demoPoints: '',
  backupPlan: ''
});

const openQuickEdit = () => {
  quickEditForm.value = {
    name: props.style.name,
    status: props.style.status,
    difficulty: props.style.difficulty,
    suitablePeople: props.style.suitablePeople,
    duration: props.style.duration,
    demoPoints: props.style.demoPoints,
    backupPlan: props.style.backupPlan
  };
  showQuickEdit.value = true;
};

const confirmQuickEdit = () => {
  emit('quickEdit', {
    name: quickEditForm.value.name,
    status: quickEditForm.value.status,
    difficulty: quickEditForm.value.difficulty,
    suitablePeople: quickEditForm.value.suitablePeople,
    duration: quickEditForm.value.duration,
    demoPoints: quickEditForm.value.demoPoints,
    backupPlan: quickEditForm.value.backupPlan
  });
  showQuickEdit.value = false;
};

const cancelQuickEdit = () => {
  showQuickEdit.value = false;
};

const isRecentlyModified = computed(() => {
  const oneDay = 24 * 60 * 60 * 1000;
  const hasBeenEdited = props.style.updatedAt - props.style.createdAt > 1000;
  if (hasBeenEdited) {
    return Date.now() - props.style.updatedAt < oneDay;
  }
  return false;
});

const isRecentlyCreated = computed(() => {
  const oneDay = 24 * 60 * 60 * 1000;
  if (isRecentlyModified.value) return false;
  return Date.now() - props.style.createdAt < oneDay;
});

const availableGroups = computed(() => {
  return props.groups;
});

const openGroupSelector = () => {
  if (props.groups.length === 0) {
    alert('请先创建小组后再分配样式');
    return;
  }
  showGroupSelector.value = true;
  selectedGroupId.value = null;
};

const confirmAssign = () => {
  if (selectedGroupId.value) {
    emit('assign', selectedGroupId.value);
    showGroupSelector.value = false;
    selectedGroupId.value = null;
  }
};

const cancelAssign = () => {
  showGroupSelector.value = false;
  selectedGroupId.value = null;
};

const isExpanded = ref(false);

const difficultyLabels: Record<DifficultyLevel, { label: string; color: string }> = {
  easy: { label: '简单', color: 'bg-green-100 text-green-700' },
  medium: { label: '中等', color: 'bg-blue-100 text-blue-700' },
  hard: { label: '困难', color: 'bg-orange-100 text-orange-700' },
  expert: { label: '专家', color: 'bg-red-100 text-red-700' }
};

const statusLabels: Record<StyleStatus, { label: string; color: string }> = {
  beginner: { label: '适合新手', color: 'bg-emerald-100 text-emerald-700' },
  'demo-required': { label: '需提前示范', color: 'bg-purple-100 text-purple-700' },
  'insufficient-material': { label: '材料不足', color: 'bg-rose-100 text-rose-700' },
  'display-only': { label: '改为展示', color: 'bg-slate-100 text-slate-700' }
};

const updateField = (field: keyof FanStyle, value: any) => {
  emit('update', { [field]: value });
};

const addMaterial = () => {
  const newMaterial: MaterialItem = {
    id: Date.now().toString(),
    name: '',
    quantity: 1,
    unit: '个'
  };
  emit('update', { materials: [...props.style.materials, newMaterial] });
};

const updateMaterial = (index: number, field: keyof MaterialItem, value: any) => {
  const newMaterials = [...props.style.materials];
  newMaterials[index] = { ...newMaterials[index], [field]: value };
  emit('update', { materials: newMaterials });
};

const removeMaterial = (index: number) => {
  const newMaterials = props.style.materials.filter((_, i) => i !== index);
  emit('update', { materials: newMaterials });
};

const addFAQ = () => {
  const newFAQ: FAQ = {
    id: Date.now().toString(),
    question: '',
    answer: ''
  };
  emit('update', { faqs: [...props.style.faqs, newFAQ] });
};

const updateFAQ = (index: number, field: keyof FAQ, value: string) => {
  const newFAQs = [...props.style.faqs];
  newFAQs[index] = { ...newFAQs[index], [field]: value };
  emit('update', { faqs: newFAQs });
};

const removeFAQ = (index: number) => {
  const newFAQs = props.style.faqs.filter((_, i) => i !== index);
  emit('update', { faqs: newFAQs });
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
    <button
      @click="isExpanded = !isExpanded"
      class="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
    >
      <div class="flex items-center gap-4 flex-1">
        <div class="flex-1">
          <div class="flex items-center gap-3 flex-wrap">
            <h3 class="font-semibold text-gray-800 text-left">{{ style.name }}</h3>
            <span
              v-if="isRecentlyCreated"
              class="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-amber-400 to-orange-400 text-white"
            >
              <Sparkles class="w-3 h-3" />
              最近新增
            </span>
            <span
              v-else-if="isRecentlyModified"
              class="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-400 to-cyan-400 text-white"
            >
              <Edit3 class="w-3 h-3" />
              最近修改
            </span>
            <span
              class="px-2 py-0.5 rounded-full text-xs font-medium"
              :class="difficultyLabels[style.difficulty].color"
            >
              {{ difficultyLabels[style.difficulty].label }}
            </span>
            <span
              class="px-2 py-0.5 rounded-full text-xs font-medium"
              :class="statusLabels[style.status].color"
            >
              {{ statusLabels[style.status].label }}
            </span>
          </div>
          <div class="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span class="flex items-center gap-1">
              <Clock class="w-4 h-4" />
              {{ style.duration }} 分钟
            </span>
            <span class="flex items-center gap-1">
              <Users class="w-4 h-4" />
              适合 {{ style.suitablePeople }} 人
            </span>
            <span class="flex items-center gap-1">
              <Package class="w-4 h-4" />
              {{ style.materials.length }} 种材料
            </span>
            <span v-if="isAssigned" class="text-green-600 font-medium">
              已分配到 {{ assignedGroup }}
            </span>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click.stop="emit('copy')"
          class="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
          title="复制样式"
        >
          <Copy class="w-4 h-4" />
        </button>
        <button
          @click.stop="openQuickEdit"
          class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          title="快速编辑"
        >
          <Edit3 class="w-4 h-4" />
        </button>
        <button
          v-if="isAssigned"
          @click.stop="emit('unassign')"
          class="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
        >
          取消分配
        </button>
        <button
          v-else
          @click.stop="openGroupSelector"
          class="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
        >
          分配到组
        </button>
        <button
          @click.stop="emit('delete')"
          class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
        >
          <Trash2 class="w-4 h-4" />
        </button>
        <ChevronUp v-if="isExpanded" class="w-5 h-5 text-gray-400" />
        <ChevronDown v-else class="w-5 h-5 text-gray-400" />
      </div>
    </button>

    <div v-show="isExpanded" class="px-4 pb-4 border-t border-gray-100">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">样式名称</label>
          <input
            :value="style.name"
            @input="updateField('name', ($event.target as HTMLInputElement).value)"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          />
        </div>

        <div class="grid grid-cols-3 gap-2">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">难度</label>
            <select
              :value="style.difficulty"
              @change="updateField('difficulty', ($event.target as HTMLSelectElement).value as DifficultyLevel)"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            >
              <option v-for="(opt, key) in difficultyLabels" :key="key" :value="key">
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">适合人数</label>
            <input
              type="number"
              :value="style.suitablePeople"
              @input="updateField('suitablePeople', Number(($event.target as HTMLInputElement).value))"
              min="1"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">时长(分钟)</label>
            <input
              type="number"
              :value="style.duration"
              @input="updateField('duration', Number(($event.target as HTMLInputElement).value))"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div class="mt-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
        <select
          :value="style.status"
          @change="updateField('status', ($event.target as HTMLSelectElement).value as StyleStatus)"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
        >
          <option v-for="(opt, key) in statusLabels" :key="key" :value="key">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="mt-4">
        <div class="flex items-center justify-between mb-2">
          <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Package class="w-4 h-4" />
            材料清单
          </label>
          <button
            @click="addMaterial"
            class="flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
          >
            <Plus class="w-4 h-4" />
            添加材料
          </button>
        </div>
        <div class="space-y-2">
          <div
            v-for="(material, index) in style.materials"
            :key="material.id"
            class="flex items-center gap-2"
          >
            <input
              :value="material.name"
              @input="updateMaterial(index, 'name', ($event.target as HTMLInputElement).value)"
              type="text"
              placeholder="材料名称"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
            <div class="flex items-center gap-1">
              <input
                :value="material.quantity"
                @input="updateMaterial(index, 'quantity', Number(($event.target as HTMLInputElement).value))"
                type="number"
                min="0"
                placeholder="需"
                class="w-16 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-center"
              />
              <span class="text-gray-400 text-xs">/</span>
              <input
                :value="material.available ?? ''"
                @input="updateMaterial(index, 'available', ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : undefined)"
                type="number"
                min="0"
                placeholder="存"
                class="w-16 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-center"
                :class="{
                  'border-red-300 bg-red-50': material.available !== undefined && material.quantity > material.available,
                  'border-green-300 bg-green-50': material.available !== undefined && material.quantity <= material.available
                }"
              />
            </div>
            <input
              :value="material.unit"
              @input="updateMaterial(index, 'unit', ($event.target as HTMLInputElement).value)"
              type="text"
              placeholder="单位"
              class="w-14 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
            <button
              @click="removeMaterial(index)"
              class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
            >
              <Minus class="w-4 h-4" />
            </button>
          </div>
          <div class="text-xs text-gray-500 flex items-center gap-2">
            <span class="inline-block w-2 h-2 bg-red-400 rounded-full"></span>
            需求/库存，红色表示库存不足
          </div>
        </div>
      </div>

      <div class="mt-4">
        <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Lightbulb class="w-4 h-4" />
          示范要点
        </label>
        <textarea
          :value="style.demoPoints"
          @input="updateField('demoPoints', ($event.target as HTMLTextAreaElement).value)"
          rows="3"
          placeholder="每行一个示范要点..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
        />
      </div>

      <div class="mt-4">
        <div class="flex items-center justify-between mb-2">
          <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
            <HelpCircle class="w-4 h-4" />
            常见问题
          </label>
          <button
            @click="addFAQ"
            class="flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
          >
            <Plus class="w-4 h-4" />
            添加问题
          </button>
        </div>
        <div class="space-y-2">
          <div
            v-for="(faq, index) in style.faqs"
            :key="faq.id"
            class="p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-start gap-2">
              <div class="flex-1 space-y-2">
                <input
                  :value="faq.question"
                  @input="updateFAQ(index, 'question', ($event.target as HTMLInputElement).value)"
                  type="text"
                  placeholder="问题"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
                <textarea
                  :value="faq.answer"
                  @input="updateFAQ(index, 'answer', ($event.target as HTMLTextAreaElement).value)"
                  rows="2"
                  placeholder="解答"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                />
              </div>
              <button
                @click="removeFAQ(index)"
                class="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Minus class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Shield class="w-4 h-4" />
          备用方案
        </label>
        <textarea
          :value="style.backupPlan"
          @input="updateField('backupPlan', ($event.target as HTMLTextAreaElement).value)"
          rows="2"
          placeholder="描述备用方案..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
        />
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showGroupSelector"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="cancelAssign"
      >
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden animate-bounce-in">
          <div class="px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white flex items-center justify-between">
            <h3 class="font-semibold">选择目标小组</h3>
            <button
              @click="cancelAssign"
              class="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
          <div class="p-4">
            <p class="text-sm text-gray-600 mb-4">
              将「{{ style.name }}」分配到以下小组：
            </p>
            <div class="space-y-2 max-h-64 overflow-y-auto">
              <label
                v-for="group in availableGroups"
                :key="group.id"
                class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-green-50 transition-colors"
                :class="selectedGroupId === group.id ? 'border-green-500 bg-green-50' : 'border-gray-200'"
              >
                <input
                  type="radio"
                  :value="group.id"
                  v-model="selectedGroupId"
                  class="text-green-600 focus:ring-green-500"
                />
                <div class="flex-1">
                  <div class="font-medium text-gray-800">{{ group.name }}</div>
                  <div class="text-sm text-gray-500">{{ group.peopleCount }} 人 · {{ group.styleIds.length }} 个样式</div>
                </div>
              </label>
            </div>
            <div class="flex gap-2 mt-4">
              <button
                @click="cancelAssign"
                class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                @click="confirmAssign"
                :disabled="!selectedGroupId"
                class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                确认分配
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="showQuickEdit"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="cancelQuickEdit"
      >
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden animate-bounce-in">
          <div class="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white flex items-center justify-between">
            <h3 class="font-semibold">快速编辑</h3>
            <button
              @click="cancelQuickEdit"
              class="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
          <div class="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">样式名称</label>
              <input
                v-model="quickEditForm.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="输入样式名称"
              />
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">难度级别</label>
                <select
                  v-model="quickEditForm.difficulty"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option v-for="(opt, key) in difficultyLabels" :key="key" :value="key">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">适合人数</label>
                <input
                  v-model.number="quickEditForm.suitablePeople"
                  type="number"
                  min="1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">时长(分钟)</label>
                <input
                  v-model.number="quickEditForm.duration"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select
                v-model="quickEditForm.status"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option v-for="(opt, key) in statusLabels" :key="key" :value="key">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">示范要点</label>
              <textarea
                v-model="quickEditForm.demoPoints"
                rows="3"
                placeholder="每行一个示范要点..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">备用方案</label>
              <textarea
                v-model="quickEditForm.backupPlan"
                rows="2"
                placeholder="描述备用方案..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              />
            </div>
            <div class="flex gap-2 pt-2 sticky bottom-0 bg-white">
              <button
                @click="cancelQuickEdit"
                class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                @click="confirmQuickEdit"
                :disabled="!quickEditForm.name.trim()"
                class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                确认修改
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.animate-bounce-in {
  animation: bounceIn 0.3s ease-out;
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
