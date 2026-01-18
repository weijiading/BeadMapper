import { RGB, LAB, OKLab } from "./types"; // 注意引用路径

// --- Helpers ---

export const colorToKey = (c: RGB) => `rgb(${c.r},${c.g},${c.b})`;

export const keyToColor = (key: string): RGB => {
  const match = key.match(/\d+/g);
  if (!match) return { r: 0, g: 0, b: 0 };
  const [r, g, b] = match.map(Number);
  return { r, g, b };
};

const degreesToRadians = (deg: number) => deg * (Math.PI / 180);

// --- Conversions ---

export const rgbToXyz = (c: RGB): { x: number; y: number; z: number } => {
  let r = c.r / 255;
  let g = c.g / 255;
  let b = c.b / 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  return {
    x: (r * 0.4124 + g * 0.3576 + b * 0.1805) * 100,
    y: (r * 0.2126 + g * 0.7152 + b * 0.0722) * 100,
    z: (r * 0.0193 + g * 0.1192 + b * 0.9505) * 100,
  };
};

export const xyzToLab = (xyz: { x: number; y: number; z: number }): LAB => {
  const refX = 95.047;
  const refY = 100.000;
  const refZ = 108.883;

  let x = xyz.x / refX;
  let y = xyz.y / refY;
  let z = xyz.z / refZ;

  x = x > 0.008856 ? Math.cbrt(x) : (7.787 * x) + (16 / 116);
  y = y > 0.008856 ? Math.cbrt(y) : (7.787 * y) + (16 / 116);
  z = z > 0.008856 ? Math.cbrt(z) : (7.787 * z) + (16 / 116);

  return {
    l: (116 * y) - 16,
    a: 500 * (x - y),
    b: 200 * (y - z),
  };
};

export const xyzToOklab = (xyz: { x: number; y: number; z: number }): OKLab => {
  const long = 0.8189330101 * (xyz.x/100) + 0.3618667424 * (xyz.y/100) - 0.1288597137 * (xyz.z/100);
  const medium = 0.0329845436 * (xyz.x/100) + 0.9293118715 * (xyz.y/100) + 0.0361456387 * (xyz.z/100);
  const short = 0.0482003018 * (xyz.x/100) + 0.2643662700 * (xyz.y/100) + 0.6338517070 * (xyz.z/100);

  const l_ = Math.cbrt(long);
  const m_ = Math.cbrt(medium);
  const s_ = Math.cbrt(short);

  return {
    L: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  };
};

export const rgbToLab = (c: RGB): LAB => xyzToLab(rgbToXyz(c));
export const rgbToOklab = (c: RGB): OKLab => xyzToOklab(rgbToXyz(c));

// --- Distance Metrics ---

export const getEuclideanRGB = (a: RGB, b: RGB) => {
  return Math.sqrt(Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2));
};

export const getEuclideanOKLab = (a: OKLab, b: OKLab) => {
  return Math.sqrt(Math.pow(a.L - b.L, 2) + Math.pow(a.a - b.a, 2) + Math.pow(a.b - b.b, 2));
};

export const getCiede2000 = (lab1: LAB, lab2: LAB): number => {
  const kL = 1, kC = 1, kH = 1;
  const { l: L1, a: a1, b: b1 } = lab1;
  const { l: L2, a: a2, b: b2 } = lab2;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const C_bar = (C1 + C2) / 2;

  const G = 0.5 * (1 - Math.sqrt(Math.pow(C_bar, 7) / (Math.pow(C_bar, 7) + Math.pow(25, 7))));
  const a1_prime = a1 * (1 + G);
  const a2_prime = a2 * (1 + G);

  const C1_prime = Math.sqrt(a1_prime * a1_prime + b1 * b1);
  const C2_prime = Math.sqrt(a2_prime * a2_prime + b2 * b2);

  const h1_prime = (Math.atan2(b1, a1_prime) * 180) / Math.PI;
  const h1_angle = h1_prime >= 0 ? h1_prime : h1_prime + 360;
  
  const h2_prime = (Math.atan2(b2, a2_prime) * 180) / Math.PI;
  const h2_angle = h2_prime >= 0 ? h2_prime : h2_prime + 360;

  const dL_prime = L2 - L1;
  const dC_prime = C2_prime - C1_prime;
  
  let dh_prime = 0;
  if (C1_prime * C2_prime === 0) {
    dh_prime = 0;
  } else if (Math.abs(h2_angle - h1_angle) <= 180) {
    dh_prime = h2_angle - h1_angle;
  } else if (h2_angle - h1_angle > 180) {
    dh_prime = h2_angle - h1_angle - 360;
  } else if (h2_angle - h1_angle < -180) {
    dh_prime = h2_angle - h1_angle + 360;
  }
  
  const dH_prime = 2 * Math.sqrt(C1_prime * C2_prime) * Math.sin(degreesToRadians(dh_prime / 2));

  const L_bar_prime = (L1 + L2) / 2;
  const C_bar_prime = (C1_prime + C2_prime) / 2;
  
  let h_bar_prime = 0;
  if (C1_prime * C2_prime === 0) {
    h_bar_prime = h1_angle + h2_angle;
  } else if (Math.abs(h1_angle - h2_angle) <= 180) {
    h_bar_prime = (h1_angle + h2_angle) / 2;
  } else if (Math.abs(h1_angle - h2_angle) > 180 && h1_angle + h2_angle < 360) {
    h_bar_prime = (h1_angle + h2_angle + 360) / 2;
  } else if (Math.abs(h1_angle - h2_angle) > 180 && h1_angle + h2_angle >= 360) {
    h_bar_prime = (h1_angle + h2_angle - 360) / 2;
  }

  const T = 1 - 0.17 * Math.cos(degreesToRadians(h_bar_prime - 30)) +
            0.24 * Math.cos(degreesToRadians(2 * h_bar_prime)) +
            0.32 * Math.cos(degreesToRadians(3 * h_bar_prime + 6)) -
            0.20 * Math.cos(degreesToRadians(4 * h_bar_prime - 63));

  const dTheta = 30 * Math.exp(-Math.pow((h_bar_prime - 275) / 25, 2));
  const R_C = 2 * Math.sqrt(Math.pow(C_bar_prime, 7) / (Math.pow(C_bar_prime, 7) + Math.pow(25, 7)));
  const S_L = 1 + (0.015 * Math.pow(L_bar_prime - 50, 2)) / Math.sqrt(20 + Math.pow(L_bar_prime - 50, 2));
  const S_C = 1 + 0.045 * C_bar_prime;
  const S_H = 1 + 0.015 * C_bar_prime * T;
  const R_T = -Math.sin(degreesToRadians(2 * dTheta)) * R_C;

  return Math.sqrt(
    Math.pow(dL_prime / (kL * S_L), 2) +
    Math.pow(dC_prime / (kC * S_C), 2) +
    Math.pow(dH_prime / (kH * S_H), 2) +
    R_T * (dC_prime / (kC * S_C)) * (dH_prime / (kH * S_H))
  );
};