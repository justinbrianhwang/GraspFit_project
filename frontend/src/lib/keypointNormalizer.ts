import type { HandLandmark } from '../types';

/**
 * Normalize 21 MediaPipe hand landmarks to wrist-relative coordinates.
 * k0 (wrist) becomes [0,0,0], all others are relative to wrist.
 */
export function normalizeKeypoints(landmarks: HandLandmark[]): Float32Array {
  const wrist = landmarks[0];
  const result = new Float32Array(63);

  for (let i = 0; i < 21; i++) {
    result[i * 3 + 0] = landmarks[i].x - wrist.x;
    result[i * 3 + 1] = landmarks[i].y - wrist.y;
    result[i * 3 + 2] = landmarks[i].z - wrist.z;
  }

  return result;
}
