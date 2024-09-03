<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const menus = [
  { path: '/webgl/basis/triangle', name: '三角形' },
  { path: '/webgl/basis/polygon', name: '多边形' }
];

const activeTab = ref(route.path);
const handleTabClick = (tab: { paneName: string }) => {
  router.push(tab.paneName);
};
</script>

<template>
  <el-container style="height: 100vh;">
    <el-container>
      <!-- Main -->
      <el-main style="padding: 20px;">
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane v-for="menu in menus" :key="menu.path" :label="menu.name" :name="menu.path"></el-tab-pane>
        </el-tabs>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
</style>