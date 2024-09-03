<script setup lang="ts">
import { onMounted, ref } from 'vue';

// 创建一个 ref 用于 canvas 元素
const canvasRef = ref<HTMLCanvasElement | null>(null);
const currentShape = ref<number>(0); // 用于存储当前绘制的图形索引

/**
* 正多边形的顶点可以通过以下公式计算：
*   顶点的x坐标：x = cos(2 * PI * i / n)
*   顶点的y坐标：y = sin(2 * PI * i / n)
*   其中，i是顶点的索引，n是多边形的边数。
*/
/**
* 创建正多边形的顶点坐标
* @param n 边数
* @returns 顶点坐标数组
*/
const createPolygon = (n: number): Float32Array => {
  const positions: number[] = [];
  const perAngle = 2 * Math.PI / n;
  for (let i = 0; i < n; i ++) {
    const angle = i * perAngle;
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    positions.push(x, y);
  }
  return new Float32Array(positions);
};

/**
* 创建正多角星的顶点坐标
* @param n 边数
* @returns 顶点坐标数组
*/
const createStar = (n: number): Float32Array => {
  const positions: number[] = [];
  const perAngle = Math.PI / n;
  for (let i = 0, len = 2 * n; i < len; i ++) {
    const angle = i * perAngle;
    if (i & 1) {
      const x = 0.5 * Math.cos(angle);
      const y = 0.5 * Math.sin(angle);
      positions.push(x, y);
    } else {
      const x = Math.cos(angle);
      const y = Math.sin(angle);
      positions.push(x, y);
    }
  }
  return new Float32Array(positions);
};

/**
 * 创建缓冲区对象并传递顶点数据
 * @param gl WebGL上下文
 * @param data 顶点数据
 * @returns 缓冲区对象
 */
const createBuffer = (gl: WebGLRenderingContext, data: Float32Array): WebGLBuffer | null => {
  const buffer = gl.createBuffer();
  if (!buffer) {
    console.error('Failed to create buffer object');
    return null;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return buffer;
};

// 生成一个函数，执行着色器程序完成绘制
const drawPolygon = (gl: WebGLRenderingContext, buffer: WebGLBuffer, n: number) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const aPosition = gl.getAttribLocation(gl.getParameter(gl.CURRENT_PROGRAM), 'position');
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);
  gl.drawArrays(gl.LINE_LOOP, 0, n);
};

let gl: WebGLRenderingContext | null = null;
let buffers: (WebGLBuffer | null)[] = [];

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  gl = canvas.getContext('webgl');
  if (!gl) return;

  // 创建WebGL程序
  // 1. 编写着色器
  // 顶点着色器
  const vertex = `
    attribute vec2 position;
    varying vec3 color;

    void main() {
      gl_PointSize = 1.0;
      color = vec3(0.5 + position * 0.5, 0.0);
      gl_Position = vec4(position, 1.0, 1.0);
    }
  `;

  // 片元着色器
  const fragment = `
    precision mediump float;
    varying vec3 color;

    void main() {
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  // 2. 创建shader对象
  const vertexShader: WebGLShader | null = gl.createShader(gl.VERTEX_SHADER); // 创建shader对象
  if (!vertexShader) {
    console.error('Failed to create vertex shader');
    return;
  }
  gl.shaderSource(vertexShader, vertex); // 把着色器代码传给shader对象
  gl.compileShader(vertexShader); // 编译shader对象

  const fragmentShader: WebGLShader | null = gl.createShader(gl.FRAGMENT_SHADER);
  if (!fragmentShader) {
    console.error('Failed to create fragment shader');
    return;
  }
  gl.shaderSource(fragmentShader, fragment);
  gl.compileShader(fragmentShader);

  // 3. 创建program对象并链接到WebGL上下文对象上
  const program = gl.createProgram();
  if (!program) {
    console.error('Failed to create WebGL program');
    return;
  }
  gl.attachShader(program, vertexShader); // 将shader关联到WebGL program对象上
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  // 4. 使用program对象
  gl.useProgram(program);

  // 定义正四边形，正五边形，正六角星的顶点坐标
  const positions = [
    createPolygon(4),
    createPolygon(5),
    createStar(6),
  ];

  // 创建缓冲区对象并传递顶点数据
  buffers = positions.map(data => createBuffer(gl!, data));
  
  drawCurrentShape();
});

const drawCurrentShape = () => {
  if (!gl || !buffers[currentShape.value]) return;
  gl.clear(gl.COLOR_BUFFER_BIT);
  if (currentShape.value === 0) {
    drawPolygon(gl, buffers[0]!, 4);
  } else if (currentShape.value === 1) {
    drawPolygon(gl, buffers[1]!, 5);
  } else if (currentShape.value === 2) {
    drawPolygon(gl, buffers[2]!, 12);
  }
};
</script>


<template>
  <section class="content">
    <canvas class="content-canvas" ref="canvasRef" width="360" height="360"></canvas>
    <div class="buttons">
      <el-button @click="currentShape = 0; drawCurrentShape()">绘制四边形</el-button>
      <el-button @click="currentShape = 1; drawCurrentShape()">绘制五边形</el-button>
      <el-button @click="currentShape = 2; drawCurrentShape()">绘制六角星</el-button>
    </div>
  </section>
</template>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
}

.buttons {
  margin-top: 20px;
}

.content-canvas {
  width: 256px;
  height: 256px;
  border: 1px solid #e5e7ec;
  padding: 12px;
}
</style>