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
    setDebugLog(prev => [...prev.slice(-15), `${new Date().toLocaleTimeString()} ${msg}`]);
  };

  const initialize = useCallback(async () => {
    if (handLandmarkerRef.current || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      addLog(`WASM CDN: ${MEDIAPIPE_WASM_CDN}`);
      const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_CDN);
      addLog('WASM loaded OK');

      addLog(`Model URL: ${MEDIAPIPE_MODEL_URL}`);

      // Verify model file is accessible and not HTML fallback
      const modelCheck = await fetch(MEDIAPIPE_MODEL_URL);
      const contentType = modelCheck.headers.get('content-type') || '';
      const contentLength = modelCheck.headers.get('content-length') || '0';
      addLog(`Model fetch: ${modelCheck.status} type=${contentType} size=${contentLength}`);

      if (!modelCheck.ok) {
        throw new Error(`모델 파일 다운로드 실패 (HTTP ${modelCheck.status})`);
      }
      if (contentType.includes('text/html')) {
        throw new Error(`모델 파일이 HTML로 반환됨 — 서버 배포 문제`);
      }

      const modelBuffer = await modelCheck.arrayBuffer();
      addLog(`Model buffer: ${modelBuffer.byteLength} bytes`);

      if (modelBuffer.byteLength < 100000) {
        throw new Error(`모델 파일 크기 비정상: ${modelBuffer.byteLength} bytes (예상: ~7.8MB)`);
      }

      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetBuffer: new Uint8Array(modelBuffer),
          delegate: 'CPU',
        },
        runningMode: 'IMAGE',
        numHands: 1,
        minHandDetectionConfidence: MIN_HAND_DETECTION_CONFIDENCE,
        minHandPresenceConfidence: MIN_HAND_PRESENCE_CONFIDENCE,
        minTrackingConfidence: MIN_TRACKING_CONFIDENCE,
      });

      addLog('HandLandmarker created (IMAGE, CPU)');
      handLandmarkerRef.current = handLandmarker;
      setIsReady(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`INIT FAILED: ${msg}`);
      setError(`손 인식 모델 로드 실패: ${msg}`);
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
        const result = handLandmarkerRef.current.detect(videoFrame);
        if (result.landmarks && result.landmarks.length > 0) {
          lastResultRef.current = `OK: ${result.landmarks[0].length} pts`;
          detectErrorRef.current = null;
          return result.landmarks[0] as HandLandmark[];
        }
        lastResultRef.current = `empty: landmarks=${result.landmarks?.length ?? 'null'}`;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        lastResultRef.current = `ERROR: ${msg}`;
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
