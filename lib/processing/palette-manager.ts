import { PERLER_PALETTE, MARD_PALETTE, BrandColor } from "@/lib/constants/palettes";
import { BrandType, ColorMethod } from "./types";
import { RGB, LAB, OKLab } from "./types";
import { colorToKey, rgbToLab, rgbToOklab, getCiede2000, getEuclideanOKLab, keyToColor, xyzToLab, xyzToOklab, rgbToXyz } from "./colors";

// 缓存后的调色板颜色接口
export interface CachedPaletteColor {
  rgb: RGB;
  lab: LAB;
  oklab: OKLab;
}

/**
 * 根据选定的品牌和排除列表，生成最终的候选颜色列表
 */
export const getActiveBrandPalette = (
  brands: BrandType[],
  excludedColors: string[]
): BrandColor[] => {
  const activeBrands = brands.filter(b => b !== 'none');
  if (activeBrands.length === 0) return [];

  let sourcePalette: BrandColor[] = [];
  if (activeBrands.includes('perler')) sourcePalette = [...sourcePalette, ...PERLER_PALETTE];
  if (activeBrands.includes('mard')) sourcePalette = [...sourcePalette, ...MARD_PALETTE];

  const excludedSet = new Set(excludedColors);
  return sourcePalette.filter(c => !excludedSet.has(colorToKey(c.rgb)));
};

/**
 * 将量化后的颜色映射到最近的品牌颜色
 */
export const mapPaletteToBrands = (
  basePaletteRGB: RGB[],
  brandCandidates: BrandColor[],
  colorMethod: ColorMethod
): RGB[] => {
  if (brandCandidates.length === 0) return basePaletteRGB;

  // 预计算品牌颜色的 LAB/OKLab 以提高性能
  const candidateCache = brandCandidates.map(c => ({
    rgb: c.rgb,
    lab: rgbToLab(c.rgb),
    oklab: rgbToOklab(c.rgb)
  }));

  return basePaletteRGB.map(targetRGB => {
    let bestMatch = candidateCache[0];
    let minDist = Infinity;

    if (colorMethod === 'lab-ciede2000') {
      const targetLAB = rgbToLab(targetRGB);
      for (const cand of candidateCache) {
        const dist = getCiede2000(targetLAB, cand.lab);
        if (dist < minDist) {
          minDist = dist;
          bestMatch = cand;
        }
      }
    } else {
      const targetOK = rgbToOklab(targetRGB);
      for (const cand of candidateCache) {
        const dist = getEuclideanOKLab(targetOK, cand.oklab);
        if (dist < minDist) {
          minDist = dist;
          bestMatch = cand;
        }
      }
    }
    return bestMatch.rgb;
  });
};

/**
 * 准备最终用于快速查找的缓存色板
 */
export const createLookupPalette = (colors: RGB[]): CachedPaletteColor[] => {
  return colors.map(c => ({
    rgb: c,
    lab: xyzToLab(rgbToXyz(c)),
    oklab: xyzToOklab(rgbToXyz(c))
  }));
};

/**
 * UI使用：查找单个颜色最近的匹配项
 */
export const findClosestPaletteColor = (
  targetColorStr: string,
  candidates: BrandColor[],
  method: ColorMethod = 'lab-ciede2000'
): BrandColor | null => {
  if (targetColorStr === 'transparent') return null;
  
  let targetRGB: RGB;
  
  if (targetColorStr.startsWith('#')) {
    const hex = targetColorStr.replace('#', '');
    targetRGB = {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16)
    };
  } else if (targetColorStr.startsWith('rgb')) {
    targetRGB = keyToColor(targetColorStr);
  } else {
    return null;
  }

  let bestMatch = candidates[0];
  let minDist = Infinity;
  
  const targetLAB = rgbToLab(targetRGB);
  const targetOK = rgbToOklab(targetRGB);

  for (const cand of candidates) {
    let dist = 0;
    if (method === 'lab-ciede2000') {
      const candLAB = rgbToLab(cand.rgb);
      dist = getCiede2000(targetLAB, candLAB);
    } else {
      const candOK = rgbToOklab(cand.rgb);
      dist = getEuclideanOKLab(targetOK, candOK);
    }

    if (dist < minDist) {
      minDist = dist;
      bestMatch = cand;
    }
  }
  
  return bestMatch;
}