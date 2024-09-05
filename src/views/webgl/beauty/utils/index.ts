// 异步加载图片
export const loadImage = (src: string) => {
  const img: HTMLImageElement = new Image();
  img.crossOrigin = 'anonymous';
  return new Promise<HTMLImageElement>((resolve) => {
    img.onload = () => {
      resolve(img);
    };
    img.src = src;
  });
};
  
const imageDataContext = new WeakMap();
// 获得图片的 imageData 数据
export const getImageData = (img: HTMLImageElement, rect = [0, 0, img.width, img.height]): ImageData =>{
  let context;
  const ret = [...rect];

  if(imageDataContext.has(img)) {
    context = imageDataContext.get(img);
  } else {
    const { width, height } = img;
    // 计算缩放比例
    const maxWidth = 512;
    const maxHeight = 512;
    const scale = Math.min(maxWidth / width, maxHeight / height);
    // 计算新的宽度和高度
    ret[2] = width * scale;
    ret[3] = height * scale;

    const canvas = new OffscreenCanvas(ret[2], ret[3]);
    context = canvas.getContext('2d');
    context?.drawImage(img, 0, 0, ret[2], ret[3]);
    imageDataContext.set(img, context);
  }
  return context.getImageData(...ret);
}

// 循环遍历 imageData 数据
export const traverse = (imageData: ImageData, pass: (params: any) => any): ImageData => {
  // 解构 imageData 对象，获取宽度、高度和数据
  const { width, height, data } = imageData;

  // 遍历 imageData 数据，每个像素有 4 个通道（红、绿、蓝、透明度）
  for (let i = 0; i < width * height * 4; i += 4) {
    // 调用 pass 函数，传递当前像素的 RGBA 值和其他信息
    const [r, g, b, a] = pass({
      r: data[i] / 255, // 红色通道值，归一化到 0-1 之间
      g: data[i + 1] / 255, // 绿色通道值，归一化到 0-1 之间
      b: data[i + 2] / 255, // 蓝色通道值，归一化到 0-1 之间
      a: data[i + 3] / 255, // 透明度通道值，归一化到 0-1 之间
      index: i, // 当前像素在数据数组中的索引
      width, // 图像的宽度
      height, // 图像的高度
      x: ((i / 4) % width) / width, // 当前像素的 x 坐标，归一化到 0-1 之间
      y: Math.floor(i / 4 / width) / height // 当前像素的 y 坐标，归一化到 0-1 之间
    });

    // 将 pass 函数返回的 RGBA 值重新设置到数据数组中
    data.set([r, g, b, a].map(v => Math.round(v * 255)), i);
  }

  // 返回修改后的 imageData 对象
  return imageData;
}

// 创建高斯矩阵
export const gaussianMatrix = (radius: number, sigma = radius / 3) => {
  const a = 1 / (Math.sqrt(2 * Math.PI) * sigma);
  const b = -1 / (2 * sigma ** 2);
  let sum = 0;
  const matrix = [];
  for(let x = -radius; x <= radius; x++) {
    const g = a * Math.exp(b * x ** 2);
    matrix.push(g);
    sum += g;
  }

  for(let i = 0, len = matrix.length; i < len; i++) {
    matrix[i] /= sum;
  }
  return {matrix, sum};
}

/**
  * 高斯模糊
  * @param  {Array} pixes  pix array
  * @param  {Number} width 图片的宽度
  * @param  {Number} height 图片的高度
  * @param  {Number} radius 取样区域半径, 正数, 可选, 默认为 3.0
  * @param  {Number} sigma 标准方差, 可选, 默认取值为 radius / 3
  * @return {Array}
  */
export function gaussianBlur(pixels: Uint8ClampedArray, width: number, height: number, radius = 3, sigma = radius / 3) {
  const {matrix, sum} = gaussianMatrix(radius, sigma);
  // x 方向一维高斯运算
  for(let y = 0; y < height; y++) {
    for(let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0;

      for(let j = -radius; j <= radius; j++) {
        const k = x + j;
        if(k >= 0 && k < width) {
          const i = (y * width + k) * 4;
          r += pixels[i] * matrix[j + radius];
          g += pixels[i + 1] * matrix[j + radius];
          b += pixels[i + 2] * matrix[j + radius];
        }
      }
      const i = (y * width + x) * 4;
      // 除以 sum 是为了消除处于边缘的像素, 高斯运算不足的问题
      pixels[i] = r / sum;
      pixels[i + 1] = g / sum;
      pixels[i + 2] = b / sum;
    }
  }

  // y 方向一维高斯运算
  for(let x = 0; x < width; x++) {
    for(let y = 0; y < height; y++) {
      let r = 0,
        g = 0,
        b = 0;

      for(let j = -radius; j <= radius; j++) {
        const k = y + j;
        if(k >= 0 && k < height) {
          const i = (k * width + x) * 4;
          r += pixels[i] * matrix[j + radius];
          g += pixels[i + 1] * matrix[j + radius];
          b += pixels[i + 2] * matrix[j + radius];
        }
      }
      const i = (y * width + x) * 4;
      pixels[i] = r / sum;
      pixels[i + 1] = g / sum;
      pixels[i + 2] = b / sum;
    }
  }
  return pixels;
}
