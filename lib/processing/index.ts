import { PERLER_PALETTE, MARD_PALETTE, BrandColor } from "@/lib/constants/palettes";
import { ColorMethod, DitherMethod, SamplingMode, BrandType } from "@/types";
import { RGB } from "./type";
import { colorToKey, getCiede2000, getEuclideanOKLab, rgbToLab, rgbToOklab, rgbToXyz, xyzToLab, xyzToOklab } from "./colors";
import { quantize } from "./quantization";
import { manualDownscale } from "./downscaling";
import { bayerMatrix8x8, blueNoise16x16 } from "./dithering";

/**
 * Loads an image from a source URL/DataURI
 */
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

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
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  const aspectRatio = img.height / img.width;
  const rows = Math.round(cols * aspectRatio);

  canvas.width = cols;
  canvas.height = rows;

  // 0. Sampling Strategy
  if (samplingMode === 'default') {
     ctx.clearRect(0, 0, cols, rows);
     ctx.drawImage(img, 0, 0, cols, rows);
  } else {
     const fullCanvas = document.createElement('canvas');
     fullCanvas.width = img.width;
     fullCanvas.height = img.height;
     const fullCtx = fullCanvas.getContext('2d');
     if (fullCtx) {
        fullCtx.clearRect(0, 0, img.width, img.height);
        fullCtx.drawImage(img, 0, 0);
        const downsampledData = manualDownscale(fullCanvas, cols, rows, samplingMode);
        const iData = new ImageData(downsampledData as any, cols, rows);
        ctx.putImageData(iData, 0, 0);
     }
  }

  const imgData = ctx.getImageData(0, 0, cols, rows);
  const data = imgData.data;
  
  // 1. Extract Valid Pixels for Palette Generation
  const validPixels: RGB[] = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] >= 25) { // Skip transparent
      validPixels.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
    }
  }

  // 2. Generate Palette (RGB)
  let paletteRGB = quantize(validPixels, maxColors);

  // Apply Brand Constraint if selected
  const activeBrands = brands.filter(b => b !== 'none');
  
  if (activeBrands.length > 0) {
     let sourcePalette: BrandColor[] = [];
     if (activeBrands.includes('perler')) sourcePalette = [...sourcePalette, ...PERLER_PALETTE];
     if (activeBrands.includes('mard')) sourcePalette = [...sourcePalette, ...MARD_PALETTE];

     const excludedSet = new Set(excludedColors);
     sourcePalette = sourcePalette.filter(c => !excludedSet.has(colorToKey(c.rgb)));

     if (sourcePalette.length > 0) {
         const brandCandidates = sourcePalette.map(c => ({
             rgb: c.rgb,
             lab: rgbToLab(c.rgb),
             oklab: rgbToOklab(c.rgb)
         }));
         
         paletteRGB = paletteRGB.map(targetRGB => {
             let bestMatch = brandCandidates[0];
             let minDist = Infinity;
             
             if (colorMethod === 'lab-ciede2000') {
                 const targetLAB = rgbToLab(targetRGB);
                 for (const cand of brandCandidates) {
                     const dist = getCiede2000(targetLAB, cand.lab);
                     if (dist < minDist) {
                         minDist = dist;
                         bestMatch = cand;
                     }
                 }
             } else {
                 const targetOK = rgbToOklab(targetRGB);
                 for (const cand of brandCandidates) {
                     const dist = getEuclideanOKLab(targetOK, cand.oklab);
                     if (dist < minDist) {
                         minDist = dist;
                         bestMatch = cand;
                     }
                 }
             }
             return bestMatch.rgb;
         });
     }
  }

  // 3. Prepare Palette in Target Color Space for Mapping
  const paletteCache = paletteRGB.map(c => {
    return {
      rgb: c,
      lab: xyzToLab(rgbToXyz(c)),
      oklab: xyzToOklab(rgbToXyz(c))
    };
  });

  const finalColors: string[] = new Array(cols * rows).fill("transparent");

  // Local helper for mapping
  const findClosest = (r: number, g: number, b: number) => {
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

  // 4. Map Pixels (Apply Dithering)
  const processingData = new Float32Array(data.length);
  for(let i=0; i<data.length; i++) processingData[i] = data[i];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      
      if (processingData[i + 3] < 25) {
        finalColors[y * cols + x] = "transparent";
        continue;
      }

      let oldR = processingData[i];
      let oldG = processingData[i + 1];
      let oldB = processingData[i + 2];

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

      oldR = Math.max(0, Math.min(255, oldR));
      oldG = Math.max(0, Math.min(255, oldG));
      oldB = Math.max(0, Math.min(255, oldB));

      const newColor = findClosest(oldR, oldG, oldB);
      finalColors[y * cols + x] = colorToKey(newColor);

      if (ditherMethod === 'floyd-steinberg' || ditherMethod === 'atkinson') {
        const errR = oldR - newColor.r;
        const errG = oldG - newColor.g;
        const errB = oldB - newColor.b;

        const distributeError = (dx: number, dy: number, factor: number) => {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
            const ni = (ny * cols + nx) * 4;
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