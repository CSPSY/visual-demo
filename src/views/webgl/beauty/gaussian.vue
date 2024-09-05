<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getImageData, loadImage, gaussianBlur } from './utils/index.ts';

// 创建一个 ref 用于 canvas 元素
const canvasRef = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  // 获取 canvas 元素
  const canvas = canvasRef.value;
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (!context) return;

  (async function() {
    const img = await loadImage('https://p2.ssl.qhimg.com/d/inn/4b7e384c55dc/girl1.jpg');
    const imageData = getImageData(img);

    const {width, height, data} = imageData;

    gaussianBlur(data, width, height);

    canvas.width = imageData.width;
    canvas.height = imageData.height;
    context.putImageData(imageData, 0, 0);
  }());
});
</script>

<template>
  <canvas class="content-canvas" ref="canvasRef" width="512" height="512"></canvas>
</template>

<style scoped>
.content-canvas {
  display: block;
  margin: 0 auto;
}
</style>