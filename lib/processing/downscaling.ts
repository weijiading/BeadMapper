import { SamplingMode } from "@/types";

export const manualDownscale = (
  sourceCanvas: HTMLCanvasElement,
  cols: number,
  rows: number,
  mode: SamplingMode
): Uint8ClampedArray => {
  const srcCtx = sourceCanvas.getContext('2d');
  if (!srcCtx) throw new Error("Context lost");
  
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;
  const srcData = srcCtx.getImageData(0, 0, w, h);
  
  const outputBuffer = new Uint8ClampedArray(cols * rows * 4);
  const blockWidth = w / cols;
  const blockHeight = h / rows;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
       let startX = Math.floor(x * blockWidth);
       let startY = Math.floor(y * blockHeight);
       let endX = Math.floor((x + 1) * blockWidth);
       let endY = Math.floor((y + 1) * blockHeight);
       
       if (endX <= startX) {
           startX = Math.floor((x + 0.5) * blockWidth);
           endX = startX + 1;
       }
       if (endY <= startY) {
           startY = Math.floor((y + 0.5) * blockHeight);
           endY = startY + 1;
       }
       
       let totalPixels = 0;
       let rSum = 0, gSum = 0, bSum = 0, aSum = 0;
       
       let colorMap: Record<string, number> = {};
       let darkPixelCount = 0;

       for (let py = startY; py < endY; py++) {
         for (let px = startX; px < endX; px++) {
            if (px >= w || py >= h) continue;
            
            const i = (py * w + px) * 4;
            const r = srcData.data[i];
            const g = srcData.data[i+1];
            const b = srcData.data[i+2];
            const a = srcData.data[i+3];
            
            totalPixels++;
            
            if (mode === 'average') {
              rSum += r;
              gSum += g;
              bSum += b;
              aSum += a;
            } else if (mode === 'cartoon') {
              if (a < 25) continue; 
              
              if ((r + g + b) < 100) {
                 darkPixelCount++;
              }
              const key = `${Math.round(r/10)*10},${Math.round(g/10)*10},${Math.round(b/10)*10}`;
              colorMap[key] = (colorMap[key] || 0) + 1;
            }
         }
       }

       let finalR = 255, finalG = 255, finalB = 255, finalA = 0;

       if (totalPixels > 0) {
          if (mode === 'average') {
             finalR = Math.round(rSum / totalPixels);
             finalG = Math.round(gSum / totalPixels);
             finalB = Math.round(bSum / totalPixels);
             finalA = Math.round(aSum / totalPixels);
          } else if (mode === 'cartoon') {
             finalA = 255;
             if (darkPixelCount / totalPixels > 0.15) {
                finalR = 0; finalG = 0; finalB = 0;
             } else {
                let maxCount = 0;
                let bestKey = "";
                for (const k in colorMap) {
                   if (colorMap[k] > maxCount) {
                      maxCount = colorMap[k];
                      bestKey = k;
                   }
                }
                
                if (bestKey) {
                   const [r, g, b] = bestKey.split(',').map(Number);
                   finalR = r; finalG = g; finalB = b;
                } else {
                   finalA = 0;
                }
             }
          }
       }

       const targetIndex = (y * cols + x) * 4;
       outputBuffer[targetIndex] = finalR;
       outputBuffer[targetIndex + 1] = finalG;
       outputBuffer[targetIndex + 2] = finalB;
       outputBuffer[targetIndex + 3] = finalA;
    }
  }

  return outputBuffer;
}