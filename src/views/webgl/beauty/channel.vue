<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getImageData, loadImage, traverse } from './utils/index.ts';
import { transformColor, brightness, saturate } from './utils/color-matrix.ts';

// 创建一个 ref 用于 canvas 元素
const canvasRef = ref<HTMLCanvasElement | null>(null);

const channel = ({r = 1, g = 1, b = 1}) => {
  return [
    r, 0, 0, 0, 0,
    0, g, 0, 0, 0,
    0, 0, b, 0, 0,
    0, 0, 0, 1, 0,
  ];
};

onMounted(() => {
  // 获取 canvas 元素
  const canvas = canvasRef.value;
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (!context) return;

  (async function() {
    const img = await loadImage('https://p2.ssl.qhimg.com/d/inn/4b7e384c55dc/girl1.jpg');
    const imageData = getImageData(img);

    traverse(imageData, ({r, g, b, a}: { r: number, g: number, b: number, a: number }) => {
      return transformColor(
        [r, g, b, a],
        // channel({ r: 1.2, g: 0.75 }),
        channel({ r: 1.2 }),
        brightness(1.2),
        saturate(1.2),
      );
    });

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