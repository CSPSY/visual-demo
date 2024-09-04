<script setup lang="ts">
import { onMounted, ref } from 'vue';
import GlRenderer from 'gl-renderer';

// 顶点着色器代码
const vertex = `
  attribute vec2 a_vertexPosition;
  attribute vec2 uv;

  varying vec2 vUv;

  void main() {
    gl_PointSize = 1.0;
    vUv = uv;
    // 将顶点位置转换为齐次坐标，并赋值给内建变量 gl_Position
    gl_Position = vec4(a_vertexPosition, 1, 1);
  }
`;

// 片段着色器代码
const fragment = `
  #ifdef GL_ES
  precision highp float;
  #endif

  varying vec2 vUv;
  float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }
  
  // 定义一个函数 hsv2rgb，用于将 HSV 转换为 RGB
  vec3 hsv2rgb(vec3 c){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0), 6.0)-3.0)-1.0, 0.0, 1.0);
    rgb = rgb * rgb * (3.0 - 2.0 * rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
  }

  void main() {
    vec2 st = vUv * 10.0;
    // gl_FragColor.rgb = vec3(random(floor(st)));
    vec3 hsv = vec3(random(floor(st)), 1.0, 1.0); // 设置 HSV 颜色
    gl_FragColor.rgb = hsv2rgb(hsv);
    gl_FragColor.a = 1.0;
  }
`;

// 创建一个 ref 用于 canvas 元素
const canvasRef = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  // 获取 canvas 元素
  const canvas = canvasRef.value;
  if (!canvas) return;

  // 创建 GlRenderer 实例
  const renderer = new GlRenderer(canvas);

  // 编译着色器并创建程序
  const program = renderer.compileSync(fragment, vertex);
  renderer.useProgram(program);
  renderer.uniforms.rows = 20;

  // 设置网格数据
  renderer.setMeshData([{
    positions: [
      [-1, -1],
      [-1, 1],
      [1, 1],
      [1, -1],
    ],
    attributes: {
      uv: [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 0],
      ],
    },
    cells: [[0, 1, 2], [2, 0, 3]],
  }]);

  // 渲染网格
  renderer.render();
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