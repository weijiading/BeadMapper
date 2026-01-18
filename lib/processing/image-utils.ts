import { SamplingMode } from "./types";
import { manualDownscale } from "./downscaling";

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

/**
 * Creates a canvas and returns its context and initialized data.
 * Handles the logic of downscaling or direct drawing.
 */
export const getImageData = (
  img: HTMLImageElement,
  cols: number,
  rows: number,
  samplingMode: SamplingMode
): { ctx: CanvasRenderingContext2D; imgData: ImageData } => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  canvas.width = cols;
  canvas.height = rows;

  if (samplingMode === 'default') {
    ctx.clearRect(0, 0, cols, rows);
    ctx.drawImage(img, 0, 0, cols, rows);
  } else {
    // Advanced downscaling
    const fullCanvas = document.createElement('canvas');
    fullCanvas.width = img.width;
    fullCanvas.height = img.height;
    const fullCtx = fullCanvas.getContext('2d');
    if (fullCtx) {
      fullCtx.clearRect(0, 0, img.width, img.height);
      fullCtx.drawImage(img, 0, 0);
      const downsampledData = manualDownscale(fullCanvas, cols, rows, samplingMode);
      // Create new ImageData from the Uint8ClampedArray
      const iData = new ImageData(downsampledData as any, cols, rows);
      ctx.putImageData(iData, 0, 0);
    }
  }

  return { ctx, imgData: ctx.getImageData(0, 0, cols, rows) };
};