import { useRef, useState, useCallback } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import {
  MEDIAPIPE_WASM_CDN,
  MEDIAPIPE_MODEL_URL,
  MIN_HAND_DETECTION_CONFIDENCE,
  MIN_HAND_PRESENCE_CONFIDENCE,
  MIN_TRACKING_CONFIDENCE,
} from '../lib/constants';
import type { HandLandmark } from '../types';

export function useMediaPipe() {
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialize = useCallback(async () => {
    if (handLandmarkerRef.current || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      console.log('[MediaPipe] Loading WASM from:', MEDIAPIPE_WASM_CDN);
      const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_CDN);
      console.log('[MediaPipe] WASM loaded OK');

      console.log('[MediaPipe] Loading model from:', MEDIAPIPE_MODEL_URL);
      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MEDIAPIPE_MODEL_URL,
          delegate: 'CPU',
        },
        runningMode: 'IMAGE',
        numHands: 1,
        minHandDetectionConfidence: MIN_HAND_DETECTION_CONFIDENCE,
        minHandPresenceConfidence: MIN_HAND_PRESENCE_CONFIDENCE,
        minTrackingConfidence: MIN_TRACKING_CONFIDENCE,
      });

      console.log('[MediaPipe] HandLandmarker created OK (IMAGE mode, CPU)');
      handLandmarkerRef.current = handLandmarker;
      setIsReady(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[MediaPipe] Init FAILED:', err);
      setError(`손 인식 모델 로드 실패: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const detectHand = useCallback(
    (videoFrame: HTMLVideoElement): HandLandmark[] | null => {
      if (!handLandmarkerRef.current) return null;
      if (videoFrame.readyState < 2) return null;
      try {
        const result = handLandmarkerRef.current.detect(videoFrame);
        if (result.landmarks && result.landmarks.length > 0) {
          return result.landmarks[0] as HandLandmark[];
        }
      } catch (err) {
        console.error('[MediaPipe] detect error:', err);
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
