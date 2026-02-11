import { useState, useEffect, useRef } from 'react';
import * as ort from 'onnxruntime-web';
import { MODEL_PATH, MODEL_META_PATH } from '../lib/constants';
import { calculateMSE, classifyGrip } from '../lib/gripClassifier';
import type { ModelMeta } from '../types';

export function useOnnxModel() {
  const sessionRef = useRef<ort.InferenceSession | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [meta, setMeta] = useState<ModelMeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadModel() {
      try {
        const metaRes = await fetch(MODEL_META_PATH);
        const metaData: ModelMeta = await metaRes.json();
        if (cancelled) return;
        setMeta(metaData);

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

  const runInference = async (
    keypoints: Float32Array
  ): Promise<{
    reconstructionError: number;
    isCorrectGrip: boolean;
    confidence: number;
  }> => {
    if (!sessionRef.current || !meta) {
      throw new Error('Model not loaded');
    }

    const inputTensor = new ort.Tensor('float32', keypoints, [1, 63]);
    const results = await sessionRef.current.run({ keypoints: inputTensor });
    const output = results.reconstructed.data as Float32Array;

    const mse = calculateMSE(keypoints, output);
    const { isCorrect, confidence } = classifyGrip(mse, meta.threshold_train95);

    return { reconstructionError: mse, isCorrectGrip: isCorrect, confidence };
  };

  return { isLoaded, error, meta, runInference };
}
