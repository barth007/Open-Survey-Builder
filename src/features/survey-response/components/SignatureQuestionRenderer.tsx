import React, { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { SignatureAnswerValue } from '@/types/survey';

interface SignatureQuestionRendererProps {
  value?: SignatureAnswerValue;
  onChange: (value: SignatureAnswerValue) => void;
}

export const SignatureQuestionRenderer: React.FC<SignatureQuestionRendererProps> = ({
  value,
  onChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.scale(ratio, ratio);
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = '#111111';

    if (value?.dataUrl) {
      const image = new Image();
      image.onload = () => {
        context.clearRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
      };
      image.src = value.dataUrl;
    } else {
      context.clearRect(0, 0, width, height);
    }

    setIsReady(true);
  }, [value?.dataUrl]);

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { x: 0, y: 0 };
    }

    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!canvas || !context) {
      return;
    }

    const point = getPoint(event);
    isDrawingRef.current = true;
    context.beginPath();
    context.moveTo(point.x, point.y);
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!canvas || !context || !isDrawingRef.current) {
      return;
    }

    const point = getPoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
  };

  const finishDrawing = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!canvas || !context || !isDrawingRef.current) {
      return;
    }

    isDrawingRef.current = false;
    onChange({
      kind: 'signature',
      dataUrl: canvas.toDataURL('image/png'),
      signedAt: new Date().toISOString(),
    });
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!canvas || !context) {
      return;
    }

    context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    onChange({
      kind: 'signature',
      dataUrl: '',
      signedAt: '',
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-border/70 bg-background p-3 shadow-sm">
        <canvas
          ref={canvasRef}
          className="h-48 w-full cursor-crosshair rounded-[22px] bg-muted/10"
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={finishDrawing}
          onPointerLeave={finishDrawing}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {isReady ? 'Draw your signature in the area above.' : 'Preparing signature pad...'}
        </div>
        <Button type="button" variant="outline" onClick={clearSignature} className="rounded-full">
          Clear
        </Button>
      </div>
    </div>
  );
};
