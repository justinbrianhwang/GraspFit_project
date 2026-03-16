import { useRef, useState, useCallback } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { MEDIAPIPE_WASM_CDN, MEDIAPIPE_MODEL_URL, MIN_HAND_CONFIDENCE } from '../lib/constants';
import type { HandLandmark } from '../types';

export function useMediaPipe() {
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialize = useCallback(async () => {
    if (handLandmarkerRef.current || isLoading) return;
    setIsLoading(true);
    try {
      console.log('[MediaPipe] Loading WASM from:', MEDIAPIPE_WASM_CDN);
      const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_CDN);
      console.log('[MediaPipe] WASM loaded, creating HandLandmarker...');

      // Use CPU delegate for maximum compatibility
      // GPU delegate can silently fail on many mobile/desktop browsers
      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MEDIAPIPE_MODEL_URL,
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
        minHandDetectionConfidence: MIN_HAND_CONFIDENCE,
        minHandPresenceConfidence: MIN_HAND_CONFIDENCE,
        minTrackingConfidence: MIN_HAND_CONFIDENCE,
      });

      console.log('[MediaPipe] HandLandmarker created successfully');
      handLandmarkerRef.current = handLandmarker;
      setIsReady(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`손 인식 모델 로드 실패: ${msg}`);
      console.error('[MediaPipe] Init error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const detectHand = useCallback(
    (videoFrame: HTMLVideoElement, timestamp: number): HandLandmark[] | null => {
      if (!handLandmarkerRef.current) return null;
      // Ensure video has frame data available
      if (videoFrame.readyState < 2) return null;
      try {
        const result = handLandmarkerRef.current.detectForVideo(videoFrame, timestamp);
        if (result.landmarks && result.landmarks.length > 0) {
          return result.landmarks[0] as HandLandmark[];
        }
      } catch (err) {
        console.error('[MediaPipe] detectForVideo error:', err);
      }
      return null;
    },
    []
  );

  const destroy = useCallback(() => {
    handLandmarkerRef.current?.close();
    handLandmarkerRef.current = null;
    setIsReady(false);
  }, []);

  return { initialize, isReady, isLoading, error, detectHand, destroy };
}
