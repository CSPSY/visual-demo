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
  // 如果使用的是 OpenGL ES，定义浮点数的默认精度为中等
  #ifdef GL_ES
  precision mediump float;
  #endif

  // 定义一个二维向量 varying 变量 vUv，用于接收从顶点着色器传递过来的纹理坐标
  varying vec2 vUv;

  // 定义一个 uniform 变量 center，用于控制曼德布罗特集合的中心
  uniform vec2 center;

  // 定义一个 uniform 变量 scale，用于控制曼德布罗特集合的缩放
  uniform float scale;

  // 定义一个 uniform 变量 iterations，用于控制迭代次数
  uniform int iterations;

  // 定义一个函数 f，用于计算 z 的下一个值
  vec2 f(vec2 z, vec2 c) {
    // 计算 z 的平方加上常数 c
    return mat2(z, -z.y, z.x) * z + c;
  }

  void main() {
    // 获取纹理坐标
    vec2 uv = vUv;

    // 将纹理坐标转换为复平面上的点 c
    vec2 c = center + 4.0 * (uv - vec2(0.5)) / scale;

    // 初始化 z 为 (0, 0)
    vec2 z = vec2(0.0);

    // 初始化 escaped 为 false，表示 z 是否逃逸
    bool escaped = false;

    // 定义一个变量 j，用于记录迭代次数
    int j;

    // 迭代计算 z 的值，最多迭代 65536 次
    for (int i = 0; i < 65536; i++) {
      if(i > iterations) break;
      j = i;
      z = f(z, c);
      // 如果 z 的长度大于 2，则表示 z 逃逸，退出循环
      if (length(z) > 2.0) {
        escaped = true;
        break;
      }
    }

    // 如果 z 逃逸，则根据迭代次数计算颜色，否则颜色为黑色
    // gl_FragColor.rgb = escaped ? vec3(float(j)) / float(iterations) : vec3(0.0);
    // gl_FragColor.rgb = escaped ? vec3(1.0) : vec3(0.0);
    gl_FragColor.rgb = escaped ? vec3(float(j)) / sqrt(float(iterations)) : vec3(0.0);

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

  renderer.uniforms.center = [0, 0];
  renderer.uniforms.scale = 1;
  renderer.uniforms.iterations = 256;

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