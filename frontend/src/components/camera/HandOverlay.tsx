import { useEffect, useRef } from 'react';
import { HAND_CONNECTIONS } from '../../lib/handConnections';
import type { HandLandmark } from '../../types';

interface Props {
  landmarks: HandLandmark[] | null;
  isCorrect: boolean;
  videoWidth: number;
  videoHeight: number;
}

export default function HandOverlay({ landmarks, isCorrect, videoWidth, videoHeight }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = videoWidth;
    canvas.height = videoHeight;
    ctx.clearRect(0, 0, videoWidth, videoHeight);

    if (!landmarks) return;

    const color = isCorrect ? '#4CAF50' : '#F44336';

    // Draw connections
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (const [start, end] of HAND_CONNECTIONS) {
      ctx.beginPath();
      ctx.moveTo(landmarks[start].x * videoWidth, landmarks[start].y * videoHeight);
      ctx.lineTo(landmarks[end].x * videoWidth, landmarks[end].y * videoHeight);
      ctx.stroke();
    }

    // Draw keypoints
    ctx.fillStyle = color;
    for (const lm of landmarks) {
      ctx.beginPath();
      ctx.arc(lm.x * videoWidth, lm.y * videoHeight, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [landmarks, isCorrect, videoWidth, videoHeight]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}
