<script setup lang="ts">
import { ref } from 'vue';
import grayscale from './grayscale.vue';
import channel from './channel.vue';

const menus = [
  { tab: 'webgl-grayscale', name: '灰度化', component: grayscale },
  { tab: 'webgl-channel', name: 'channel', component: channel }
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