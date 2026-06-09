<script setup lang="ts">
import { Calendar, Clock, Users, Palette } from 'lucide-vue-next';
import { useActivity } from '../composables/useActivity';

const { activity, updateActivity } = useActivity();
</script>

<template>
  <div class="bg-gradient-to-r from-green-700 to-green-600 text-white p-6 shadow-lg">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center gap-3 mb-4">
        <Palette class="w-8 h-8" />
        <h1 class="text-2xl font-bold">草编团扇工作坊</h1>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div class="flex items-center gap-2 mb-2">
            <Palette class="w-5 h-5 text-green-200" />
            <span class="text-sm text-green-100">活动名称</span>
          </div>
          <input
            v-model="activity.name"
            type="text"
            class="w-full bg-transparent border-b border-green-300/50 focus:border-white outline-none text-white placeholder-green-200"
            placeholder="输入活动名称"
          />
        </div>

        <div class="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div class="flex items-center gap-2 mb-2">
            <Calendar class="w-5 h-5 text-green-200" />
            <span class="text-sm text-green-100">活动日期</span>
          </div>
          <input
            v-model="activity.date"
            type="date"
            class="w-full bg-transparent border-b border-green-300/50 focus:border-white outline-none text-white"
          />
        </div>

        <div class="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div class="flex items-center gap-2 mb-2">
            <Clock class="w-5 h-5 text-green-200" />
            <span class="text-sm text-green-100">计划时长 (分钟)</span>
          </div>
          <input
            v-model.number="activity.totalDuration"
            type="number"
            min="0"
            class="w-full bg-transparent border-b border-green-300/50 focus:border-white outline-none text-white placeholder-green-200"
            placeholder="0"
          />
        </div>

        <div class="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div class="flex items-center gap-2 mb-2">
            <Users class="w-5 h-5 text-green-200" />
            <span class="text-sm text-green-100">总人数</span>
          </div>
          <input
            v-model.number="activity.totalPeople"
            type="number"
            min="0"
            class="w-full bg-transparent border-b border-green-300/50 focus:border-white outline-none text-white placeholder-green-200"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  </div>
</template>
