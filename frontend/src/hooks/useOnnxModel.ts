import { useState, useEffect, useRef, useCallback } from 'react';
import * as ort from 'onnxruntime-web';
import { MODEL_PATH, MODEL_META_PATH, API_BASE_URL } from '../lib/constants';
import { calculateMSE, classifyGrip } from '../lib/gripClassifier';
import type { ModelMeta } from '../types';

export function useOnnxModel() {
  const sessionRef = useRef<ort.InferenceSession | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [meta, setMeta] = useState<ModelMeta | null>(null);
  const [threshold, setThreshold] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadModel() {
      try {
        // Load model metadata (architecture info + fallback threshold)
        const metaRes = await fetch(MODEL_META_PATH);
        const metaData: ModelMeta = await metaRes.json();
        if (cancelled) return;
        setMeta(metaData);

        // Fetch threshold from backend API, fallback to model_meta value
        let activeThreshold = metaData.threshold_train95;
        try {
          const threshRes = await fetch(`${API_BASE_URL}/api/settings/threshold`);
          if (threshRes.ok) {
            const threshData = await threshRes.json();
            activeThreshold = threshData.threshold;
          }
        } catch {
          console.warn('Threshold API unavailable, using model_meta default');
        }
        if (cancelled) return;
        setThreshold(activeThreshold);

        ort.env.wasm.numThreads = 1;

        const session = await ort.InferenceSession.create(MODEL_PATH, {
          executionProviders: ['wasm'],
        });
        if (cancelled) return;
        sessionRef.current = session;
        setIsLoaded(true);
      } catch (err) {
        if (!cancelled) {
          setError('분석 모델을 로드하는 데 실패했습니다.');
          console.error('ONNX load error:', err);
        }
      }
    }

    loadModel();
    return () => { cancelled = true; };
  }, []);

  const refreshThreshold = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings/threshold`);
      if (res.ok) {
        const data = await res.json();
        setThreshold(data.threshold);
      }
    } catch {
      // silent fail
    }
  }, []);

  const runInference = async (
    keypoints: Float32Array
  ): Promise<{
    reconstructionError: number;
    isCorrectGrip: boolean;
    confidence: number;
  }> => {
    if (!sessionRef.current || threshold === null) {
      throw new Error('Model not loaded');
    }

    const inputTensor = new ort.Tensor('float32', keypoints, [1, 63]);
    const results = await sessionRef.current.run({ keypoints: inputTensor });
    const output = results.reconstructed.data as Float32Array;

    const mse = calculateMSE(keypoints, output);
    const { isCorrect, confidence } = classifyGrip(mse, threshold);

    return { reconstructionError: mse, isCorrectGrip: isCorrect, confidence };
  };

  return { isLoaded, error, meta, threshold, refreshThreshold, runInference };
}
