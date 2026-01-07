import React, { useEffect } from 'react';

interface CanvasLayerProps {
  image: HTMLImageElement;
  bgRef: React.RefObject<HTMLCanvasElement | null>;
  maskRef: React.RefObject<HTMLCanvasElement | null>;
}

export const CanvasLayer: React.FC<CanvasLayerProps> = ({ image, bgRef, maskRef }) => {
  
  // --- 关键逻辑：当图片加载或变化时，执行绘画动作 ---
  useEffect(() => {
    const bgCanvas = bgRef.current;
    if (bgCanvas && image) {
      const ctx = bgCanvas.getContext('2d');
      if (ctx) {
        // 清除旧内容并画上新图
        ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        ctx.drawImage(image, 0, 0);
      }
    }
  }, [image, bgRef]); // 依赖 image，当图片上传更新时，这里会重新触发
  // --------------------------------------------

  return (
    <div className="relative" style={{ width: image.width, height: image.height }}>
      {/* 背景层：显示图片 */}
      <canvas
        ref={bgRef}
        width={image.width}
        height={image.height}
        className="block"
      />
      {/* 遮罩层：显示绿色的笔触 */}
      <canvas
        ref={maskRef}
        width={image.width}
        height={image.height}
        className="absolute top-0 left-0"
      />
    </div>
  );
};