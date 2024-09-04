<script setup lang="ts">
import { onMounted, ref } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);

const vertex = `
  attribute vec2 position;

  uniform float u_rotation;
  uniform float u_time;
  uniform float u_duration;
  uniform float u_scale;
  uniform vec2 u_dir;

  varying float vP;

  void main() {
    // 当前动画进度，取值区间[0,1]。防止精度误差导致的进度越界
    float p = min(1.0, u_time / u_duration);
    // 旋转角度：初始角度加上10π，表示在动画过程中会绕自身旋转5周
    float rad = u_rotation + 3.14 * 10.0 * p;
    // 缩放比例：初始缩放比例乘以一个系数。p * (2.0 - p)是一个缓动函数，作用是：让scale的变化量随着时间推移逐渐减小
    float scale = u_scale * p * (2.0 - p);
    vec2 offset = 2.0 * u_dir * p * p;
    float x_rad = 3.14 * p * (2.0 - p);
    float y_rad = 3.14 * p * p;

    // 三个齐次矩阵
    // 矩阵的元素按照自上而下再自左向右传入作为参数
    // glsl中默认矩阵以列主序：先列后行
    // 1. 平移矩阵
    mat3 translateMatrix = mat3(
      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      offset.x, offset.y, 1.0
    );
    // 2. 旋转矩阵
    mat3 rotateMatrix = mat3(
      cos(rad), sin(rad), 0.0,
      -sin(rad), cos(rad), 0.0,
      0.0, 0.0, 1.0
    );
    // 3. 缩放矩阵
    mat3 scaleMatrix = mat3(
      scale, 0.0, 0.0,
      0.0, scale, 0.0,
      0.0, 0.0, 1.0
    );
    // 4. 扭曲矩阵
    mat3 skewMatrix = mat3(
      1.0, tan(y_rad), 0.0,
      tan(x_rad), 1.0, 0.0,
      0.0, 0.0, 1.0
    );
    gl_PointSize = 1.0;
    // vec3 pos = translateMatrix * rotateMatrix * scaleMatrix * vec3(position, 1.0);
    // vec3 pos = rotateMatrix * translateMatrix * scaleMatrix * vec3(position, 1.0);
    // vec3 pos = scaleMatrix * translateMatrix * rotateMatrix * vec3(position, 1.0);
    vec3 pos = skewMatrix * rotateMatrix * translateMatrix * scaleMatrix * vec3(position, 1.0);
    gl_Position = vec4(pos, 1.0);
    vP = p;
  }
`;

const fragment = `
  precision mediump float;
  
  uniform vec4 u_color;
  // 让alpha值随着vP值变化；实现粒子的淡出效果
  varying float vP;

  void main()
  {
    gl_FragColor.xyz = u_color.xyz;
    gl_FragColor.a = (1.0 - vP) * u_color.a;
  }    
`;

// 三角形顶点
const position = new Float32Array([
  -1, -1,
  0, 1,
  1, -1,
]);

interface Triangle {
  u_color: number[];
  u_rotation: number;
  u_scale: number;
  u_time: number;
  u_duration: number;
  u_dir: number[];
  startTime: number;
}

// 随机生成三角形
const randomTriangles = () => {
  const u_color = [Math.random(), Math.random(), Math.random(), 1.0]; // 随机颜色，RGBA
  const u_rotation = Math.random() * Math.PI; // 初始旋转角度
  const u_scale = Math.random() * 0.05 + 0.03; // 初始大小
  const u_time = 0;
  const u_duration = 3.0; // 持续3秒钟

  const rad = Math.random() * Math.PI * 2;
  const u_dir = [Math.cos(rad), Math.sin(rad)]; // 运动方向
  const startTime = performance.now();

  return { u_color, u_rotation, u_scale, u_time, u_duration, u_dir, startTime };
}

// 将随机三角形信息传给 shader 里的 uniform 变量
const setUniforms = (
  gl: WebGLRenderingContext, program: WebGLProgram,
  { u_color, u_rotation, u_scale, u_time, u_duration, u_dir }
  : Triangle
) => {
  // gl.getUniformLocation 拿到uniform变量的指针
  let loc = gl.getUniformLocation(program, 'u_color');
  // 将数据传给 unfirom 变量的地址
  gl.uniform4fv(loc, u_color);

  loc = gl.getUniformLocation(program, 'u_rotation');
  gl.uniform1f(loc, u_rotation);

  loc = gl.getUniformLocation(program, 'u_scale');
  gl.uniform1f(loc, u_scale);

  loc = gl.getUniformLocation(program, 'u_time');
  gl.uniform1f(loc, u_time);

  loc = gl.getUniformLocation(program, 'u_duration');
  gl.uniform1f(loc, u_duration);

  loc = gl.getUniformLocation(program, 'u_dir');
  gl.uniform2fv(loc, u_dir);
}

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const gl = canvas.getContext('webgl');
  if (!gl) return;

  // 创建shader对象
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  if (!vertexShader) {
    console.error('Failed to create vertex shader');
    return;
  }
  gl.shaderSource(vertexShader, vertex);
  gl.compileShader(vertexShader);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  if (!fragmentShader) {
    console.error('Failed to create fragment shader');
    return;
  }
  gl.shaderSource(fragmentShader, fragment);
  gl.compileShader(fragmentShader);

  // 创建program对象并链接到WebGL上下文对象上
  const program = gl.createProgram();
  if (!program) {
    console.error('Failed to create WebGL program');
    return;
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  // 创建缓冲区对象
  const bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, position, gl.STATIC_DRAW);

  const vPosition = gl.getAttribLocation(program, 'position');
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  let triangles: Triangle[] = [];
  /**
   * 动态更新triangle数组，并绘制三角形
   */
  const update = (gl: WebGLRenderingContext, program: WebGLProgram, triangles: Triangle[]) => {
    for (let i = 0; i < 5 * Math.random(); i++) {
      triangles.push(randomTriangles());
    }
    gl.clear(gl.COLOR_BUFFER_BIT);
    triangles.forEach((triangle) => {
      triangle.u_time = (performance.now() - triangle.startTime) / 1000;
      setUniforms(gl, program, triangle);
      gl.drawArrays(gl.TRIANGLES, 0, position.length / 2);
    });

    triangles = triangles.filter((triangle) => {
      return triangle.u_time <= triangle.u_duration;
    });
    requestAnimationFrame(() => update(gl, program, triangles));
  }

  requestAnimationFrame(() => update(gl, program, triangles));
});
</script>

<template>
  <section class="content">
    <canvas class="content-canvas" ref="canvasRef" width="800" height="600"></canvas>
  </section>
</template>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
}

.content-canvas {
  border: 1px solid #e5e7ec;
}
</style>