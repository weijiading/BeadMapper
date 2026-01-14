/**
 * 这个工具函数用于在浏览器端通过 Canvas 裁剪图片
 * 支持旋转和偏移
 */

export const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues
      image.src = url;
    });
  
  export function getRadianAngle(degreeValue: number) {
    return (degreeValue * Math.PI) / 180;
  }
  
  /**
   * 返回旋转后的矩形新边界
   */
  export function rotateSize(width: number, height: number, rotation: number) {
    const rotRad = getRadianAngle(rotation);
  
    return {
      width:
        Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
      height:
        Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
  }
  
  /**
   * 核心裁剪函数
   * @param imageSrc 图片源地址
   * @param pixelCrop 裁剪区域（像素单位）
   * @param rotation 旋转角度
   * @param flip 翻转状态
   * @param offset 额外的偏移量（处理 Canvas Padding）
   */
  export default async function getCroppedImg(
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    rotation = 0,
    flip = { horizontal: false, vertical: false },
    offset = { x: 0, y: 0 }
  ): Promise<string | null> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
  
    if (!ctx) {
      return null;
    }
  
    const rotRad = getRadianAngle(rotation);
  
    // calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
      image.width,
      image.height,
      rotation
    );
  
    // set canvas size to match the bounding box
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;
  
    // translate canvas context to a central location to allow rotating and flipping around the center
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
    ctx.translate(-image.width / 2, -image.height / 2);
  
    // draw rotated image
    ctx.drawImage(image, 0, 0);
  
    // croppedAreaPixels values are bounding box relative
    // extract the cropped image using these values
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = pixelCrop.width;
    finalCanvas.height = pixelCrop.height;
  
    const finalCtx = finalCanvas.getContext('2d');
  
    if (!finalCtx) {
      return null;
    }
  
    // Draw the full (rotated) canvas onto the final canvas with the correct offset
    // The offset represents where the image sits relative to the crop container's 0,0
    const drawX = offset.x - pixelCrop.x;
    const drawY = offset.y - pixelCrop.y;
  
    finalCtx.drawImage(canvas, drawX, drawY);
  
    // As Base64 string - Use PNG to preserve transparency
    return finalCanvas.toDataURL('image/png');
  }