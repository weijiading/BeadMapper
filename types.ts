
export type ToolMode = 'brush' | 'eraser' | 'pan';

export interface ViewportTransform {
  x: number;
  y: number;
  scale: number;
}

export interface Point {
  x: number;
  y: number;
}
