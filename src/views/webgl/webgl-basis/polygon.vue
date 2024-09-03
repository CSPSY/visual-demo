<script setup lang="ts">
import { ref } from 'vue';

// 创建一个 ref 用于 canvas 元素
const canvasRef = ref<HTMLCanvasElement | null>(null);
</script>

<template>
  <canvas ref="canvasRef" width="512" height="512"></canvas>
</template>

<style scoped>
</style>