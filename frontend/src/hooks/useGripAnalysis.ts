import { useRef, useState, useCallback } from 'react';
import { useMediaPipe } from './useMediaPipe';
import { useOnnxModel } from './useOnnxModel';
import { normalizeKeypoints } from '../lib/keypointNormalizer';
import { SMOOTHING_BUFFER_SIZE, TARGET_FPS } from '../lib/constants';
import type { AnalysisResult, HandLandmark } from '../types';

export function useGripAnalysis() {
  const mediaPipe = useMediaPipe();
  const onnxModel = useOnnxModel();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastResult, setLastResult] = useState<AnalysisResult | null>(null);
  const [rawLandmarks, setRawLandmarks] = useState<HandLandmark[] | null>(null);
  const [handDetected, setHandDetected] = useState(false);

  const animFrameRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const resultBufferRef = useRef<boolean[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const frameInterval = 1000 / TARGET_FPS;

  const startAnalysis = useCallback(
    (video: HTMLVideoElement) => {
      videoRef.current = video;
      setIsAnalyzing(true);
      resultBufferRef.current = [];

      const analyzeFrame = async (now: number) => {
        if (!videoRef.current || videoRef.current.paused) {
          animFrameRef.current = requestAnimationFrame(analyzeFrame);
          return;
        }

        if (now - lastFrameTimeRef.current < frameInterval) {
          animFrameRef.current = requestAnimationFrame(analyzeFrame);
          return;
        }
        lastFrameTimeRef.current = now;

        const timestamp = performance.now();
        const landmarks = mediaPipe.detectHand(videoRef.current, timestamp);

        if (landmarks) {
          setHandDetected(true);
          setRawLandmarks(landmarks);

          try {
            const normalized = normalizeKeypoints(landmarks);
            const result = await onnxModel.runInference(normalized);

            resultBufferRef.current.push(result.isCorrectGrip);
            if (resultBufferRef.current.length > SMOOTHING_BUFFER_SIZE) {
              resultBufferRef.current.shift();
            }
            const correctCount = resultBufferRef.current.filter(Boolean).length;
            const smoothedCorrect = correctCount > SMOOTHING_BUFFER_SIZE / 2;

            setLastResult({
              isCorrectGrip: smoothedCorrect,
              confidence: result.confidence,
              reconstructionError: result.reconstructionError,
              landmarks,
              timestamp,
            });
          } catch {
            // Skip frame on inference error
          }
        } else {
          setHandDetected(false);
          setRawLandmarks(null);
        }

        animFrameRef.current = requestAnimationFrame(analyzeFrame);
      };

      animFrameRef.current = requestAnimationFrame(analyzeFrame);
    },
    [mediaPipe, onnxModel, frameInterval]
  );

  const stopAnalysis = useCallback(() => {
    setIsAnalyzing(false);
    cancelAnimationFrame(animFrameRef.current);
    resultBufferRef.current = [];
    setLastResult(null);
    setHandDetected(false);
    setRawLandmarks(null);
  }, []);

  return {
    initMediaPipe: mediaPipe.initialize,
    mpReady: mediaPipe.isReady,
    mpLoading: mediaPipe.isLoading,
    mpError: mediaPipe.error,
    destroyMediaPipe: mediaPipe.destroy,
    modelReady: onnxModel.isLoaded,
    modelError: onnxModel.error,
    threshold: onnxModel.meta?.threshold_train95,
    isAnalyzing,
    lastResult,
    rawLandmarks,
    handDetected,
    startAnalysis,
    stopAnalysis,
  };
}
