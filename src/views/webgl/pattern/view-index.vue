<script setup lang="ts">
import { ref } from 'vue';
import grids from './grids.vue';
import fractalPattern from './fractal-pattern.vue';
import labyrinth from './labyrinth.vue';
import coloredSquare from './colored-square.vue';

const menus = [
  { tab: 'webgl-grids', name: '重复网格', component: grids },
  { tab: 'webgl-fractal-pattern', name: '分形图案', component: fractalPattern },
  { tab: 'webgl-labyrinth', name: '迷宫', component: labyrinth },
  { tab: 'webgl-colored-square', name: '彩色方块', component: coloredSquare },
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