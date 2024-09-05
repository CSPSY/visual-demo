import {clamp} from './math.ts';

// multiply 函数，用于矩阵乘法
export const multiply = (a: number[], b: number[]): number[] => {
  const out: number[] = [];
  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a04 = a[4];
  const a10 = a[5], a11 = a[6], a12 = a[7], a13 = a[8], a14 = a[9];
  const a20 = a[10], a21 = a[11], a22 = a[12], a23 = a[13], a24 = a[14];
  const a30 = a[15], a31 = a[16], a32 = a[17], a33 = a[18], a34 = a[19];

  // Cache only the current line of the second matrix
  let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  out[4] = b0 * a04 + b1 * a14 + b2 * a24 + b3 * a34 + b4;

  b0 = b[5]; b1 = b[6]; b2 = b[7]; b3 = b[8]; b4 = b[9];
  out[5] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[6] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[7] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[8] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  out[9] = b0 * a04 + b1 * a14 + b2 * a24 + b3 * a34 + b4;

  b0 = b[10]; b1 = b[11]; b2 = b[12]; b3 = b[13]; b4 = b[14];
  out[10] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[11] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[12] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[13] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  out[14] = b0 * a04 + b1 * a14 + b2 * a24 + b3 * a34 + b4;

  b0 = b[15]; b1 = b[16]; b2 = b[17]; b3 = b[18]; b4 = b[19];
  out[15] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[16] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[17] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[18] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  out[19] = b0 * a04 + b1 * a14 + b2 * a24 + b3 * a34 + b4;

  return out;
}

// transformColor 函数，用于颜色变换
export const transformColor = (color: number[], ...matrix: number[][]): number[] => {
  const [r, g, b, a] = color;

  // 将多个矩阵相乘
  const combinedMatrix = matrix.reduce((m1, m2) => multiply(m1, m2));

  // 应用矩阵变换
  color[0] = combinedMatrix[0] * r + combinedMatrix[1] * g + combinedMatrix[2] * b + combinedMatrix[3] * a + combinedMatrix[4];
  color[1] = combinedMatrix[5] * r + combinedMatrix[6] * g + combinedMatrix[7] * b + combinedMatrix[8] * a + combinedMatrix[9];
  color[2] = combinedMatrix[10] * r + combinedMatrix[11] * g + combinedMatrix[12] * b + combinedMatrix[13] * a + combinedMatrix[14];
  color[3] = combinedMatrix[15] * r + combinedMatrix[16] * g + combinedMatrix[17] * b + combinedMatrix[18] * a + combinedMatrix[19];

  return color;
}

export const grayscale = (p: number) => {
  p = clamp(0, 1, p);
  const r = 0.212 * p;
  const g = 0.714 * p;
  const b = 0.074 * p;

  return [
    r + 1 - p, g, b, 0, 0,
    r, g + 1 - p, b, 0, 0,
    r, g, b + 1 - p, 0, 0,
    0, 0, 0, 1, 0,
  ];
}

export const brightness = (p: number) => {
  return [
    p, 0, 0, 0, 0,
    0, p, 0, 0, 0,
    0, 0, p, 0, 0,
    0, 0, 0, 1, 0,
  ];
}

export const saturate = (p: number) => {
  // p = clamp(0, 1, p);
  const r = 0.212 * (1 - p);
  const g = 0.714 * (1 - p);
  const b = 0.074 * (1 - p);
  return [
    r + p, g, b, 0, 0,
    r, g + p, b, 0, 0,
    r, g, b + p, 0, 0,
    0, 0, 0, 1, 0,
  ];
}

export const contrast = (p: number) => {
  const d = 0.5 * (1 - p);
  return [
    p, 0, 0, 0, d,
    0, p, 0, 0, d,
    0, 0, p, 0, d,
    0, 0, 0, 1, 0,
  ];
}

export const invert = (p: number) => {
  const d = 1 - 2 * p;
  return [
    d, 0, 0, 0, p,
    0, d, 0, 0, p,
    0, 0, d, 0, p,
    0, 0, 0, 1, 0,
  ];
}

export const sepia = (p: number) => {
  return [
    1 - 0.607 * p, 0.769 * p, 0.189 * p, 0, 0,
    0.349 * p, 1 - 0.314 * p, 0.168 * p, 0, 0,
    0.272 * p, 0.534 * p, 1 - 0.869 * p, 0, 0,
    0, 0, 0, 1, 0,
  ];
}

export const opacity = (p: number) => {
  return [
    1, 0, 0, 0, 0,
    0, 1, 0, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 0, p, 0,
  ];
}

export const hueRotate = (deg: number) => {
  const rotation = deg / 180 * Math.PI;
  const cos = Math.cos(rotation),
    sin = Math.sin(rotation),
    lumR = 0.213,
    lumG = 0.715,
    lumB = 0.072;
  return [
    lumR + cos * (1 - lumR) + sin * (-lumR), lumG + cos * (-lumG) + sin * (-lumG), lumB + cos * (-lumB) + sin * (1 - lumB), 0, 0,
    lumR + cos * (-lumR) + sin * (0.143), lumG + cos * (1 - lumG) + sin * (0.140), lumB + cos * (-lumB) + sin * (-0.283), 0, 0,
    lumR + cos * (-lumR) + sin * (-(1 - lumR)), lumG + cos * (-lumG) + sin * (lumG), lumB + cos * (1 - lumB) + sin * (lumB), 0, 0,
    0, 0, 0, 1, 0,
  ];
}