
import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState, useCallback } from 'react';

interface DrawingCanvasProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  lineWidth?: number;
}

export interface DrawingCanvasRef {
  exportAsDataURL: () => string;
  clearCanvas: () => void;
  hasBeenDrawnOn: () => boolean;
}

const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  ({ width = 400, height = 200, strokeColor = '#FFFFFF', lineWidth = 3 }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
    const [hasDrawn, setHasDrawn] = useState(false);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = lineWidth;
          // Set a background color
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          setContext(ctx);
        }
      }
    }, [strokeColor, lineWidth]);

    const startDrawing = useCallback((event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!context) return;
      const { offsetX, offsetY } = getCoords(event);
      context.beginPath();
      context.moveTo(offsetX, offsetY);
      setIsDrawing(true);
    }, [context]);

    const finishDrawing = useCallback(() => {
      if (!context) return;
      context.closePath();
      setIsDrawing(false);
    }, [context]);

    const draw = useCallback((event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !context) return;
      setHasDrawn(true);
      const { offsetX, offsetY } = getCoords(event);
      context.lineTo(offsetX, offsetY);
      context.stroke();
    }, [isDrawing, context]);

    const getCoords = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { offsetX: 0, offsetY: 0 };
        const rect = canvas.getBoundingClientRect();
        if ('touches' in event.nativeEvent) {
             return {
                offsetX: event.nativeEvent.touches[0].clientX - rect.left,
                offsetY: event.nativeEvent.touches[0].clientY - rect.top,
             };
        }
        return {
            offsetX: event.nativeEvent.offsetX,
            offsetY: event.nativeEvent.offsetY
        };
    };

    useImperativeHandle(ref, () => ({
      exportAsDataURL: () => {
        const canvas = canvasRef.current;
        return canvas ? canvas.toDataURL('image/png') : '';
      },
      clearCanvas: () => {
        const canvas = canvasRef.current;
        if (canvas && context) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.fillStyle = 'rgba(255, 255, 255, 0.1)';
          context.fillRect(0, 0, canvas.width, canvas.height);
          setHasDrawn(false);
        }
      },
      hasBeenDrawnOn: () => hasDrawn,
    }));

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        onMouseLeave={finishDrawing}
        onTouchStart={startDrawing}
        onTouchEnd={finishDrawing}
        onTouchMove={draw}
        className="rounded-lg border-2 border-white/30 cursor-crosshair touch-none"
        style={{ width: '100%', height: 'auto', aspectRatio: `${width}/${height}` }}
      />
    );
  }
);

DrawingCanvas.displayName = 'DrawingCanvas';
export default DrawingCanvas;