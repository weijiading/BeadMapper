import { RGB } from "./type";
import { colorToKey, keyToColor } from "./colors";

const findBiggestRange = (pixels: RGB[]) => {
  let rMin = 255, rMax = 0;
  let gMin = 255, gMax = 0;
  let bMin = 255, bMax = 0;

  pixels.forEach(p => {
    rMin = Math.min(rMin, p.r); rMax = Math.max(rMax, p.r);
    gMin = Math.min(gMin, p.g); gMax = Math.max(gMax, p.g);
    bMin = Math.min(bMin, p.b); bMax = Math.max(bMax, p.b);
  });

  const rRange = rMax - rMin;
  const gRange = gMax - gMin;
  const bRange = bMax - bMin;

  const maxRange = Math.max(rRange, gRange, bRange);
  if (maxRange === rRange) return 'r';
  if (maxRange === gRange) return 'g';
  return 'b';
};

export const quantize = (pixels: RGB[], maxColors: number): RGB[] => {
  if (pixels.length === 0) return [];
  if (maxColors >= pixels.length) return Array.from(new Set(pixels.map(colorToKey))).map(keyToColor);

  let buckets = [pixels];

  while (buckets.length < maxColors) {
    let maxRange = -1;
    let bucketToSplitIndex = -1;
    let splitChannel: 'r' | 'g' | 'b' = 'r';

    for (let i = 0; i < buckets.length; i++) {
      if (buckets[i].length <= 1) continue;
      const channel = findBiggestRange(buckets[i]);
      let min = 255, max = 0;
      buckets[i].forEach(p => {
         min = Math.min(min, p[channel]);
         max = Math.max(max, p[channel]);
      });
      const range = max - min;
      if (range > maxRange) {
        maxRange = range;
        bucketToSplitIndex = i;
        splitChannel = channel;
      }
    }

    if (bucketToSplitIndex === -1) break;

    const bucket = buckets[bucketToSplitIndex];
    bucket.sort((a, b) => a[splitChannel] - b[splitChannel]);

    const median = Math.floor(bucket.length / 2);
    const bucket1 = bucket.slice(0, median);
    const bucket2 = bucket.slice(median);

    buckets.splice(bucketToSplitIndex, 1, bucket1, bucket2);
  }

  return buckets.map(bucket => {
    const total = bucket.reduce((acc, c) => ({ r: acc.r + c.r, g: acc.g + c.g, b: acc.b + c.b }), { r: 0, g: 0, b: 0 });
    return {
      r: Math.round(total.r / bucket.length),
      g: Math.round(total.g / bucket.length),
      b: Math.round(total.b / bucket.length)
    };
  });
};