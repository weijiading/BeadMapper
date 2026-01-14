import React, { useEffect, useRef, useMemo } from 'react';

interface PixelCanvasProps {
  colors: string[];
  rows: number;
  cols: number;
  showGrid: boolean;
  showNumbers: boolean;
  showMajorGrid: boolean;
  cellShape: 'square' | 'circle' | 'hexagon';
  cellSize?: number; // Size of export/render pixel
  showColorCodes?: boolean; // New: Show color palette ID inside cell
  colorLabels?: Record<string, string>; // New: Custom labels for colors (e.g. Brand IDs)
  showAllAxisNumbers?: boolean; // New: Show every number on axis (1,2,3...)
  fitContainer?: boolean; // New: Whether to scale to fit container
  isInteractable?: boolean; // New: If false, disables painting interactions (useful for panning)
  highlightColor?: string | null; // New: If set, outlines matching colors
  pegboardSize?: number; // New: Size of the physical pegboard (e.g. 52 or 104)
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
  onPixelPaint?: (index: number) => void; // Left click/drag interaction
  onPixelRightClick?: (index: number) => void; // Right click interaction
  onPixelHover?: (index: number | null) => void; // Hover interaction
  onStrokeStart?: () => void; // New: Called when a paint stroke begins (mouse down)
}

const OFFSET = 2; // Fixed indent to center design on boards and avoid edge clipping

const getContrastColor = (color: string) => {
  if (color === 'transparent') return '#000000';
  let r = 0, g = 0, b = 0;
  
  if (color.startsWith('rgb')) {
    const match = color.match(/\d+/g);
    if (match) {
      [r, g, b] = match.map(Number);
    }
  } else if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      }
  } else {
    // Default to black text if unknown
    return '#000000';
  }
  
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
};

const PixelCanvas: React.FC<PixelCanvasProps> = ({
  colors,
  rows,
  cols,
  showGrid,
  showNumbers,
  showMajorGrid,
  cellShape,
  cellSize = 20,
  showColorCodes = false,
  colorLabels,
  showAllAxisNumbers = false,
  fitContainer = true,
  isInteractable = true,
  highlightColor = null,
  pegboardSize = 52,
  onCanvasReady,
  onPixelPaint,
  onPixelRightClick,
  onPixelHover,
  onStrokeStart
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Interaction state
  const isDrawing = useRef(false);
  const activePointerId = useRef<number | null>(null);

  // Calculate padding based on props (Used for both drawing and background alignment)
  const paddingLeft = showNumbers ? (showAllAxisNumbers ? 50 : 40) : 0;
  const paddingTop = showNumbers ? (showAllAxisNumbers ? 50 : 40) : 0;

  // Calculate Total Canvas Size based on Pegboard Logic
  // We need enough boards to hold (OFFSET + image dim)
  // If cols=40, offset=2 -> 42. 42/52 -> 1 board.
  // If cols=51, offset=2 -> 53. 53/52 -> 2 boards.
  const totalBoardsX = Math.max(1, Math.ceil((cols + OFFSET) / pegboardSize));
  const totalBoardsY = Math.max(1, Math.ceil((rows + OFFSET) / pegboardSize));
  
  const totalCols = totalBoardsX * pegboardSize;
  const totalRows = totalBoardsY * pegboardSize;

  // Memoize color map for O(1) lookup
  const colorMap = useMemo(() => {
    // Exclude transparent from ID generation
    const unique = Array.from(new Set(colors.filter(c => c !== 'transparent')));
    const map = new Map<string, string>();
    unique.forEach((c: string, i) => {
        if (colorLabels && colorLabels[c]) {
            map.set(c, colorLabels[c]);
        } else {
            map.set(c, (i + 1).toString());
        }
    });
    return map;
  }, [colors, colorLabels]);

  // Helper for hexagon drawing
  const drawHexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
          ctx.lineTo(x + r * Math.cos(Math.PI / 3 * i), y + r * Math.sin(Math.PI / 3 * i));
      }
      ctx.closePath();
  };

  // Update canvas logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasWidth = (totalCols * cellSize) + paddingLeft;
    const canvasHeight = (totalRows * cellSize) + paddingTop;

    // Set high resolution for crisp rendering
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear Background (Transparent)
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    ctx.save();
    ctx.translate(paddingLeft, paddingTop);

    // 1. Draw Pixels (With Offset)
    colors.forEach((color, index) => {
        // Skip transparent pixels entirely to let background show
        if (color === 'transparent') {
             return;
        }

        // Map image index to canvas grid coordinates with OFFSET
        const imgX = index % cols;
        const imgY = Math.floor(index / cols);
        
        const canvasX = imgX + OFFSET;
        const canvasY = imgY + OFFSET;

        const x = canvasX * cellSize;
        const y = canvasY * cellSize;

        ctx.fillStyle = color;

        if (cellShape === 'circle') {
            ctx.beginPath();
            ctx.arc(x + cellSize/2, y + cellSize/2, cellSize/2 - 0.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (cellShape === 'hexagon') {
            drawHexagon(ctx, x + cellSize/2, y + cellSize/2, cellSize/2 - 0.5);
            ctx.fill();
        } else {
            // Square
            ctx.fillRect(x, y, cellSize, cellSize);
        }
    });

    // 2. Draw Color IDs
    if (showColorCodes) {
        colors.forEach((color, index) => {
             if (color === 'transparent') return;
             
             const imgX = index % cols;
             const imgY = Math.floor(index / cols);
             const x = (imgX + OFFSET) * cellSize;
             const y = (imgY + OFFSET) * cellSize;
             
             const id = colorMap.get(color);
             
             if (id) {
                ctx.fillStyle = getContrastColor(color);
                ctx.font = `bold ${Math.max(8, cellSize * 0.4)}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(id, x + cellSize/2, y + cellSize/2);
             }
        });
    }

    // 3. Draw Grid Lines
    if (showGrid) {
        // Helper to set line styles based on index
        const applyLineStyle = (index: number, isMajorAxis: boolean) => {
            // Pegboard Seams (Priority 1) - Blue thick lines
            if (index > 0 && index % pegboardSize === 0) {
                ctx.strokeStyle = '#4f46e5'; // Indigo-600
                ctx.lineWidth = 2.5;
                ctx.setLineDash([]);
                return;
            }

            if (index === 0 || !showMajorGrid) {
                // Default grid or border
                ctx.strokeStyle = '#cbd5e1'; // Slate-300
                ctx.lineWidth = 1;
                ctx.setLineDash([]);
                return;
            }

            if (index % 10 === 0) {
                // 10, 20, 30... Solid Red
                ctx.strokeStyle = '#ef4444'; // Red-500
                ctx.lineWidth = 1.5;
                ctx.setLineDash([]);
            } else if (index % 5 === 0) {
                // 5, 15, 25... Dashed Red
                ctx.strokeStyle = '#ef4444'; // Red-500
                ctx.lineWidth = 1.5;
                ctx.setLineDash([4, 3]); // Dash pattern
            } else {
                // Standard grid
                ctx.strokeStyle = '#e2e8f0';
                ctx.lineWidth = 1;
                ctx.setLineDash([]);
            }
        };

        // Vertical lines (Iterate over TOTAL cols)
        for (let i = 0; i <= totalCols; i++) {
            applyLineStyle(i, true);
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, totalRows * cellSize);
            ctx.stroke();
        }

        // Horizontal lines (Iterate over TOTAL rows)
        for (let i = 0; i <= totalRows; i++) {
            applyLineStyle(i, false);
            ctx.beginPath();
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(totalCols * cellSize, i * cellSize);
            ctx.stroke();
        }
        
        // Reset dashed state for safety
        ctx.setLineDash([]);
    }

    // 4. Draw Highlight Overlay (Selection Border)
    if (highlightColor && highlightColor !== 'transparent') {
        colors.forEach((color, index) => {
            if (color === highlightColor) {
                const imgX = index % cols;
                const imgY = Math.floor(index / cols);
                const x = (imgX + OFFSET) * cellSize;
                const y = (imgY + OFFSET) * cellSize;
                
                // Layer 1: White outer/inner
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'; 
                ctx.lineWidth = 2.5;
                ctx.setLineDash([3, 3]);
                
                if (cellShape === 'circle') {
                    ctx.beginPath();
                    ctx.arc(x + cellSize/2, y + cellSize/2, cellSize/2 - 1, 0, Math.PI * 2);
                    ctx.stroke();
                } else if (cellShape === 'hexagon') {
                    drawHexagon(ctx, x + cellSize/2, y + cellSize/2, cellSize/2 - 1);
                    ctx.stroke();
                } else {
                    ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
                }

                // Layer 2: Black contrast
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)'; 
                ctx.lineWidth = 2.5;
                ctx.setLineDash([3, 3]); 
                ctx.lineDashOffset = 3;

                if (cellShape === 'circle') {
                    ctx.beginPath();
                    ctx.arc(x + cellSize/2, y + cellSize/2, cellSize/2 - 1, 0, Math.PI * 2);
                    ctx.stroke();
                } else if (cellShape === 'hexagon') {
                    drawHexagon(ctx, x + cellSize/2, y + cellSize/2, cellSize/2 - 1);
                    ctx.stroke();
                } else {
                    ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
                }
                
                ctx.setLineDash([]);
                ctx.lineDashOffset = 0;
            }
        });
    }

    ctx.restore();

    // 5. Draw Axis Numbers (Based on TOTAL grid)
    if (showNumbers) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasWidth, paddingTop); 
        ctx.fillRect(0, 0, paddingLeft, canvasHeight); 

        ctx.fillStyle = '#64748b'; 
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Top Numbers (Columns)
        for (let i = 0; i < totalCols; i++) {
            if (showAllAxisNumbers || (i + 1) % 5 === 0 || i === 0 || i % pegboardSize === 0) {
                 const x = paddingLeft + (i * cellSize) + (cellSize / 2);
                 const y = paddingTop / 2;
                 
                 // Highlight numbers at start of new boards
                 if (i % pegboardSize === 0 && i > 0) ctx.fillStyle = '#4f46e5';
                 else ctx.fillStyle = '#64748b';

                 ctx.fillText((i + 1).toString(), x, y);
            }
        }

        // Left Numbers (Rows)
        for (let i = 0; i < totalRows; i++) {
            if (showAllAxisNumbers || (i + 1) % 5 === 0 || i === 0 || i % pegboardSize === 0) {
                 const x = paddingLeft / 2;
                 const y = paddingTop + (i * cellSize) + (cellSize / 2);

                 if (i % pegboardSize === 0 && i > 0) ctx.fillStyle = '#4f46e5';
                 else ctx.fillStyle = '#64748b';

                 ctx.fillText((i + 1).toString(), x, y);
            }
        }
    }

    if (onCanvasReady) {
        onCanvasReady(canvas);
    }

  }, [colors, rows, cols, showGrid, showNumbers, showMajorGrid, cellShape, cellSize, showColorCodes, showAllAxisNumbers, colorMap, onCanvasReady, highlightColor, paddingLeft, paddingTop, pegboardSize, totalCols, totalRows]);

  // Interaction Handlers (Modified for Offset)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isInteractable) return;
      
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (e.button === 2) { 
          e.preventDefault();
          if (onStrokeStart) onStrokeStart();
          handleInteraction(e, true);
          return;
      }

      if (onStrokeStart) onStrokeStart();

      isDrawing.current = true;
      activePointerId.current = e.pointerId;
      canvas.setPointerCapture(e.pointerId);
      handleInteraction(e, false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      let hoveredIndex: number | null = null;

      if (x >= paddingLeft && y >= paddingTop) {
          const gridX = Math.floor((x - paddingLeft) / cellSize);
          const gridY = Math.floor((y - paddingTop) / cellSize);

          // Calculate Image Coordinates (reverse offset)
          const imgX = gridX - OFFSET;
          const imgY = gridY - OFFSET;

          // Check if within Image bounds
          if (imgX >= 0 && imgX < cols && imgY >= 0 && imgY < rows) {
              hoveredIndex = imgY * cols + imgX;
          }
      }

      if (onPixelHover) {
          onPixelHover(hoveredIndex);
      }

      if (!isInteractable) return;
      if (isDrawing.current) {
          if (hoveredIndex !== null) {
              if (onPixelPaint) onPixelPaint(hoveredIndex);
          }
      }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isInteractable) return;
      isDrawing.current = false;
      if (activePointerId.current !== null) {
          canvasRef.current?.releasePointerCapture(activePointerId.current);
          activePointerId.current = null;
      }
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (onPixelHover) onPixelHover(null);
      handlePointerUp(e);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
      if (!isInteractable) return;
      e.preventDefault();
  };

  const handleInteraction = (e: React.PointerEvent | React.MouseEvent, isRightClick: boolean) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const x = ((e as React.MouseEvent).clientX - rect.left) * scaleX;
      const y = ((e as React.MouseEvent).clientY - rect.top) * scaleY;

      if (x < paddingLeft || y < paddingTop) return;

      const gridX = Math.floor((x - paddingLeft) / cellSize);
      const gridY = Math.floor((y - paddingTop) / cellSize);

      // Map back to image space
      const imgX = gridX - OFFSET;
      const imgY = gridY - OFFSET;

      if (imgX >= 0 && imgX < cols && imgY >= 0 && imgY < rows) {
          const index = imgY * cols + imgX;
          if (isRightClick) {
              if (onPixelRightClick) onPixelRightClick(index);
          } else {
              if (onPixelPaint) onPixelPaint(index);
          }
      }
  };

  const checkerboardStyle = useMemo(() => {
    const doubleSize = cellSize * 2;
    return {
      backgroundImage: `
          linear-gradient(45deg, #e2e8f0 25%, transparent 25%), 
          linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), 
          linear-gradient(45deg, transparent 75%, #e2e8f0 75%), 
          linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)
      `,
      backgroundSize: `${doubleSize}px ${doubleSize}px`,
      backgroundPosition: `
          ${paddingLeft}px ${paddingTop}px, 
          ${paddingLeft}px ${paddingTop + cellSize}px, 
          ${paddingLeft + cellSize}px ${paddingTop - cellSize}px, 
          ${paddingLeft - cellSize}px ${paddingTop}px
      `,
      backgroundColor: '#f8fafc'
    };
  }, [cellSize, paddingLeft, paddingTop]);

  return (
    <div 
        ref={containerRef} 
        className={`flex items-center justify-center ${fitContainer ? 'w-full h-full overflow-auto p-4' : 'relative'}`}
        style={{ touchAction: isInteractable ? 'none' : 'auto' }}
    >
        <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
            onContextMenu={handleContextMenu}
            style={{ 
                ...checkerboardStyle, 
                maxWidth: fitContainer ? '100%' : undefined,
                maxHeight: fitContainer ? '100%' : undefined,
                objectFit: 'contain',
                imageRendering: 'pixelated',
            }}
            className="block shadow-sm"
        />
    </div>
  );
};

export default PixelCanvas;