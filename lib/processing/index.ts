import { ColorMethod, DitherMethod, SamplingMode, BrandType, RGB } from "./types";
import { colorToKey, getCiede2000, getEuclideanOKLab, rgbToLab, rgbToOklab, rgbToXyz, xyzToLab, xyzToOklab } from "./colors";
import { quantize } from "./quantization";
import { bayerMatrix8x8, blueNoise16x16 } from "./dithering";
import { getImageData, loadImage } from "./image-utils";
import { getActiveBrandPalette, mapPaletteToBrands, createLookupPalette, CachedPaletteColor } from "./palette-manager";

// 重新导出 loadImage 供外部使用
export { loadImage };

/**
 * 主处理函数：将图片转换为像素数据
 */
export const sampleImageColors = (
  img: HTMLImageElement,
  cols: number,
  maxColors: number = 24,
  colorMethod: ColorMethod = 'lab-ciede2000',
  ditherMethod: DitherMethod = 'none',
  samplingMode: SamplingMode = 'default',
  brands: BrandType[] = [], 
  excludedColors: string[] = [] 
): { colors: string[]; rows: number; cols: number } => {
  
  const aspectRatio = img.height / img.width;
  const rows = Math.round(cols * aspectRatio);

  // 1. 获取图片数据 (使用 image-utils 处理 Canvas 操作)
  const { imgData } = getImageData(img, cols, rows, samplingMode);
  const data = imgData.data;
  
  // 2. 提取用于色板生成的有效非透明像素
  const validPixels: RGB[] = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] >= 25) { // Skip transparent
      validPixels.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
    }
  }

  // 3. 生成基础色板 (中位切分)
  let paletteRGB = quantize(validPixels, maxColors);

  // 4. 应用品牌限制 (如果选择了品牌，将基础色板映射到最近的品牌色)
  const brandCandidates = getActiveBrandPalette(brands, excludedColors);
  if (brandCandidates.length > 0) {
      paletteRGB = mapPaletteToBrands(paletteRGB, brandCandidates, colorMethod);
  }

  // 5. 创建用于快速查找的缓存色板 (Pre-calculate Lab/OkLab)
  const paletteCache = createLookupPalette(paletteRGB);

  const finalColors: string[] = new Array(cols * rows).fill("transparent");

  // 内部辅助函数：寻找最近颜色
  const findClosest = (r: number, g: number, b: number): RGB => {
    const currentRGB = { r, g, b };
    let bestMatch = paletteCache[0];
    let minDistance = Infinity;

    if (colorMethod === 'lab-ciede2000') {
      const currentLAB = xyzToLab(rgbToXyz(currentRGB));
      for (const p of paletteCache) {
        const dist = getCiede2000(currentLAB, p.lab);
        if (dist < minDistance) {
          minDistance = dist;
          bestMatch = p;
        }
      }
    } else {
      const currentOK = xyzToOklab(rgbToXyz(currentRGB));
      for (const p of paletteCache) {
        const dist = getEuclideanOKLab(currentOK, p.oklab);
        if (dist < minDistance) {
          minDistance = dist;
          bestMatch = p;
        }
      }
    }
    return bestMatch.rgb;
  };

  // 6. 像素映射与抖动处理
  // 为了进行 Error Diffusion，我们需要一个 Float32Array 来存储计算中的颜色值
  const processingData = new Float32Array(data.length);
  for(let i=0; i<data.length; i++) processingData[i] = data[i];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      
      // 透明像素处理
      if (processingData[i + 3] < 25) {
        finalColors[y * cols + x] = "transparent";
        continue;
      }

      let oldR = processingData[i];
      let oldG = processingData[i + 1];
      let oldB = processingData[i + 2];

      // 应用有序抖动 (Ordered Dithering: Bayer / Blue Noise)
      // 这些算法仅修改当前像素的值，不传递误差
      if (ditherMethod === 'bayer') {
        const threshold = bayerMatrix8x8[y % 8][x % 8];
        const factor = (threshold - 32) / 64; 
        const intensity = 40; 
        oldR += factor * intensity;
        oldG += factor * intensity;
        oldB += factor * intensity;
      } else if (ditherMethod === 'blue-noise') {
        const threshold = blueNoise16x16[(y % 16) * 16 + (x % 16)];
        const factor = (threshold - 128) / 255;
        const intensity = 40;
        oldR += factor * intensity;
        oldG += factor * intensity;
        oldB += factor * intensity;
      }

      // 钳制颜色值
      oldR = Math.max(0, Math.min(255, oldR));
      oldG = Math.max(0, Math.min(255, oldG));
      oldB = Math.max(0, Math.min(255, oldB));

      // 找到最近的调色板颜色
      const newColor = findClosest(oldR, oldG, oldB);
      finalColors[y * cols + x] = colorToKey(newColor);

      // 应用误差扩散抖动 (Error Diffusion: Floyd-Steinberg / Atkinson)
      // 这些算法会将当前像素的“量化误差”传递给周围未处理的像素
      if (ditherMethod === 'floyd-steinberg' || ditherMethod === 'atkinson') {
        const errR = oldR - newColor.r;
        const errG = oldG - newColor.g;
        const errB = oldB - newColor.b;

        const distributeError = (dx: number, dy: number, factor: number) => {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
            const ni = (ny * cols + nx) * 4;
            // 只有目标像素不透明时才传递误差
            if (processingData[ni + 3] >= 25) {
                processingData[ni] += errR * factor;
                processingData[ni + 1] += errG * factor;
                processingData[ni + 2] += errB * factor;
            }
          }
        };

        if (ditherMethod === 'floyd-steinberg') {
          distributeError(1, 0, 7 / 16);
          distributeError(-1, 1, 3 / 16);
          distributeError(0, 1, 5 / 16);
          distributeError(1, 1, 1 / 16);
        } else if (ditherMethod === 'atkinson') {
          const k = 1 / 8;
          distributeError(1, 0, k);
          distributeError(2, 0, k);
          distributeError(-1, 1, k);
          distributeError(0, 1, k);
          distributeError(1, 1, k);
          distributeError(0, 2, k);
        }
      }
    }
  }

  return { colors: finalColors, rows, cols };
};