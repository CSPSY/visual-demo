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
  precision mediump float;
  #endif

  #define PI 3.14159265358979323846

  varying vec2 vUv;
  
  uniform vec2 u_resolution;
  uniform int rows;

  float random (in vec2 _st) {
    return fract(sin(dot(_st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  vec2 truchetPattern(in vec2 _st, in float _index){
    _index = fract(((_index-0.5)*2.0));
    if (_index > 0.75) {
        _st = vec2(1.0) - _st;
    } else if (_index > 0.5) {
        _st = vec2(1.0-_st.x,_st.y);
    } else if (_index > 0.25) {
        _st = 1.0-vec2(1.0-_st.x,_st.y);
    }
    return _st;
  }

  void main() {
    vec2 st = vUv * float(rows);
    vec2 ipos = floor(st);  // integer
    vec2 fpos = fract(st);  // fraction

    vec2 tile = truchetPattern(fpos, random( ipos ));
    float color = 0.0;

    color = smoothstep(tile.x-0.3,tile.x,tile.y) - smoothstep(tile.x,tile.x+0.3,tile.y);

    gl_FragColor = vec4(vec3(color), 1.0);
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