<script setup lang="ts">
import { computed, ref } from 'vue';
import { useActivity } from '../composables/useActivity';
import { useStyles } from '../composables/useStyles';
import { useGroups } from '../composables/useGroups';
import { useFilter } from '../composables/useFilter';
import { useAlerts } from '../composables/useAlerts';
import { useGroupMaterials } from '../composables/useGroupMaterials';
import type { FanStyle, DifficultyLevel, StyleStatus } from '../types';

import ActivityHeader from '../components/ActivityHeader.vue';
import StyleFilter from '../components/StyleFilter.vue';
import AlertPanel from '../components/AlertPanel.vue';
import StyleAccordion from '../components/StyleAccordion.vue';
import GroupAssignment from '../components/GroupAssignment.vue';
import SummaryBar from '../components/SummaryBar.vue';

const { activity } = useActivity();
const { styles, addStyle, copyStyle, updateStyle, deleteStyle } = useStyles();
const {
  groups,
  addGroup,
  updateGroup,
  deleteGroup,
  assignStyleToGroup,
  removeStyleFromGroup,
  getStyleGroup,
  isStyleAssigned,
  totalPeopleInGroups,
  getAssignedStyleIds
} = useGroups();

const {
  filterCriteria,
  filteredStyles,
  hasActiveFilters,
  setDifficultyFilter,
  setMaterialKeywordFilter,
  setPeopleRangeFilter,
  setStatusFilter,
  clearFilters
} = useFilter(styles);

const { alerts } = useAlerts(styles.value, groups.value, activity.value);

const {
  groupMaterialSummaries,
  overallMaterialShortage,
  totalShortageCount,
  totalNoDataCount
} = useGroupMaterials();

const activeTab = ref<'styles' | 'groups'>('styles');

const unassignedStyles = computed(() => {
  return styles.value.filter(s => !getAssignedStyleIds.value.includes(s.id));
});

const assignedDuration = computed(() => {
  const assignedIds = new Set(getAssignedStyleIds.value);
  return styles.value
    .filter(s => assignedIds.has(s.id))
    .reduce((sum, s) => sum + s.duration, 0);
});

const totalMaterials = computed(() => {
  const materialNames = new Set<string>();
  styles.value.forEach(style => {
    style.materials.forEach(m => materialNames.add(m.name));
  });
  return materialNames.size;
});

const handleAddStyle = () => {
  const newStyle = {
    name: '新样式',
    difficulty: 'easy' as const,
    suitablePeople: 5,
    duration: 30,
    status: 'beginner' as const,
    materials: [],
    demoPoints: '',
    faqs: [],
    backupPlan: ''
  };
  addStyle(newStyle);
};

const handleAddGroup = () => {
  const newGroup = {
    name: `第${groups.value.length + 1}组`,
    peopleCount: 5,
    styleIds: []
  };
  addGroup(newGroup);
};

const handleAssignStyle = (styleId: string, groupId: string) => {
  assignStyleToGroup(groupId, styleId);
};

const handleUnassignStyle = (styleId: string) => {
  const group = getStyleGroup(styleId);
  if (group) {
    removeStyleFromGroup(group.id, styleId);
  }
};

const handleDeleteStyle = (styleId: string) => {
  groups.value.forEach(group => {
    const idx = group.styleIds.indexOf(styleId);
    if (idx !== -1) {
      group.styleIds.splice(idx, 1);
    }
  });
  deleteStyle(styleId);
};

const handleCopyStyle = (styleId: string) => {
  copyStyle(styleId);
};

const handleQuickEditStyle = (styleId: string, updates: Partial<FanStyle>) => {
  updateStyle(styleId, updates);
};
</script>

<template>
  <div class="min-h-screen bg-amber-50 pb-20">
    <ActivityHeader />

    <div class="max-w-6xl mx-auto px-4 py-6">
      <div class="flex gap-2 mb-6">
        <button
          @click="activeTab = 'styles'"
          class="px-4 py-2 rounded-lg font-medium transition-colors"
          :class="activeTab === 'styles'
            ? 'bg-green-600 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-100'"
        >
          样式管理
        </button>
        <button
          @click="activeTab = 'groups'"
          class="px-4 py-2 rounded-lg font-medium transition-colors"
          :class="activeTab === 'groups'
            ? 'bg-green-600 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-100'"
        >
          分组执行表
        </button>
      </div>

      <AlertPanel :alerts="alerts" />

      <div v-show="activeTab === 'styles'">
        <StyleFilter
          :difficulty="filterCriteria.difficulty"
          :status="filterCriteria.status"
          :material-keyword="filterCriteria.materialKeyword"
          :min-people="filterCriteria.minPeople"
          :max-people="filterCriteria.maxPeople"
          :has-active-filters="hasActiveFilters"
          @update:difficulty="(v?: DifficultyLevel) => setDifficultyFilter(v)"
          @update:status="(v?: StyleStatus) => setStatusFilter(v)"
          @update:material-keyword="(v: string) => setMaterialKeywordFilter(v)"
          @update:min-people="(v?: number) => setPeopleRangeFilter(v, filterCriteria.maxPeople)"
          @update:max-people="(v?: number) => setPeopleRangeFilter(filterCriteria.minPeople, v)"
          @clear="clearFilters"
        />

        <StyleAccordion
          :styles="filteredStyles"
          :groups="groups"
          :is-style-assigned="isStyleAssigned"
          :get-style-group="getStyleGroup"
          @add-style="handleAddStyle"
          @update-style="updateStyle"
          @delete-style="handleDeleteStyle"
          @assign-style="handleAssignStyle"
          @unassign-style="handleUnassignStyle"
          @copy-style="handleCopyStyle"
          @quick-edit-style="handleQuickEditStyle"
        />
      </div>

      <div v-show="activeTab === 'groups'">
        <GroupAssignment
          :groups="groups"
          :styles="styles"
          :unassigned-styles="unassignedStyles"
          :group-material-summaries="groupMaterialSummaries"
          @add-group="handleAddGroup"
          @update-group="updateGroup"
          @delete-group="deleteGroup"
          @assign-style="assignStyleToGroup"
          @remove-style="removeStyleFromGroup"
        />
      </div>
    </div>

    <SummaryBar
      :total-styles="styles.length"
      :total-groups="groups.length"
      :total-people="totalPeopleInGroups"
      :total-duration="activity.totalDuration"
      :assigned-duration="assignedDuration"
      :total-materials="totalMaterials"
      :alerts="alerts"
      :overall-material-shortage="overallMaterialShortage"
      :total-shortage-count="totalShortageCount"
      :total-no-data-count="totalNoDataCount"
    />
  </div>
</template>
