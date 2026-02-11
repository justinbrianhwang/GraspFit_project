export function calculateMSE(input: Float32Array, output: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < input.length; i++) {
    const diff = input[i] - output[i];
    sum += diff * diff;
  }
  return sum / input.length;
}

export function classifyGrip(mse: number, threshold: number): {
  isCorrect: boolean;
  confidence: number;
} {
  const isCorrect = mse <= threshold;
  const confidence = isCorrect
    ? Math.max(0, Math.min(1, 1 - mse / threshold))
    : Math.min(1, (mse - threshold) / threshold);

  return { isCorrect, confidence };
}
