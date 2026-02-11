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
      const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_CDN);
      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MEDIAPIPE_MODEL_URL,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
        minHandDetectionConfidence: MIN_HAND_CONFIDENCE,
        minHandPresenceConfidence: MIN_HAND_CONFIDENCE,
        minTrackingConfidence: MIN_HAND_CONFIDENCE,
      });
      handLandmarkerRef.current = handLandmarker;
      setIsReady(true);
    } catch (err) {
      setError('손 인식 모델을 로드하는 데 실패했습니다.');
      console.error('MediaPipe init error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const detectHand = useCallback(
    (videoFrame: HTMLVideoElement, timestamp: number): HandLandmark[] | null => {
      if (!handLandmarkerRef.current) return null;
      try {
        const result = handLandmarkerRef.current.detectForVideo(videoFrame, timestamp);
        if (result.landmarks && result.landmarks.length > 0) {
          return result.landmarks[0] as HandLandmark[];
        }
      } catch {
        // Frame detection can occasionally fail
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
