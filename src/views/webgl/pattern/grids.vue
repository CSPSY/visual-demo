<script setup lang="ts">
import { onMounted, ref } from 'vue';
import GlRenderer from 'gl-renderer';

// 顶点着色器代码
const vertex = `
  // 定义一个二维向量属性 a_vertexPosition，用于接收顶点位置
  attribute vec2 a_vertexPosition;
  
  // 定义一个二维向量属性 uv，用于接收纹理坐标
  attribute vec2 uv;

  // 定义一个二维向量 varying 变量 vUv，用于在顶点着色器和片段着色器之间传递纹理坐标
  varying vec2 vUv;

  // 顶点着色器的主函数
  void main() {
    // 设置绘制点的大小为 1.0 像素
    gl_PointSize = 1.0;
    
    // 将传入的纹理坐标 uv 赋值给 varying 变量 vUv
    vUv = uv;
    
    // 将顶点位置转换为齐次坐标，并赋值给内建变量 gl_Position
    gl_Position = vec4(a_vertexPosition, 1, 1);
  }
`;

// 片段着色器代码
const fragment = `
  // 如果使用的是 OpenGL ES，定义浮点数的默认精度为中等
  #ifdef GL_ES
  precision mediump float;
  #endif

  // 定义一个二维向量 varying 变量 vUv，用于接收从顶点着色器传递过来的纹理坐标
  varying vec2 vUv;
  
  // 定义一个 uniform 变量 rows，用于控制网格的行数
  uniform float rows;

  // 片段着色器的主函数
  void main() {
    // 计算纹理坐标 vUv 乘以 rows 后的小数部分，并赋值给 st
    /** 
     * vUv 是纹理坐标，范围在 [0, 1] 之间。
     * rows 是网格的行数。fract 函数返回输入值的小数部分。
     * 通过 vUv * rows，我们将纹理坐标扩展到 [0, rows] 范围内。
     * 例如，如果 rows 为 5，那么 vUv 的范围将变为 [0, 5]。
     * 然后，fract 函数将其映射回 [0, 1] 范围内，但会在每个整数边界处重复。这创建了一个重复的网格效果。
     */
    vec2 st = fract(vUv * rows);
    
    // 计算 st.x 是否小于 0.9，如果是则 d1 为 1.0，否则为 0.0
    float d1 = step(st.x, 0.9);
    
    // 计算 st.y 是否大于 0.1，如果是则 d2 为 1.0，否则为 0.0
    float d2 = step(0.1, st.y);
    
    // 将颜色从 vec3(0.8) 和 vec3(1.0) 之间插值，并赋值给 gl_FragColor.rgb
    /**
     *  mix(vec3(0.8), vec3(1.0), d1 * d2)：在颜色 vec3(0.8) 和 vec3(1.0) 之间插值，插值因子为 d1 * d2。
     *  如果 d1 * d2 为 1.0，颜色为 vec3(1.0)（白色）。
     *  如果 d1 * d2 为 0.0，颜色为 vec3(0.8)（灰色）。 
     */
    gl_FragColor.rgb = mix(vec3(0.8), vec3(1.0), d1 * d2);
    
    // 设置片段的 alpha 值为 1.0（完全不透明）
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
  renderer.uniforms.rows = 1;

  // 定义不同的行数
  // const rows = [1, 4, 16, 32, 64];
  // let idx = 0;

  // 设置定时器，每秒更新一次行数
  // const timerId = setInterval(() => {
  //   renderer.uniforms.rows = rows[idx++];
  //   if (idx > 4) {
  //     clearInterval(timerId);
  //   }
  // }, 1000);

  renderer.uniforms.rows = 64;

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