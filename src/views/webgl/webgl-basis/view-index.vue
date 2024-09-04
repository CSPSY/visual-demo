<script setup lang="ts">
import { ref } from 'vue';
import triangle from './triangle.vue';
import polygon from './polygon.vue';

const menus = [
  { tab: '/webgl/basis/triangle', name: '三角形', component: triangle },
  { tab: '/webgl/basis/polygon', name: '多边形', component: polygon }
];

const activeTab = ref(menus[0].tab);
</script>

<template>
  <el-container style="height: 100vh;">
    <el-container>
      <!-- Main -->
      <el-main style="padding: 20px;">
        <el-tabs v-model="activeTab">
          <el-tab-pane v-for="menu in menus" :key="menu.tab" :label="menu.name" :name="menu.tab">
            <component :is="menu.component" />
          </el-tab-pane>
        </el-tabs>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
</style>