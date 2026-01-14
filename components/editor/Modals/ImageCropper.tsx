import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css'; // 务必引入 CSS
import { Square, RectangleHorizontal, RectangleVertical, Layout, Image as ImageIcon, ZoomIn, ZoomOut } from 'lucide-react';
// 请确保此路径下有 cropUtils 文件，或者根据你的实际结构调整路径
import getCroppedImg from '@/lib/cropUtils'; 

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

const CANVAS_PADDING = 50;

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [zoom, setZoom] = useState(1);

  const imgRef = useRef<HTMLImageElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const containerWidth = width + (CANVAS_PADDING * 2);
    const containerHeight = height + (CANVAS_PADDING * 2);

    if (aspect) {
      setCrop(centerAspectCrop(containerWidth, containerHeight, aspect));
    } else {
      setCrop({
        unit: 'px',
        width: width,
        height: height,
        x: CANVAS_PADDING,
        y: CANVAS_PADDING
      });
    }
  };

  const handleFinish = async () => {
    if (completedCrop && imgRef.current) {
      const image = imgRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      
      const pixelCrop = {
        x: completedCrop.x * scaleX,
        y: completedCrop.y * scaleY,
        width: completedCrop.width * scaleX,
        height: completedCrop.height * scaleY,
      };

      const offset = {
        x: CANVAS_PADDING * scaleX,
        y: CANVAS_PADDING * scaleY
      };

      try {
        const croppedImage = await getCroppedImg(
          imageSrc,
          pixelCrop,
          0,
          { horizontal: false, vertical: false },
          offset
        );
        if (croppedImage) {
          onCropComplete(croppedImage);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = -e.deltaY * 0.001;
    setZoom(z => Math.max(0.1, Math.min(5, z + delta)));
  };

  useEffect(() => {
    if (imgRef.current && aspect) {
      const width = imgRef.current.width + (CANVAS_PADDING * 2);
      const height = imgRef.current.height + (CANVAS_PADDING * 2);
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }, [aspect]);

  const ratios = [
    { label: 'Original', value: imgRef.current ? imgRef.current.naturalWidth / imgRef.current.naturalHeight : undefined, icon: ImageIcon },
    { label: '1:1', value: 1, icon: Square },
    { label: '4:3', value: 4 / 3, icon: RectangleHorizontal },
    { label: '3:4', value: 3 / 4, icon: RectangleVertical },
    { label: 'Free', value: undefined, icon: Layout },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="h-16 px-6 border-b flex items-center justify-between bg-white z-10">
        <h2 className="text-lg font-bold text-slate-800">Crop & Adjust</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
            <button onClick={() => setZoom(z => Math.max(0.1, z - 0.2))} className="p-1 hover:text-indigo-600">
              <ZoomOut size={18} />
            </button>
            <span className="text-xs font-medium w-12 text-center text-slate-600">
              {Math.round(zoom * 100)}%
            </span>
            <button onClick={() => setZoom(z => Math.min(5, z + 0.2))} className="p-1 hover:text-indigo-600">
              <ZoomIn size={18} />
            </button>
          </div>
          <div className="w-px h-6 bg-slate-200" />
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Cropper Container */}
      <div 
        className="flex-1 relative overflow-hidden flex items-center justify-center p-8 bg-slate-900"
        onWheel={handleWheel}
        style={{
          backgroundImage: `
            linear-gradient(45deg, #1e293b 25%, transparent 25%), 
            linear-gradient(-45deg, #1e293b 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #1e293b 75%), 
            linear-gradient(-45deg, transparent 75%, #1e293b 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          backgroundColor: '#0f172a'
        }}
      >
        <div 
          style={{ 
            transform: `scale(${zoom})`, 
            transformOrigin: 'center',
            transition: 'transform 0.1s ease-out'
          }}
          className="shadow-2xl"
        >
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            style={{ maxHeight: 'none', maxWidth: 'none' }}
          >
            {/* Padding Wrapper */}
            <div ref={wrapperRef} style={{ padding: `${CANVAS_PADDING}px`, backgroundColor: 'transparent' }}>
              <img
                ref={imgRef}
                alt="Crop me"
                src={imageSrc}
                onLoad={onImageLoad}
                style={{ 
                  maxHeight: '70vh', 
                  maxWidth: '70vw', 
                  objectFit: 'contain',
                  display: 'block' 
                }}
              />
            </div>
          </ReactCrop>
        </div>
      </div>

      {/* Controls Footer */}
      <div className="h-auto py-4 px-6 bg-white border-t flex flex-col gap-4">
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Ratio</span>
          {ratios.map((r, i) => (
            <button
              key={r.label + i}
              onClick={() => setAspect(r.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                (r.value === undefined && aspect === undefined) || (r.value !== undefined && aspect && Math.abs(aspect - r.value) < 0.01)
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <r.icon size={16} />
              {r.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-xs text-slate-400">
            Scroll to zoom · Drag handles to resize · Drag outside image allowed
          </p>
          <div className="flex items-center gap-3">
            <button 
              onClick={onCancel}
              className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleFinish}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7" />
              </svg>
              Crop & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;