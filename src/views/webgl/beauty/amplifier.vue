<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getImageData, loadImage } from './utils/index.ts';

// 创建一个 ref 用于 canvas 元素
const canvasRef = ref<HTMLCanvasElement | null>(null);
const magnifierRef = ref<HTMLDivElement | null>(null);

onMounted(() => {
  // 获取 canvas 元素
  const canvas = canvasRef.value;
  if (!canvas) return;
  const context = canvas.getContext('2d',  { willReadFrequently: true });
  if (!context) return;

  (async function() {
    const img = await loadImage('https://p2.ssl.qhimg.com/d/inn/4b7e384c55dc/girl1.jpg');
    const imageData = getImageData(img);

    canvas.width = imageData.width;
    canvas.height = imageData.height;
    context.putImageData(imageData, 0, 0);
  }());

  // 添加鼠标事件处理函数
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseleave', handleMouseLeave);
});

// 鼠标移动事件处理函数
const handleMouseMove = (event: MouseEvent) => {
  // 获取 canvas 和 magnifier 元素的引用
  const canvas = canvasRef.value;
  const magnifier = magnifierRef.value;
  if (!canvas || !magnifier) return;

  // 获取 canvas 元素的边界矩形
  const rect = canvas.getBoundingClientRect();
  // 计算鼠标相对于 canvas 的位置
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // 显示放大镜
  magnifier.style.display = 'block';
  // 设置放大镜的位置，使其中心位于鼠标位置
  magnifier.style.left = `${x - 50}px`;
  magnifier.style.top = `${y - 50}px`;

  // 获取 canvas 的 2D 渲染上下文
  const context = canvas.getContext('2d');
  if (!context) return;

  // 从 canvas 中获取以鼠标为中心的 50x50 像素区域的图像数据
  const imageData = context.getImageData(x - 25, y - 25, 50, 50);
  // 获取放大镜中 canvas 的 2D 渲染上下文
  const magnifierContext = magnifier.querySelector('canvas')?.getContext('2d');
  if (!magnifierContext) return;

  // 将图像数据绘制到放大镜的 canvas 中
  magnifierContext.putImageData(imageData, 0, 0);
};

const handleMouseLeave = () => {
  const magnifier = magnifierRef.value;
  if (magnifier) {
    magnifier.style.display = 'none';
  }
};
</script>

<template>
  <div class="image-container">
    <canvas class="content-canvas" ref="canvasRef" width="512" height="512"></canvas>
    <div class="magnifier" ref="magnifierRef">
      <canvas width="100" height="100"></canvas>
    </div>
  </div>
</template>

<style scoped>
.image-container {
  position: relative;
}

.magnifier {
  position: absolute;
  border: 2px solid #000;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  overflow: hidden;
  display: none;
  pointer-events: none;
}

.magnifier canvas {
  width: 100px;
  height: 100px;
  transform: scale(3);
  transform-origin: top left;
}
</style>