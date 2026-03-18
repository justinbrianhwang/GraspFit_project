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
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const detectCountRef = useRef(0);
  const detectErrorRef = useRef<string | null>(null);
  const lastResultRef = useRef<string>('none');

  const addLog = (msg: string) => {
    console.log(`[MediaPipe] ${msg}`);
    setDebugLog(prev => [...prev.slice(-20), `${new Date().toLocaleTimeString()} ${msg}`]);
  };

  const initialize = useCallback(async () => {
    if (handLandmarkerRef.current || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      addLog(`WASM: ${MEDIAPIPE_WASM_CDN}`);
      const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_CDN);
      addLog('WASM OK');

      addLog(`Model: ${MEDIAPIPE_MODEL_URL}`);

      // Verify model file is served correctly
      const check = await fetch(MEDIAPIPE_MODEL_URL, { method: 'HEAD' });
      const ct = check.headers.get('content-type') || '';
      const cl = check.headers.get('content-length') || '?';
      addLog(`HEAD: ${check.status} type=${ct} size=${cl}`);

      if (ct.includes('text/html')) {
        throw new Error('모델이 HTML로 반환됨 — 배포 문제');
      }

      // Use modelAssetPath — let MediaPipe fetch the model internally
      addLog('Creating HandLandmarker (modelAssetPath)...');
      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MEDIAPIPE_MODEL_URL,
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
        minHandDetectionConfidence: MIN_HAND_DETECTION_CONFIDENCE,
        minHandPresenceConfidence: MIN_HAND_PRESENCE_CONFIDENCE,
        minTrackingConfidence: MIN_TRACKING_CONFIDENCE,
      });

      addLog('HandLandmarker CREATED OK');
      handLandmarkerRef.current = handLandmarker;
      setIsReady(true);
      addLog('MP READY = true');
    } catch (err) {
      const msg = err instanceof Error
        ? `${err.message}\n${err.stack?.split('\n').slice(0, 3).join('\n')}`
        : String(err);
      addLog(`INIT FAILED: ${msg}`);
      setError(`초기화 실패: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const detectHand = useCallback(
    (videoFrame: HTMLVideoElement): HandLandmark[] | null => {
      detectCountRef.current++;

      if (!handLandmarkerRef.current) {
        lastResultRef.current = 'no-landmarker';
        return null;
      }
      if (videoFrame.readyState < 2) {
        lastResultRef.current = `readyState=${videoFrame.readyState}`;
        return null;
      }

      try {
        const ts = performance.now();
        const result = handLandmarkerRef.current.detectForVideo(videoFrame, ts);
        if (result.landmarks && result.landmarks.length > 0) {
          lastResultRef.current = `OK: ${result.landmarks[0].length} pts`;
          detectErrorRef.current = null;
          return result.landmarks[0] as HandLandmark[];
        }
        lastResultRef.current = `empty (${result.landmarks?.length ?? 'null'})`;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        lastResultRef.current = `ERR: ${msg.slice(0, 60)}`;
        detectErrorRef.current = msg;
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

  return {
    initialize, isReady, isLoading, error, detectHand, destroy,
    debugLog, detectCountRef, lastResultRef, detectErrorRef,
  };
}
