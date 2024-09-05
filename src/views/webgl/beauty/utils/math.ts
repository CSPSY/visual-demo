export const clamp = (value: number, min: number, max: number) => {
  if(min > max) [min, max] = [max, min];
  if(value < min) return min;
  if(value > max) return max;
  return value;
};

export const mix = (src: number, dest: number, p: number) => {
  return src * (1 - p) + dest * p;
};

