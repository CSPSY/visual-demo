<script setup lang="ts">
import { watch, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const activeIndex = ref<string>('1');
// 定义菜单项数组
const menuItems = ref([
  { index: '1', label: 'webgl 基础入门', route: '/webgl/basis' },
  { index: '2', label: '仿射变换', route: '/webgl/transform' },
  { index: '3', label: '图案生成', route: '/webgl/pattern' },
]);

const handleMenuSelect = (index: string) => {
  const selectedItem = menuItems.value.find(item => item.index === index);
  if (selectedItem) {
    router.push(selectedItem.route);
  }
};

watch(
  () => route.fullPath,
  (fullPath) => {
    const currentItem = menuItems.value.find(item => fullPath.startsWith(item.route));
    if (currentItem) {
      activeIndex.value = currentItem.index;
    }
  },
  { immediate: true }
);
</script>

<template>
  <div>
    <el-container style="height: 100vh;">
      <!-- Header -->
      <el-header style="background-color: #fff; text-align: center; font-size: 24px; padding: 20px;">
        可视化 demo showcase
      </el-header>

      <el-container>
        <!-- Aside -->
        <el-aside width="200px">
          <el-menu :default-active="activeIndex" class="el-menu-vertical-demo" @select="handleMenuSelect">
            <el-menu-item v-for="item in menuItems" :key="item.index" :index="item.index">
              {{ item.label }}
            </el-menu-item>
          </el-menu>
        </el-aside>
        <!-- Main -->
        <el-main>
          <router-view :key="route.fullPath"></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
</style>