export type RGB = { r: number; g: number; b: number };
export type LAB = { l: number; a: number; b: number };
export type OKLab = { L: number; a: number; b: number };

// 确保这些类型定义与你的项目路径一致，如果 types 文件夹在别处，请保留原有引用
// 这里为了完整性保留了本地定义，如果你的项目中 @/types 已经有了，可以删掉下面这些
export type ColorMethod = 'lab-ciede2000' | 'oklab';
export type DitherMethod = 'none' | 'bayer' | 'floyd-steinberg' | 'atkinson' | 'blue-noise';
export type SamplingMode = 'default' | 'average' | 'cartoon';
export type BrandType = 'perler' | 'mard' | 'none'; // 根据你的实际业务调整